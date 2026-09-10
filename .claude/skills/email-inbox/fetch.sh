#!/bin/bash
# Fetch messages from a mailbox in Apple Mail.
#
# This reads live Mail state. For most reading, prefer the apple-mail-readonly
# MCP (mail_search_messages / mail_read_message / mail_read_thread): it is
# faster, returns structured results, and knows about threads. Use this script
# when the MCP is unavailable, or when you need what Mail is showing right now
# rather than what its index has caught up with.
#
# Usage:
#   ./fetch.sh                                  30 most recent, default account
#   ./fetch.sh --account jack-tech --max 10
#   ./fetch.sh --search "COMELEC"
#   ./fetch.sh --mailbox "Awards 26 Sponsors" --max 15
#   ./fetch.sh --offset 20 --max 30             pagination
#   ./fetch.sh --unread                         unread only
#
# Arguments:
#   --account NAME  profile slug, Apple Mail account name, or address
#                   (default: the profile marked `default: true`)
#   --mailbox NAME  mailbox to read (default: Inbox). Nested mailboxes are
#                   found by leaf name.
#   --max N         maximum messages to fetch (default: 30)
#   --search TERM   filter by subject or sender containing this term
#   --offset N      skip the first N messages (ignored with --search)
#   --unread        only unread messages
#   --ids           include the RFC Message-ID of each message, which is what
#                   mark.sh and move.sh want for an exact match

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ACCOUNT_ARG=""
MAILBOX=""
MAX=30
SEARCH=""
OFFSET=0
UNREAD_ONLY=false
WITH_IDS=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --account) ACCOUNT_ARG="$2"; shift 2 ;;
        --mailbox) MAILBOX="$2"; shift 2 ;;
        --max) MAX="$2"; shift 2 ;;
        --search) SEARCH="$2"; shift 2 ;;
        --offset) OFFSET="$2"; shift 2 ;;
        --unread) UNREAD_ONLY=true; shift ;;
        --ids) WITH_IDS=true; shift ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
done

resolve_account "$ACCOUNT_ARG"
[[ -n "$MAILBOX" ]] || MAILBOX="$(default_inbox)"

E_ACCOUNT="$(as_escape "$ACCOUNT")"
E_MAILBOX="$(as_escape "$MAILBOX")"
E_SEARCH="$(as_escape "$SEARCH")"

# Bodies are the slow part, so a bare listing takes a short preview and a
# search (already narrowed) takes a longer one.
if [[ -n "$SEARCH" ]]; then
    BODY_CHARS=3000
else
    BODY_CHARS=500
fi

ID_LINE=""
[[ "$WITH_IDS" == true ]] && ID_LINE='                set output to output & "ID: " & (message id of m) & linefeed'

START_INDEX=$((OFFSET + 1))
SCAN_LIMIT=$((OFFSET + MAX))
# With a search the whole mailbox needs scanning, but cap it so a large
# mailbox cannot hang the script.
[[ -n "$SEARCH" ]] && SCAN_LIMIT=1000 && START_INDEX=1

cat > /tmp/email-inbox.applescript << APPLESCRIPT
set accountName to "$E_ACCOUNT"
set mailboxName to "$E_MAILBOX"
set searchTerm to "$E_SEARCH"
set unreadOnly to $UNREAD_ONLY
set startIndex to $START_INDEX
set scanLimit to $SCAN_LIMIT
set maxShown to $MAX
set bodyChars to $BODY_CHARS
set output to ""
set delimChar to ASCII character 30
set shown to 0
set foundBox to false

tell application "Mail"
    set acct to account accountName
    repeat with mb in mailboxes of acct
        if (name of mb) is mailboxName then
            set foundBox to true
            set msgs to messages of mb
            set msgCount to count of msgs
            if msgCount > scanLimit then set msgCount to scanLimit

            repeat with i from startIndex to msgCount
                if shown is greater than or equal to maxShown then exit repeat
                try
                    set m to item i of msgs
                    set msgFrom to (sender of m) as string
                    set msgSubject to subject of m
                    set keep to true
                    if searchTerm is not "" then
                        if msgSubject does not contain searchTerm and msgFrom does not contain searchTerm then set keep to false
                    end if
                    if unreadOnly and (read status of m) then set keep to false

                    if keep then
                        set msgContent to content of m
                        if (count of msgContent) > bodyChars then
                            set msgContent to text 1 thru bodyChars of msgContent
                        end if
                        set output to output & "FROM: " & msgFrom & linefeed
                        set output to output & "SUBJECT: " & msgSubject & linefeed
                        set output to output & "DATE: " & ((date received of m) as string) & linefeed
                        set output to output & "READ: " & ((read status of m) as string) & linefeed
$ID_LINE
                        set output to output & "BODY: " & msgContent & linefeed
                        set output to output & delimChar & linefeed
                        set shown to shown + 1
                    end if
                end try
            end repeat
        end if
    end repeat
end tell

if not foundBox then return "No mailbox named " & mailboxName & " on account " & accountName
if output is "" then return "No matching messages in " & mailboxName
return output
APPLESCRIPT

osascript /tmp/email-inbox.applescript
