#!/bin/bash
# List the accounts Apple Mail has configured, and the account profiles the
# skill knows about. Use this when setting up a new profile: it supplies the
# `apple_mail_account`, `address` and `account_uuid` values the profile needs.
#
# Usage:
#   ./accounts.sh              Apple Mail accounts + configured profiles
#   ./accounts.sh --mail-only  Apple Mail accounts only
#
# The `id` Apple Mail reports for an account is the same UUID the
# apple-mail-readonly MCP calls `account_uuid`, so it is the join between the
# two halves of this skill: AppleScript addresses accounts by name, the MCP
# addresses them by UUID.

source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

MAIL_ONLY=false
[[ "$1" == "--mail-only" ]] && MAIL_ONLY=true

cat > /tmp/email-accounts.applescript << 'APPLESCRIPT'
set savedDelims to AppleScript's text item delimiters
set AppleScript's text item delimiters to ", "

tell application "Mail"
    set output to ""
    repeat with a in accounts
        try
            -- `email addresses` is a list; coercing item-by-item fails, so join
            -- the whole list through the text item delimiters instead.
            set addrs to (email addresses of a) as string
            set output to output & "account:   " & (name of a) & linefeed
            set output to output & "  uuid:    " & (id of a) & linefeed
            set output to output & "  address: " & addrs & linefeed
            set output to output & "  enabled: " & (enabled of a as string) & linefeed
        on error errMsg
            set output to output & "account:   " & (name of a) & " (error: " & errMsg & ")" & linefeed
        end try
    end repeat
end tell

set AppleScript's text item delimiters to savedDelims
return output
APPLESCRIPT

echo "== Apple Mail accounts =="
osascript /tmp/email-accounts.applescript

[[ "$MAIL_ONLY" == true ]] && exit 0

DIR="$(accounts_dir)"
echo
echo "== Account profiles ($DIR) =="

found=false
while IFS= read -r f; do
    [[ -n "$f" ]] || continue
    found=true
    slug="$(fm_get "$f" name)"
    [[ -n "$slug" ]] || slug="$(basename "$f" .md)"
    marker=""
    [[ "$(fm_get "$f" default)" == "true" ]] && marker="  (default)"
    echo "profile:   $slug$marker"
    echo "  file:    $f"
    echo "  account: $(fm_get "$f" apple_mail_account)"
    echo "  address: $(fm_get "$f" address)"
    echo "  compose: $(fm_get "$f" compose_client)   reply: $(fm_get "$f" reply_client)"
done < <(find "$DIR" -maxdepth 1 -name '*.md' ! -name 'README.md' -print 2>/dev/null | sort)

if [[ "$found" == false ]]; then
    echo "(none)"
    echo
    echo "No profiles yet. Create one from the template in $DIR/README.md."
fi
