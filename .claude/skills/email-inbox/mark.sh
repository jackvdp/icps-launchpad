#!/bin/bash
# Mark messages read/unread or flagged/unflagged in Apple Mail.
#
# The apple-mail-readonly MCP cannot change mail state by design, so every
# state change goes through here.
#
# Usage:
#   ./mark.sh --read    --message-id "<id>"
#   ./mark.sh --unread  --sender "someone@example.com" --subject "Booking"
#   ./mark.sh --flag    --message-id "<id>" --account jack-tech
#   ./mark.sh --unflag  --sender "someone@example.com" --mailbox "Awards 26 Sponsors"
#
# Arguments:
#   --read | --unread | --flag | --unflag   (required, one or more)
#   --message-id ID   RFC Message-ID. Angle brackets are optional; the MCP
#                     returns them wrapped, Apple Mail stores them bare.
#   --sender TEXT     match on sender (substring) when no message id is known
#   --subject TEXT    match on subject (substring); combine with --sender
#   --mailbox NAME    mailbox to look in (default: Inbox). Matched by name, so
#                     nested mailboxes are found without their full path.
#   --account NAME    profile slug, Apple Mail account name, or address
#   --all             act on every match, not just the most recent one
#   --dry-run         report what would change, change nothing
#
# Without --all the script acts on the single newest match, which is almost
# always what you want. --all exists for "mark this whole thread read".

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ACCOUNT_ARG=""
MAILBOX=""
MESSAGE_ID=""
SENDER=""
SUBJECT=""
ALL=false
DRY_RUN=false
SET_READ=""
SET_FLAG=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --read) SET_READ=true; shift ;;
        --unread) SET_READ=false; shift ;;
        --flag) SET_FLAG=true; shift ;;
        --unflag) SET_FLAG=false; shift ;;
        --message-id) MESSAGE_ID="$2"; shift 2 ;;
        --sender) SENDER="$2"; shift 2 ;;
        --subject) SUBJECT="$2"; shift 2 ;;
        --mailbox) MAILBOX="$2"; shift 2 ;;
        --account) ACCOUNT_ARG="$2"; shift 2 ;;
        --all) ALL=true; shift ;;
        --dry-run) DRY_RUN=true; shift ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
done

if [[ -z "$SET_READ" && -z "$SET_FLAG" ]]; then
    echo "Error: pass at least one of --read, --unread, --flag, --unflag" >&2
    exit 1
fi
if [[ -z "$MESSAGE_ID" && -z "$SENDER" && -z "$SUBJECT" ]]; then
    echo "Error: identify the message with --message-id, or --sender / --subject" >&2
    exit 1
fi

resolve_account "$ACCOUNT_ARG"
[[ -n "$MAILBOX" ]] || MAILBOX="$(default_inbox)"

# Apple Mail stores message ids without angle brackets; the MCP hands them over
# wrapped in <>. Strip them so either form works.
MESSAGE_ID="${MESSAGE_ID#<}"
MESSAGE_ID="${MESSAGE_ID%>}"

E_ACCOUNT="$(as_escape "$ACCOUNT")"
E_MAILBOX="$(as_escape "$MAILBOX")"
E_MESSAGE_ID="$(as_escape "$MESSAGE_ID")"
E_SENDER="$(as_escape "$SENDER")"
E_SUBJECT="$(as_escape "$SUBJECT")"

ACTIONS=""
DESCRIPTION=""
if [[ -n "$SET_READ" ]]; then
    ACTIONS+="                    set read status of m to $SET_READ"$'\n'
    [[ "$SET_READ" == true ]] && DESCRIPTION+="read " || DESCRIPTION+="unread "
fi
if [[ -n "$SET_FLAG" ]]; then
    ACTIONS+="                    set flagged status of m to $SET_FLAG"$'\n'
    [[ "$SET_FLAG" == true ]] && DESCRIPTION+="flagged " || DESCRIPTION+="unflagged "
fi
[[ "$DRY_RUN" == true ]] && ACTIONS=""

cat > /tmp/mail-mark.applescript << APPLESCRIPT
set accountName to "$E_ACCOUNT"
set mailboxName to "$E_MAILBOX"
set wantedId to "$E_MESSAGE_ID"
set wantedSender to "$E_SENDER"
set wantedSubject to "$E_SUBJECT"
set actOnAll to $ALL
set output to ""
set hitCount to 0
set foundBox to false

tell application "Mail"
    set acct to account accountName
    repeat with mb in mailboxes of acct
        if (name of mb) is mailboxName then
            set foundBox to true
            repeat with m in (messages of mb)
                if hitCount > 0 and not actOnAll then exit repeat
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
                    set hitCount to hitCount + 1
                    set output to output & "MATCH: " & (subject of m) & " | " & ((sender of m) as string) & " | " & ((date received of m) as string) & linefeed
$ACTIONS
                end if
            end repeat
        end if
    end repeat
end tell

if not foundBox then return "No mailbox named " & mailboxName & " on account " & accountName
if hitCount is 0 then return "No matching message in " & mailboxName
return output & "(" & hitCount & " message(s))"
APPLESCRIPT

if [[ "$DRY_RUN" == true ]]; then
    echo "DRY RUN — would mark ${DESCRIPTION}on account $ACCOUNT, mailbox $MAILBOX:"
else
    echo "Marked ${DESCRIPTION}on account $ACCOUNT, mailbox $MAILBOX:"
fi
osascript /tmp/mail-mark.applescript
