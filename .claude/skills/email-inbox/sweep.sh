#!/bin/bash
# Execute a whole triage pass in one go: file, mark and park many messages
# with a single AppleScript run.
#
# move.sh and mark.sh each open Mail, walk the whole mailbox and act on one
# match. Filing fifteen messages that way is fifteen walks of the inbox and
# takes minutes. This script takes a plan file, resolves every destination up
# front, walks the inbox once, and does the lot. Use it for the bulk pass of a
# triage run; use move.sh / mark.sh for one-off corrections.
#
# Usage:
#   ./sweep.sh --plan /tmp/sweep.tsv --dry-run
#   ./sweep.sh --plan /tmp/sweep.tsv
#   ./sweep.sh --state                          show watermark, parked, awaiting
#   ./sweep.sh --settle                         check awaiting rows against Sent Items, then show state
#   ./sweep.sh --park "<id>" --note "why"       park one message by hand
#   ./sweep.sh --unpark "<id>"
#
# Arguments:
#   --plan FILE       the plan to execute (see format below)
#   --account NAME    profile slug, Apple Mail account name, or address
#   --from-mailbox N  mailbox to act on (default: the profile's inbox)
#   --dry-run         report what would happen, change nothing, touch no state
#   --state           print this account's state file and exit
#   --settle          look each awaiting row up in Sent Items (via Mail's own
#                     index, read-only); drop the rows whose reply has gone,
#                     report the rest, then print the state. With --dry-run it
#                     reports without dropping anything.
#   --park ID         add a message id to the parked list and exit
#   --unpark ID       remove a message id from the parked list and exit
#   --note TEXT       note stored alongside --park
#
# Plan file format: one message per line, tab-separated, # comments ignored.
#
#   <message-id>  file        Awards 26 Sponsors   mark read, then file there
#   <message-id>  file-unread Awards 26 Sponsors   file without marking read
#   <message-id>  read                             mark read, leave in inbox
#   <message-id>  flag                             flag, leave in inbox
#   <message-id>  awaiting    Awards 26 Sponsors   filed, reply drafted not yet sent
#   <message-id>  park        reminder note        leave completely untouched
#
# Angle brackets on ids are optional. A fourth column is a free-text note and
# is ignored except on park/awaiting rows, where it is stored.
#
# `park` is the important one. Some messages sit in the inbox on purpose, as
# the owner's own reminders. Parking records the id in this account's state file so
# later runs skip them in silence instead of proposing the same action every
# time. Parked messages are never marked, never moved, and their unread status
# is left exactly as it is.
#
# --swept-at sets the watermark explicitly. Pass the moment the inbox was READ,
# not the moment the sweep runs: a run takes minutes to classify and draft, and
# anything arriving in between is otherwise stamped below the watermark and never
# shows up as new again. (Three messages nearly went this way on 22 Sep 2026.)
# Without it the watermark is the time the sweep finished, which is only safe for
# a sweep with no drafting in it.
#
# State lives in <accounts dir>/state/<slug>.tsv:
#   swept     <ISO timestamp>            when the last real (non dry-run) sweep ran
#   parked    <id>  <date>  <note>       deliberate inbox reminders
#   awaiting  <id>  <date>  <note>       filed, reply drafted, send not confirmed
# Parked rows are pruned once their message leaves the inbox, so a reminder
# the owner deals with by hand drops out on its own. Awaiting rows point at mail
# that has already been filed, so they age out after two weeks instead.

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ACCOUNT_ARG=""
FROM_MAILBOX=""
PLAN=""
DRY_RUN=false
SHOW_STATE=false
PARK_ID=""
UNPARK_ID=""
NOTE=""
SWEPT_AT=""
SETTLE=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --plan) PLAN="$2"; shift 2 ;;
        --account) ACCOUNT_ARG="$2"; shift 2 ;;
        --from-mailbox) FROM_MAILBOX="$2"; shift 2 ;;
        --dry-run) DRY_RUN=true; shift ;;
        --state) SHOW_STATE=true; shift ;;
        --settle) SETTLE=true; SHOW_STATE=true; shift ;;
        --park) PARK_ID="$2"; shift 2 ;;
        --unpark) UNPARK_ID="$2"; shift 2 ;;
        --note) NOTE="$2"; shift 2 ;;
        --swept-at) SWEPT_AT="$2"; shift 2 ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
