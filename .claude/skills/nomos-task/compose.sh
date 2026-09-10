#!/bin/bash
# Compose a NOMOS consultancy email in Apple Mail from jack@vanderpump.tech.
# Opens a draft window. Never sends.
#
# Usage: ./compose.sh --to "name@emb.gov" --subject "Subject" --body "Dear X, ..." [--cc "..."] [--attach path]
#
# Arguments:
#   --to       Recipient email address (required, repeatable)
#   --subject  Subject line (required)
#   --body     Plain text body (required). Use real newlines.
#   --cc       CC address (optional, repeatable)
#   --attach   Path to a file to attach (optional, repeatable)
#
# The sender is fixed to jack@vanderpump.tech: consultancy mail must not go out
# from the ICPS Exchange account. See references/engagement.md.

SENDER="jack@vanderpump.tech"
TO_ADDRESSES=()
CC_ADDRESSES=()
ATTACH_PATHS=()
SUBJECT=""
BODY=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --to)
            TO_ADDRESSES+=("$2")
            shift 2
            ;;
        --subject)
            SUBJECT="$2"
            shift 2
            ;;
        --body)
            BODY="$2"
            shift 2
            ;;
        --cc)
            CC_ADDRESSES+=("$2")
            shift 2
            ;;
        --attach)
            ATTACH_PATHS+=("$2")
            shift 2
            ;;
        *)
            echo "Unknown argument: $1" >&2
            exit 1
            ;;
    esac
done

if [[ ${#TO_ADDRESSES[@]} -eq 0 || -z "$SUBJECT" || -z "$BODY" ]]; then
    echo "Error: --to, --subject and --body are required" >&2
    exit 1
fi

esc() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

ESCAPED_SUBJECT=$(esc "$SUBJECT")
# Newlines have to survive into the AppleScript string literal as \n escapes.
# awk rather than a sed label loop: BSD sed rejects semicolon-separated labels.
ESCAPED_BODY=$(printf '%s\n' "$BODY" | sed 's/\\/\\\\/g; s/"/\\"/g' | awk '{printf "%s\\n", $0}')

RECIPIENT_SCRIPT=""
for addr in "${TO_ADDRESSES[@]}"; do
    RECIPIENT_SCRIPT+="        make new to recipient at end of to recipients with properties {address:\"$(esc "$addr")\"}"$'\n'
done
for addr in "${CC_ADDRESSES[@]}"; do
    RECIPIENT_SCRIPT+="        make new cc recipient at end of cc recipients with properties {address:\"$(esc "$addr")\"}"$'\n'
done

ATTACH_SCRIPT=""
for path in "${ATTACH_PATHS[@]}"; do
    if [[ ! -f "$path" ]]; then
        echo "Error: attachment not found: $path" >&2
        exit 1
    fi
    ABS_PATH=$(cd "$(dirname "$path")" && pwd)/$(basename "$path")
    ATTACH_SCRIPT+="        tell content"$'\n'
    ATTACH_SCRIPT+="            make new attachment with properties {file name:(POSIX file \"$(esc "$ABS_PATH")\")} at after last paragraph"$'\n'
    ATTACH_SCRIPT+="        end tell"$'\n'
done

SCRIPT_FILE="${TMPDIR:-/tmp}/nomos-compose.applescript"

cat > "$SCRIPT_FILE" << APPLESCRIPT
tell application "Mail"
    set newMessage to make new outgoing message with properties {subject:"$ESCAPED_SUBJECT", content:"$ESCAPED_BODY", visible:true}
    tell newMessage
        set sender to "$SENDER"
$RECIPIENT_SCRIPT$ATTACH_SCRIPT    end tell
    activate
end tell
APPLESCRIPT

osascript "$SCRIPT_FILE"
