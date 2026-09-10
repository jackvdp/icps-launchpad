#!/bin/bash
# Open a reply-all draft in Apple Mail. Never sends.
#
# Apple Mail handles every configured account, so replies always go through it
# whatever the profile's compose client is: a reply started in Mail keeps the
# thread, the existing recipients, and the account it arrived on.
#
# Usage:
#   ./reply.sh --sender "email@example.com" --body "Hi X, ..."
#   ./reply.sh --message-id "<id>" --html --body "<div><p>Hi X,</p></div>"
#   ./reply.sh --account jack-tech --sender "charles@nomos.com" --body "..."
#
# Arguments:
#   --message-id ID  RFC Message-ID of the message to reply to (angle brackets
#                    optional). The precise way to pick a message; prefer it
#                    when the MCP has already given you the id.
#   --sender TEXT    email address or name to match, when no id is known
#   --subject TEXT   subject text to narrow the match. The script replies to
#                    the first (most recent) match, so pass a subject fragment
#                    whenever the sender has several threads in the mailbox
#   --body TEXT      the reply text to paste in (required, supports multiline)
#   --cc ADDRESS     additional CC recipient (optional, repeatable). Only for
#                    addresses that are not already on the thread
#   --html           treat --body as HTML, for links and formatting
#   --mailbox NAME   mailbox to look in (default: Inbox)
#   --account NAME   profile slug, Apple Mail account name, or address

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

ACCOUNT_ARG=""
MAILBOX=""
MESSAGE_ID=""
SENDER=""
SUBJECT=""
BODY=""
CC_ADDRESSES=()
HTML_MODE=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --account) ACCOUNT_ARG="$2"; shift 2 ;;
        --mailbox) MAILBOX="$2"; shift 2 ;;
        --message-id) MESSAGE_ID="$2"; shift 2 ;;
        --sender) SENDER="$2"; shift 2 ;;
        --subject) SUBJECT="$2"; shift 2 ;;
        --body) BODY="$2"; shift 2 ;;
        --cc) CC_ADDRESSES+=("$2"); shift 2 ;;
        --html) HTML_MODE=true; shift ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
done

if [[ -z "$BODY" ]]; then
    echo "Error: --body is required" >&2
    exit 1
fi
if [[ -z "$MESSAGE_ID" && -z "$SENDER" ]]; then
    echo "Error: --message-id or --sender is required" >&2
    exit 1
fi

resolve_account "$ACCOUNT_ARG"
[[ -n "$MAILBOX" ]] || MAILBOX="$(default_inbox)"

MESSAGE_ID="${MESSAGE_ID#<}"
MESSAGE_ID="${MESSAGE_ID%>}"

E_ACCOUNT="$(as_escape "$ACCOUNT")"
E_MAILBOX="$(as_escape "$MAILBOX")"
E_MESSAGE_ID="$(as_escape "$MESSAGE_ID")"
E_SENDER="$(as_escape "$SENDER")"
E_SUBJECT="$(as_escape "$SUBJECT")"
ESCAPED_BODY="$(as_escape "$BODY")"

# Build CC AppleScript lines
CC_SCRIPT=""
for addr in "${CC_ADDRESSES[@]}"; do
    CC_SCRIPT+="                    make new cc recipient at end of cc recipients of replyMsg with properties {address:\"$(as_escape "$addr")\"}"$'\n'
done

# The matching block is shared between the plain and HTML paths.
# `read -d ''` hits EOF without finding its delimiter and so exits 1; that is
# expected here, hence the `|| true`.
read -r -d '' MATCH_BLOCK << APPLESCRIPT
set accountName to "$E_ACCOUNT"
set mailboxName to "$E_MAILBOX"
set wantedId to "$E_MESSAGE_ID"
set wantedSender to "$E_SENDER"
set wantedSubject to "$E_SUBJECT"
set matched to false

tell application "Mail"
    set acct to account accountName
    repeat with mb in mailboxes of acct
        if (name of mb) is mailboxName and not matched then
            repeat with msg in (messages of mb)
                set isMatch to false
                try
                    if wantedId is not "" then
                        if (message id of msg) is wantedId then set isMatch to true
                    else
                        set isMatch to true
                        if ((sender of msg) as string) does not contain wantedSender then set isMatch to false
                        if wantedSubject is not "" then
                            if (subject of msg) does not contain wantedSubject then set isMatch to false
                        end if
                    end if
                on error
                    set isMatch to false
                end try

                if isMatch then
                    set matched to true
                    set replyMsg to reply msg opening window yes with reply to all
                    delay 2
$CC_SCRIPT
                    activate
                    exit repeat
                end if
            end repeat
        end if
    end repeat
end tell

if not matched then error "No matching message in " & mailboxName & " on account " & accountName
APPLESCRIPT
true

if [[ "$HTML_MODE" == true ]]; then
    # HTML mode: put HTML on the pasteboard so links and formatting survive.
    cat > /tmp/mail-reply.applescript << APPLESCRIPT
use framework "AppKit"

set htmlBody to "$ESCAPED_BODY"

$MATCH_BLOCK

set pb to current application's NSPasteboard's generalPasteboard()
pb's clearContents()
pb's setString:htmlBody forType:(current application's NSPasteboardTypeHTML)

delay 0.5

tell application "System Events"
    tell process "Mail"
        key code 126 using {command down}
        keystroke "v" using {command down}
    end tell
end tell
APPLESCRIPT
else
    cat > /tmp/mail-reply.applescript << APPLESCRIPT
set replyBody to "$ESCAPED_BODY

"

$MATCH_BLOCK

set the clipboard to replyBody

tell application "System Events"
    tell process "Mail"
        key code 126 using {command down}
        keystroke "v" using {command down}
    end tell
end tell
APPLESCRIPT
fi

osascript /tmp/mail-reply.applescript