done

resolve_account "$ACCOUNT_ARG"
[[ -n "$FROM_MAILBOX" ]] || FROM_MAILBOX="$(default_inbox)"

SLUG=""
[[ -n "$PROFILE" ]] && SLUG="$(fm_get "$PROFILE" name)"
[[ -n "$SLUG" ]] || SLUG="$(printf '%s' "$ACCOUNT" | tr ' /' '--' | tr '[:upper:]' '[:lower:]')"

STATE_DIR="$(accounts_dir)/state"
STATE_FILE="$STATE_DIR/$SLUG.tsv"
mkdir -p "$STATE_DIR"
[[ -f "$STATE_FILE" ]] || printf '# email-inbox state for %s\n' "$SLUG" > "$STATE_FILE"

strip_brackets() { local v="$1"; v="${v#<}"; v="${v%>}"; printf '%s' "$v"; }
now_iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }
today() { date +%Y-%m-%d; }

state_add() {  # kind id note
    local kind="$1" id="$2" note="$3"
    state_remove "$id"
    printf '%s\t%s\t%s\t%s\n' "$kind" "$id" "$(today)" "$note" >> "$STATE_FILE"
}

state_remove() {  # id
    local id="$1" tmp
    tmp="$(mktemp)"
    awk -F'\t' -v id="$id" '$2 != id' "$STATE_FILE" > "$tmp" && mv "$tmp" "$STATE_FILE"
}

# --settle: an awaiting row means "reply drafted, send not seen". Most of them
# have gone by the next run, so check Sent Items rather than asking. Mail's
# Envelope Index is read directly (read-only): the original is found by its
# Message-ID header, and a reply counts as sent if a message in this account's
# Sent mailbox shares its conversation (or its subject) and was sent after the
# original arrived.
if [[ "$SETTLE" == true ]]; then
    UUID=""
    [[ -n "$PROFILE" ]] && UUID="$(fm_get "$PROFILE" account_uuid)"
    DB="$(ls -d "$HOME"/Library/Mail/V*/MailData/"Envelope Index" 2>/dev/null | tail -1)"
    if [[ -z "$UUID" ]]; then
        echo "Settle skipped: the profile has no account_uuid." >&2
    elif [[ -z "$DB" ]] || ! sqlite3 -readonly "file:$DB?mode=ro" "select 1;" >/dev/null 2>&1; then
        echo "Settle skipped: cannot read Mail's index (Full Disk Access for the terminal?). Check Sent Items with the MCP instead." >&2
    else
        SENT_N=0; OPEN_N=0
        while IFS=$'\t' read -r kind id when note; do
            [[ "$kind" == awaiting ]] || continue
            qid="${id//\'/\'\'}"
            row="$(sqlite3 -readonly -separator $'\t' "file:$DB?mode=ro" "
                SELECT s.subject,
                  (SELECT strftime('%Y-%m-%d %H:%M', max(r.date_sent), 'unixepoch', 'localtime')
                     FROM messages r JOIN mailboxes rb ON rb.ROWID = r.mailbox
                    WHERE rb.url LIKE '%://$UUID/%' AND rb.url LIKE '%/Sent%'
                      AND r.deleted = 0 AND r.date_sent > m.date_received
                      AND ((m.conversation_id <> 0 AND r.conversation_id = m.conversation_id)
                           OR r.subject = m.subject))
                FROM message_global_data g
                JOIN messages m ON m.message_id = g.message_id
                JOIN subjects s ON s.ROWID = m.subject
                WHERE g.message_id_header IN ('<$qid>', '$qid')
                LIMIT 1;" 2>/dev/null)"
            subject="${row%%$'\t'*}"
            sent_at=""
            [[ "$row" == *$'\t'* ]] && sent_at="${row#*$'\t'}"
            if [[ -z "$row" ]]; then
                printf 'unknown  %s  (%s; not in Mail'"'"'s index)\n' "$id" "$note"
                OPEN_N=$((OPEN_N + 1))
            elif [[ -n "$sent_at" ]]; then
                printf 'sent     %s  %s  (%s)\n' "$sent_at" "$subject" "$note"
                [[ "$DRY_RUN" == true ]] || state_remove "$id"
                SENT_N=$((SENT_N + 1))
            else
                printf 'unsent   %s  (%s; drafted %s)\n' "$subject" "$note" "$when"
                OPEN_N=$((OPEN_N + 1))
            fi
        done < <(grep -v '^#' "$STATE_FILE")
        if [[ $((SENT_N + OPEN_N)) -eq 0 ]]; then
            echo "Nothing awaiting a send."
        elif [[ "$DRY_RUN" == true ]]; then
            echo "Dry run: $SENT_N sent, $OPEN_N still open; state unchanged."
        else
            echo "Settled: $SENT_N sent and cleared, $OPEN_N still open."
        fi
        echo
    fi
