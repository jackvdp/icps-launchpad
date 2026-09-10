#!/bin/bash
# Open a new email draft. Never sends.
#
# Two clients, chosen by the profile's `compose_client` (or --client):
#   outlook  Microsoft Outlook. Best HTML rendering, so it is the default for
#            any account Outlook actually holds.
#   mail     Apple Mail. The only option for accounts Outlook does not have,
#            which is most personal and secondary accounts.
#
# Usage:
#   ./compose.sh --to "x@example.com" --subject "S" --body "B"
#   ./compose.sh --account jack-tech --to "x@example.com" --subject "S" --html --body "<p>..</p>"
#   ./compose.sh --client mail --to "x@example.com" --subject "S" --body "B"
#
# Arguments:
#   --to ADDRESS     recipient (required, repeatable)
#   --subject TEXT   subject line (required)
#   --body TEXT      body, plain text or HTML (required)
#   --cc ADDRESS     CC recipient (optional, repeatable)
#   --bcc ADDRESS    BCC recipient (optional, repeatable)
#   --html           treat --body as HTML
#   --attach PATH    file to attach (optional, repeatable)
#   --account NAME   profile slug, Apple Mail account name, or address
#   --client NAME    outlook | mail, overriding the profile

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

TO_ADDRESSES=()
CC_ADDRESSES=()
BCC_ADDRESSES=()
ATTACH_PATHS=()
SUBJECT=""
BODY=""
HTML_MODE=false
ACCOUNT_ARG=""
CLIENT_ARG=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --to) TO_ADDRESSES+=("$2"); shift 2 ;;
        --subject) SUBJECT="$2"; shift 2 ;;
        --body) BODY="$2"; shift 2 ;;
        --cc) CC_ADDRESSES+=("$2"); shift 2 ;;
        --bcc) BCC_ADDRESSES+=("$2"); shift 2 ;;
        --attach) ATTACH_PATHS+=("$2"); shift 2 ;;
        --html) HTML_MODE=true; shift ;;
        --account) ACCOUNT_ARG="$2"; shift 2 ;;
        --client) CLIENT_ARG="$2"; shift 2 ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
done

