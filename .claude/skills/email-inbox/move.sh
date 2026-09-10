#!/bin/bash
# File messages into a mailbox in Apple Mail.
#
# The apple-mail-readonly MCP cannot move mail by design, so filing goes
# through here.
#
# Usage:
#   ./move.sh --to "Awards 26 Sponsors" --message-id "<id>"
#   ./move.sh --to "Electoral/Awards 26 Sponsors" --sender "raj@adaga.in" --all
#   ./move.sh --to "BSVA" --subject "workshop" --dry-run
#
# Arguments:
#   --to NAME         destination mailbox (required). Either a leaf name
#                     ("Awards 26 Sponsors") or a path ("Electoral/Awards 26
#                     Sponsors") when the leaf name is ambiguous.
#   --message-id ID   RFC Message-ID. Angle brackets optional.
#   --sender TEXT     match on sender (substring) when no message id is known
#   --subject TEXT    match on subject (substring); combine with --sender
#   --from-mailbox N  mailbox to take messages from (default: Inbox)
#   --account NAME    profile slug, Apple Mail account name, or address
#   --all             move every match, not just the most recent one
#   --dry-run         list what would move, move nothing
#
# Moving mail is the one destructive-ish thing this skill does: a wrong --to
# scatters mail into the wrong folder and there is no undo beyond moving it
# back. Run --dry-run first whenever the match is by sender or subject rather
# than by message id, and confirm the destination with the user.

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ACCOUNT_ARG=""
FROM_MAILBOX=""
DEST=""
MESSAGE_ID=""
SENDER=""
SUBJECT=""
ALL=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --to) DEST="$2"; shift 2 ;;
        --message-id) MESSAGE_ID="$2"; shift 2 ;;
        --sender) SENDER="$2"; shift 2 ;;
        --subject) SUBJECT="$2"; shift 2 ;;
        --from-mailbox) FROM_MAILBOX="$2"; shift 2 ;;
        --account) ACCOUNT_ARG="$2"; shift 2 ;;
        --all) ALL=true; shift ;;
        --dry-run) DRY_RUN=true; shift ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
done

if [[ -z "$DEST" ]]; then
    echo "Error: --to is required" >&2
    exit 1
fi
if [[ -z "$MESSAGE_ID" && -z "$SENDER" && -z "$SUBJECT" ]]; then
    echo "Error: identify the message with --message-id, or --sender / --subject" >&2
    exit 1
fi

resolve_account "$ACCOUNT_ARG"
[[ -n "$FROM_MAILBOX" ]] || FROM_MAILBOX="$(default_inbox)"

MESSAGE_ID="${MESSAGE_ID#<}"
MESSAGE_ID="${MESSAGE_ID%>}"

# A destination given as a path is matched on its full path; a bare name is
# matched on the leaf name.
DEST_LEAF="${DEST##*/}"

E_ACCOUNT="$(as_escape "$ACCOUNT")"
E_FROM="$(as_escape "$FROM_MAILBOX")"
E_DEST="$(as_escape "$DEST")"
E_DEST_LEAF="$(as_escape "$DEST_LEAF")"
E_MESSAGE_ID="$(as_escape "$MESSAGE_ID")"
E_SENDER="$(as_escape "$SENDER")"
E_SUBJECT="$(as_escape "$SUBJECT")"

cat > /tmp/mail-move.applescript << APPLESCRIPT
set accountName to "$E_ACCOUNT"
set sourceName to "$E_FROM"
set destSpec to "$E_DEST"
set destLeaf to "$E_DEST_LEAF"
set wantedId to "$E_MESSAGE_ID"
set wantedSender to "$E_SENDER"
set wantedSubject to "$E_SUBJECT"
set actOnAll to $ALL
set dryRun to $DRY_RUN

set output to ""
set hitCount to 0
set foundSource to false
set destBox to missing value
set destPath to ""
set ambiguous to {}

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

tell application "Mail"
    set acct to account accountName

    -- Resolve the destination. A "/" in the spec means match the full path.
    repeat with mb in mailboxes of acct
        try
            if (name of mb) is destLeaf then
                set thisPath to my mailboxPath(mb)
                -- "contents of" pins the reference. A bare loop variable is a
                -- positional reference (item 5 of every mailbox of account X)
                -- that goes stale once the loop ends, and the move then fails
                -- with error -1728. Backticks are avoided in these comments:
                -- the heredoc is unquoted, so bash would run them.
                if destSpec contains "/" then
                    if thisPath is destSpec or thisPath ends with ("/" & destSpec) then
                        set destBox to contents of mb
                        set destPath to thisPath
                    end if
                else
                    set end of ambiguous to thisPath
                    if destBox is missing value then
                        set destBox to contents of mb
                        set destPath to thisPath
                    end if
                end if
            end if
        end try
    end repeat
end tell

if destBox is missing value then return "No mailbox named " & destSpec & " on account " & accountName
if (count of ambiguous) > 1 then
    set msg to "Ambiguous destination " & destSpec & ". Matches:" & linefeed
    repeat with p in ambiguous
        set msg to msg & "  " & p & linefeed
    end repeat
    return msg & "Re-run with the full path."
end if

tell application "Mail"
    set acct to account accountName
    repeat with mb in mailboxes of acct
        if (name of mb) is sourceName then
            set foundSource to true
            set candidates to {}
            repeat with m in (messages of mb)
                set isMatch to false
                try
                    if wantedId is not "" then
                        if (message id of m) is wantedId then set isMatch to true
                    else
                        set isMatch to true
                        if wantedSender is not "" then
                            if ((sender of m) as string) does not contain wantedSender then set isMatch to false
                        end if
                        if wantedSubject is not "" then
                            if (subject of m) does not contain wantedSubject then set isMatch to false
                        end if
                    end if
                on error
                    set isMatch to false
                end try
                if isMatch then
                    set end of candidates to contents of m
                    if not actOnAll then exit repeat
                end if
            end repeat

            -- Collect first, move second: moving while iterating a mailbox's
            -- messages shifts the list underneath the loop and skips messages.
            -- No blanket try around the move itself: a swallowed failure here
            -- reports a move that did not happen.
            repeat with m in candidates
                set output to output & "MATCH: " & (subject of m) & " | " & ((sender of m) as string) & " | " & ((date received of m) as string) & linefeed
                set hitCount to hitCount + 1
                if not dryRun then move m to destBox
            end repeat
        end if
    end repeat
end tell

if not foundSource then return "No mailbox named " & sourceName & " on account " & accountName
if hitCount is 0 then return "No matching message in " & sourceName
return output & "(" & hitCount & " message(s)) -> " & destPath
APPLESCRIPT

if [[ "$DRY_RUN" == true ]]; then
    echo "DRY RUN — would move from $FROM_MAILBOX on account $ACCOUNT:"
else
    echo "Moving from $FROM_MAILBOX on account $ACCOUNT:"
fi
osascript /tmp/mail-move.applescript