fi

if [[ "$SHOW_STATE" == true ]]; then
    echo "Account: $ACCOUNT (profile: ${SLUG})"
    echo "State:   $STATE_FILE"
    echo
    if [[ -s "$STATE_FILE" ]] && grep -qv '^#' "$STATE_FILE"; then
        grep -v '^#' "$STATE_FILE"
    else
        echo "(no state yet: nothing swept, nothing parked)"
    fi
    exit 0
fi

if [[ -n "$PARK_ID" ]]; then
    state_add parked "$(strip_brackets "$PARK_ID")" "$NOTE"
    echo "Parked: $PARK_ID"
    exit 0
fi

if [[ -n "$UNPARK_ID" ]]; then
    state_remove "$(strip_brackets "$UNPARK_ID")"
    echo "Unparked: $UNPARK_ID"
    exit 0
fi

if [[ -z "$PLAN" ]]; then
    echo "Error: --plan FILE is required (or use --state / --park / --unpark)" >&2
    exit 1
fi
if [[ ! -f "$PLAN" ]]; then
    echo "Error: no plan file at $PLAN" >&2
    exit 1
fi

# Parse the plan. Park rows never reach AppleScript: parking is a state-file
# operation and must not touch the message.
AS_IDS=""
AS_ACTIONS=""
AS_ARGS=""
PARK_ROWS=()
AWAIT_ROWS=()
COUNT=0

while IFS=$'\t' read -r col1 col2 col3 col4 || [[ -n "$col1" ]]; do
    [[ -z "$col1" || "$col1" == \#* ]] && continue
    id="$(strip_brackets "$(printf '%s' "$col1" | tr -d '\r')")"
    action="$(printf '%s' "$col2" | tr -d '\r' | tr '[:upper:]' '[:lower:]')"
    arg="$(printf '%s' "$col3" | tr -d '\r')"
    note="$(printf '%s' "$col4" | tr -d '\r')"

    case "$action" in
        park)
            PARK_ROWS+=("$id"$'\t'"${arg}${note:+ $note}")
            continue
            ;;
        awaiting)
            AWAIT_ROWS+=("$id"$'\t'"$note")
            ;;
        file|file-unread|read|flag) ;;
        "")
            echo "Error: plan line for $id has no action" >&2; exit 1 ;;
        *)
            echo "Error: unknown action '$action' for $id" >&2; exit 1 ;;
    esac

    if [[ "$action" == file || "$action" == file-unread || "$action" == awaiting ]]; then
        if [[ -z "$arg" ]]; then
            echo "Error: action '$action' for $id needs a destination mailbox" >&2
            exit 1
        fi
    fi

    [[ -n "$AS_IDS" ]] && { AS_IDS+=", "; AS_ACTIONS+=", "; AS_ARGS+=", "; }
    AS_IDS+="\"$(as_escape "$id")\""
    AS_ACTIONS+="\"$(as_escape "$action")\""
    AS_ARGS+="\"$(as_escape "$arg")\""
    COUNT=$((COUNT + 1))
done < "$PLAN"