if [[ ${#TO_ADDRESSES[@]} -eq 0 || -z "$SUBJECT" || -z "$BODY" ]]; then
    echo "Error: --to, --subject, and --body are required" >&2
    exit 1
fi

resolve_account "$ACCOUNT_ARG"

CLIENT="$CLIENT_ARG"
[[ -n "$CLIENT" ]] || CLIENT="$(resolve_client compose)"
CLIENT="$(printf '%s' "$CLIENT" | tr '[:upper:]' '[:lower:]')"
[[ "$CLIENT" == "apple-mail" || "$CLIENT" == "apple mail" ]] && CLIENT="mail"
if [[ "$CLIENT" != "outlook" && "$CLIENT" != "mail" ]]; then
    echo "Error: unknown client '$CLIENT' (expected outlook or mail)" >&2
    exit 1
fi

# The address the draft is sent from. Profiles name it; without one, Apple Mail
# falls back to its own default account.
FROM_ADDRESS=""
[[ -n "$PROFILE" ]] && FROM_ADDRESS="$(fm_get "$PROFILE" address)"

# Resolve and check attachments up front, for both clients.
ABS_ATTACHMENTS=()
for path in "${ATTACH_PATHS[@]}"; do
    abs_path=$(cd "$(dirname "$path")" 2>/dev/null && printf '%s/%s' "$(pwd)" "$(basename "$path")")
    if [[ -z "$abs_path" || ! -f "$abs_path" ]]; then
        echo "Error: attachment not found: $path" >&2
        exit 1
    fi
    ABS_ATTACHMENTS+=("$abs_path")
done

ESCAPED_SUBJECT="$(as_escape "$SUBJECT")"

if [[ "$HTML_MODE" == true ]]; then
    # Use --body as-is (inner HTML supplied by caller)
    INNER_HTML="$BODY"
else
    # Both clients treat `content` as HTML, so raw newlines collapse into one
    # block. Escape HTML entities and convert newlines to <br> so plain-text
    # bodies keep their line breaks and blank-line spacing.
    INNER_HTML=$(printf '%s' "$BODY" | perl -pe 's/&/&amp;/g; s/</&lt;/g; s/>/&gt;/g' | perl -0pe 's/\n/<br>/g')
fi

# Wrap the body in a full HTML document with styling.
# Use single quotes inside HTML attributes to avoid AppleScript escaping issues.
#
# Paragraph spacing: `p { margin: 0 }` used to be set here. It is inert for plain-text
# bodies (those become <br>-separated, with no <p> tags at all) but in --html mode it
# collapsed every paragraph against the next, so drafts arrived as one solid block.
# Give <p> a bottom margin instead, and zero the top margin so the first line still sits
# flush. Callers writing --html do not need inline margins.
FULL_HTML="<!DOCTYPE html><html><head><meta charset='UTF-8'><style>p { margin: 0 0 14px 0; } p:last-child { margin-bottom: 0; } ul, ol { margin: 0 0 14px 0; padding-left: 22px; } li { margin: 0 0 4px 0; }</style></head><body style='font-family: Calibri, Arial, sans-serif; font-size: 15px;'>${INNER_HTML}</body></html>"
ESCAPED_BODY="$(as_escape "$FULL_HTML")"

if [[ "$CLIENT" == "outlook" ]]; then
    TO_SCRIPT=""
    for addr in "${TO_ADDRESSES[@]}"; do
        TO_SCRIPT+="  make new recipient at newMessage with properties {email address:{address:\"$(as_escape "$addr")\"}}"$'\n'
    done
    CC_SCRIPT=""
    for addr in "${CC_ADDRESSES[@]}"; do
        CC_SCRIPT+="  make new cc recipient at newMessage with properties {email address:{address:\"$(as_escape "$addr")\"}}"$'\n'
    done
    BCC_SCRIPT=""
    for addr in "${BCC_ADDRESSES[@]}"; do
        BCC_SCRIPT+="  make new bcc recipient at newMessage with properties {email address:{address:\"$(as_escape "$addr")\"}}"$'\n'
    done

    ATTACH_SCRIPT=""
    for abs_path in "${ABS_ATTACHMENTS[@]}"; do
        # `make new attachment at newMessage ...` silently no-ops in Outlook: the call
        # succeeds, osascript exits 0, and the draft opens with nothing attached.
        # Addressing the message directly with `tell` is the form that actually works.
        ATTACH_SCRIPT+="  tell newMessage to make new attachment with properties {file:POSIX file \"$(as_escape "$abs_path")\"}"$'\n'
    done

    # Fail loudly if an attachment did not take, rather than opening a draft that
    # looks complete but has nothing attached.
    ATTACH_VERIFY=""
    if [[ ${#ABS_ATTACHMENTS[@]} -gt 0 ]]; then
        ATTACH_VERIFY="  if (count of attachments of newMessage) is not ${#ABS_ATTACHMENTS[@]} then error \"Attachment failed: expected ${#ABS_ATTACHMENTS[@]}\""
    fi

    cat > /tmp/outlook-compose.applescript << APPLESCRIPT
set emailSubject to "$ESCAPED_SUBJECT"
set emailBody to "$ESCAPED_BODY"

tell application "Microsoft Outlook"
  set newMessage to make new outgoing message with properties {subject:emailSubject, content:emailBody}

$TO_SCRIPT
$CC_SCRIPT
$BCC_SCRIPT
$ATTACH_SCRIPT
$ATTACH_VERIFY

  open newMessage
  activate
end tell
APPLESCRIPT

    osascript /tmp/outlook-compose.applescript

else
    TO_SCRIPT=""
    for addr in "${TO_ADDRESSES[@]}"; do
        TO_SCRIPT+="  make new to recipient at end of to recipients of newMessage with properties {address:\"$(as_escape "$addr")\"}"$'\n'
    done
    CC_SCRIPT=""
    for addr in "${CC_ADDRESSES[@]}"; do
        CC_SCRIPT+="  make new cc recipient at end of cc recipients of newMessage with properties {address:\"$(as_escape "$addr")\"}"$'\n'
    done
    BCC_SCRIPT=""
    for addr in "${BCC_ADDRESSES[@]}"; do
        BCC_SCRIPT+="  make new bcc recipient at end of bcc recipients of newMessage with properties {address:\"$(as_escape "$addr")\"}"$'\n'
    done

    ATTACH_SCRIPT=""
    for abs_path in "${ABS_ATTACHMENTS[@]}"; do
        ATTACH_SCRIPT+="  tell content of newMessage to make new attachment with properties {file name:(POSIX file \"$(as_escape "$abs_path")\")} at after the last paragraph"$'\n'
    done

    # Apple Mail's `content` is plain text and takes it reliably, which is why
    # the Mail path sets it rather than pasting. (Mail's `html content`
    # property still exists but its own dictionary marks it "does nothing at
    # all (deprecated)": assigning to it succeeds and changes nothing.) So an
    # --html body is flattened to readable text here, with link targets kept in
    # brackets, and the real HTML is left on the clipboard for a manual paste.
    if [[ "$HTML_MODE" == true ]]; then
        PLAIN_BODY=$(printf '%s' "$BODY" | perl -0777 -pe '
            s{<a\b[^>]*href=["'"'"']([^"'"'"']*)["'"'"'][^>]*>(.*?)</a>}{$2 ($1)}gis;
            s{<li[^>]*>}{\n- }gis;
            s{</li>}{}gis;
            s{</(?:ul|ol)>}{\n\n}gis;
            s{</(?:p|div|h[1-6]|tr)>}{\n\n}gis;
            s{<br\s*/?>}{\n}gis;
            s{<[^>]+>}{}gs;
            s{&nbsp;}{ }gs; s{&amp;}{&}gs; s{&lt;}{<}gs; s{&gt;}{>}gs; s{&quot;}{"}gs; s{&#39;}{'"'"'}gs;
            s{[ \t]+\n}{\n}gs; s{\n{3,}}{\n\n}gs; s{^\n+}{}s; s{\n+$}{\n}s;
        ')
    else
        PLAIN_BODY="$BODY"
    fi
    ESCAPED_PLAIN="$(as_escape "$PLAIN_BODY")"

    # Send from the profile's address when it has one, otherwise from the first
    # address on the resolved account. Without this the draft silently goes out
    # from whichever account Mail treats as default, which is rarely the one
    # asked for.
    [[ -n "$FROM_ADDRESS" ]] || FROM_ADDRESS="$(account_address "$ACCOUNT")"
    SENDER_LINE=""
    if [[ -n "$FROM_ADDRESS" ]]; then
        SENDER_LINE="  set sender of newMessage to \"$(as_escape "$FROM_ADDRESS")\""
    fi

    cat > /tmp/mail-compose.applescript << APPLESCRIPT
set emailSubject to "$ESCAPED_SUBJECT"
set emailBody to "$ESCAPED_PLAIN"

tell application "Mail"
  set newMessage to make new outgoing message with properties {subject:emailSubject, content:emailBody, visible:true}
$SENDER_LINE
$TO_SCRIPT
$CC_SCRIPT
$BCC_SCRIPT
$ATTACH_SCRIPT
  activate
end tell
APPLESCRIPT

    osascript /tmp/mail-compose.applescript

    if [[ "$HTML_MODE" == true ]]; then
        printf '%s' "$FULL_HTML" | textutil -stdin -format html -convert rtf -stdout 2>/dev/null | pbcopy -Prefer rtf
        echo "Draft opened in Apple Mail with a plain-text body." >&2
        echo "The formatted version is on the clipboard: click into the body and press Cmd+V to swap it in." >&2
    fi
fi