if [[ $COUNT -eq 0 && ${#PARK_ROWS[@]} -eq 0 ]]; then
    echo "Plan is empty: nothing to do."
    exit 0
fi

if [[ $COUNT -eq 0 ]]; then
    AS_IDS='"__none__"'; AS_ACTIONS='"read"'; AS_ARGS='""'
fi

E_ACCOUNT="$(as_escape "$ACCOUNT")"
E_FROM="$(as_escape "$FROM_MAILBOX")"

SCRIPT_FILE=/tmp/mail-sweep.applescript
cat > "$SCRIPT_FILE" << APPLESCRIPT
set accountName to "$E_ACCOUNT"
set sourceName to "$E_FROM"
set planIds to {$AS_IDS}
set planActions to {$AS_ACTIONS}
set planArgs to {$AS_ARGS}
set dryRun to $DRY_RUN

set output to ""
set inboxIds to ""

on mailboxPath(mb)
    tell application "Mail"
        set pathStr to name of mb
        set parentBox to mb
        repeat
            try
                set parentBox to container of parentBox
                set parentName to name of parentBox
                if parentName is missing value then exit repeat
                set pathStr to parentName & "/" & pathStr
            on error
                exit repeat
            end try
        end repeat
    end tell
    return pathStr
end mailboxPath

-- Resolve one destination spec to a mailbox reference. A "/" in the spec
-- matches on the full path; a bare name matches on the leaf, and an ambiguous
-- leaf is an error rather than a guess.
on resolveBox(destSpec, accountName)
    set destLeaf to destSpec
    if destSpec contains "/" then
        set savedDelims to AppleScript's text item delimiters
        set AppleScript's text item delimiters to "/"
        set destLeaf to last text item of destSpec
        set AppleScript's text item delimiters to savedDelims
    end if
    set foundBox to missing value
    set foundPath to ""
    set matches to 0
    tell application "Mail"
        repeat with mb in mailboxes of account accountName
            try
                if (name of mb) is destLeaf then
                    set thisPath to my mailboxPath(mb)
                    if destSpec contains "/" then
                        if thisPath is destSpec or thisPath ends with ("/" & destSpec) then
                            set foundBox to contents of mb
                            set foundPath to thisPath
                            set matches to matches + 1
                        end if
                    else
                        set matches to matches + 1
                        if foundBox is missing value then
                            set foundBox to contents of mb
                            set foundPath to thisPath
                        end if
                    end if
                end if
            end try
        end repeat
    end tell
    return {box:foundBox, boxPath:foundPath, hits:matches}
end resolveBox

-- Resolve every destination before touching a single message: a plan that
-- names a folder that does not exist should fail whole, not half.
set destSpecs to {}
set destBoxes to {}
set destPaths to {}
repeat with i from 1 to count of planActions
    set act to item i of planActions
    if act is "file" or act is "file-unread" or act is "awaiting" then
        set spec to item i of planArgs
        set known to false
        repeat with j from 1 to count of destSpecs
            if item j of destSpecs is spec then set known to true
        end repeat
        if not known then
            set res to my resolveBox(spec, accountName)
            if hits of res is 0 then return "ERROR: no mailbox named " & spec & " on account " & accountName
            if hits of res > 1 then return "ERROR: ambiguous destination " & spec & ", re-run the plan with its full path"
            set end of destSpecs to spec
            set end of destBoxes to box of res
            set end of destPaths to boxPath of res
        end if
    end if
end repeat

tell application "Mail"
    set sourceBox to missing value
    repeat with mb in mailboxes of account accountName
        if (name of mb) is sourceName then set sourceBox to contents of mb
    end repeat
    if sourceBox is missing value then return "ERROR: no mailbox named " & sourceName & " on account " & accountName

    -- Plural property access in one Apple Event, rather than one round trip
    -- per message per property: the difference between seconds and minutes on
    -- a busy inbox.
    set msgs to (every message of sourceBox)
    set allIds to message id of every message of sourceBox
    set allSubjects to subject of every message of sourceBox

    set movers to {}
    set moverDests to {}
    set seen to {}
    repeat with i from 1 to count of planIds
        set end of seen to false
    end repeat

    repeat with k from 1 to count of allIds
        set mid to item k of allIds
        set inboxIds to inboxIds & "#ID:" & mid & linefeed
        set idx to 0
        repeat with i from 1 to count of planIds
            if (item i of planIds) is mid then
                set idx to i
                exit repeat
            end if
        end repeat
        if idx > 0 then
            set item idx of seen to true
            set act to item idx of planActions
            set subj to item k of allSubjects
            set m to contents of (item k of msgs)

            if act is "read" then
                if not dryRun then set read status of m to true
                set output to output & "READ:  " & subj & linefeed
            else if act is "flag" then
                if not dryRun then
                    set flagged status of m to true
                    set read status of m to true
                end if
                set output to output & "FLAG:  " & subj & linefeed
            else
                -- file, file-unread, awaiting
                set spec to item idx of planArgs
                set destPath to ""
                repeat with j from 1 to count of destSpecs
                    if item j of destSpecs is spec then
                        set end of movers to m
                        set end of moverDests to item j of destBoxes
                        set destPath to item j of destPaths
                    end if
                end repeat
                if act is not "file-unread" then
                    if not dryRun then set read status of m to true
                end if
                if act is "awaiting" then
                    set output to output & "SENT?: " & subj & "  ->  " & destPath & linefeed
                else
                    set output to output & "FILED: " & subj & "  ->  " & destPath & linefeed
                end if
            end if
        end if
    end repeat

    -- Collect first, move second. Moving while walking a mailbox's messages
    -- shifts the list underneath the loop and silently skips messages.
    if not dryRun then
        repeat with i from 1 to count of movers
            move (item i of movers) to (item i of moverDests)
        end repeat
    end if

    repeat with i from 1 to count of planIds
        if not (item i of seen) then
            if (item i of planIds) is not "__none__" then
                set output to output & "MISSING: " & (item i of planIds) & " is not in " & sourceName & linefeed
            end if
        end if
    end repeat
end tell

return output & inboxIds
APPLESCRIPT

if [[ "$DRY_RUN" == true ]]; then
    echo "DRY RUN — nothing will change. Account: $ACCOUNT, mailbox: $FROM_MAILBOX"
else
    echo "Sweeping $FROM_MAILBOX on account $ACCOUNT:"
fi

RESULT="$(osascript "$SCRIPT_FILE")"
STATUS=$?

if [[ $STATUS -ne 0 ]]; then
    echo "$RESULT"
    exit $STATUS
fi

if [[ "$RESULT" == ERROR:* ]]; then
    echo "$RESULT" >&2
    echo "Nothing was changed." >&2
    exit 1
fi

# #ID: lines are the inbox's current contents, used to prune stale state rows.
printf '%s\n' "$RESULT" | grep -v '^#ID:' | grep -v '^[[:space:]]*$'

if [[ "$DRY_RUN" == true ]]; then
    echo
    echo "(dry run: no mail moved, no state written)"
    [[ ${#PARK_ROWS[@]} -gt 0 ]] && echo "Would park ${#PARK_ROWS[@]} message(s)."
    exit 0
fi

for row in "${PARK_ROWS[@]}"; do
    state_add parked "${row%%$'\t'*}" "${row#*$'\t'}"
done
for row in "${AWAIT_ROWS[@]}"; do
    state_add awaiting "${row%%$'\t'*}" "${row#*$'\t'}"
done

# Prune state that has served its purpose. A parked row whose message has left
# the inbox was dealt with by hand, so the reminder is spent. An awaiting row
# points at a message this sweep has just filed, so inbox presence says nothing
# about it: those age out instead, after two weeks.
INBOX_IDS="$(printf '%s\n' "$RESULT" | sed -n 's/^#ID://p')"
CUTOFF="$(date -v-14d +%Y-%m-%d 2>/dev/null || date -d '14 days ago' +%Y-%m-%d)"
TMP_STATE="$(mktemp)"
{
    grep '^#' "$STATE_FILE" || true
    while IFS=$'\t' read -r kind id date note; do
        [[ -z "$kind" || "$kind" == \#* ]] && continue
        case "$kind" in
            swept) continue ;;
            parked)
                printf '%s\n' "$INBOX_IDS" | grep -qxF "$id" || continue ;;
            awaiting)
                [[ "$date" < "$CUTOFF" ]] && continue ;;
        esac
        printf '%s\t%s\t%s\t%s\n' "$kind" "$id" "$date" "$note"
    done < <(grep -v '^#' "$STATE_FILE")
    printf 'swept\t%s\t%s\n' "${SWEPT_AT:-$(now_iso)}" "$FROM_MAILBOX"
} > "$TMP_STATE"
mv "$TMP_STATE" "$STATE_FILE"

echo
PARKED_NOW="$(grep -c '^parked' "$STATE_FILE" || true)"
AWAIT_NOW="$(grep -c '^awaiting' "$STATE_FILE" || true)"
echo "State: ${PARKED_NOW:-0} parked, ${AWAIT_NOW:-0} awaiting send. ($STATE_FILE)"
