#!/bin/bash
# Shared helpers for the email-inbox scripts.
#
# Sourced, not run. Provides:
#   accounts_dir            where the account profiles live
#   profile_path <name>     path to a named profile, or "" if absent
#   fm_get <file> <key>     read one key out of a profile's YAML frontmatter
#   resolve_account         work out which Apple Mail account to act on
#   resolve_client <kind>   work out which client composes/replies (kind: compose|reply)
#   as_escape <string>      escape a string for embedding in an AppleScript literal
#
# Account resolution order (first hit wins):
#   1. --account "Name" on the command line
#   2. $EMAIL_ACCOUNT
#   3. the profile whose frontmatter says `default: true`
#   4. the only profile, if there is exactly one
#   5. error, telling the caller to create a profile
#
# Profiles are looked for in $EMAIL_ACCOUNTS_DIR, then <repo>/.claude/email-accounts,
# then ~/.claude/email-accounts.

_SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
_REPO_ROOT="$(cd "$_SKILL_DIR/../../.." && pwd)"

accounts_dir() {
    if [[ -n "$EMAIL_ACCOUNTS_DIR" ]]; then
        printf '%s' "$EMAIL_ACCOUNTS_DIR"
    elif [[ -d "$_REPO_ROOT/.claude/email-accounts" ]]; then
        printf '%s' "$_REPO_ROOT/.claude/email-accounts"
    else
        printf '%s' "$HOME/.claude/email-accounts"
    fi
}

# List profile files (top level only; voice/ and README.md are not profiles).
_profiles() {
    local dir
    dir="$(accounts_dir)"
    [[ -d "$dir" ]] || return 0
    find "$dir" -maxdepth 1 -name '*.md' ! -name 'README.md' -print 2>/dev/null | sort
}

# Read a scalar key from a file's YAML frontmatter. Surrounding quotes are stripped.
fm_get() {
    local file="$1" key="$2"
    [[ -f "$file" ]] || return 0
    awk -v key="$key" '
        NR == 1 && $0 == "---" { inFM = 1; next }
        inFM && $0 == "---" { exit }
        inFM && index($0, key ":") == 1 {
            sub("^" key ":[ \t]*", "")
            gsub(/^["'"'"']|["'"'"']$/, "")
            sub(/[ \t]+$/, "")
            print
            exit
        }
    ' "$file"
}

_lower() { printf '%s' "$1" | tr '[:upper:]' '[:lower:]'; }

# Path to a profile, matched on the profile slug (frontmatter `name`, or the
# filename), on `apple_mail_account`, or on `address`. Case-insensitive.
# Prints nothing if there is no match.
profile_path() {
    local want candidate f slug acct addr
    want="$(_lower "$1")"
    while IFS= read -r f; do
        [[ -n "$f" ]] || continue
        slug="$(fm_get "$f" name)"
        [[ -n "$slug" ]] || slug="$(basename "$f" .md)"
        acct="$(fm_get "$f" apple_mail_account)"
        addr="$(fm_get "$f" address)"
        for candidate in "$slug" "$acct" "$addr"; do
            if [[ -n "$candidate" && "$(_lower "$candidate")" == "$want" ]]; then
                printf '%s' "$f"
                return 0
            fi
        done
    done < <(_profiles)
    return 0
}

_default_profile() {
    local f count=0 only=""
    while IFS= read -r f; do
        [[ -n "$f" ]] || continue
        count=$((count + 1))
        only="$f"
        if [[ "$(fm_get "$f" default)" == "true" ]]; then
            printf '%s' "$f"
            return 0
        fi
    done < <(_profiles)
    [[ $count -eq 1 ]] && printf '%s' "$only"
    return 0
}

_no_profile_error() {
    cat >&2 << MSG
Error: no email account profile found, and no --account given.

Profiles live in $(accounts_dir)/ (one .md file per account).
Create one from the template in that folder's README.md, then re-run.
Or pass the Apple Mail account name directly: --account "Exchange"

Run accounts.sh to see the accounts Apple Mail has configured.
MSG
    exit 1
}

# Sets ACCOUNT (Apple Mail account name) and PROFILE (profile path, may be empty).
# Call with the value of --account, which may be a profile slug, an Apple Mail
# account name, an email address, or empty.
resolve_account() {
    local requested="$1"
    PROFILE=""
    if [[ -n "$requested" ]]; then
        PROFILE="$(profile_path "$requested")"
        if [[ -n "$PROFILE" ]]; then
            ACCOUNT="$(fm_get "$PROFILE" apple_mail_account)"
            [[ -n "$ACCOUNT" ]] || ACCOUNT="$requested"
        else
            # Not a known profile: treat it as a literal Apple Mail account name.
            ACCOUNT="$requested"
        fi
        return 0
    fi
    if [[ -n "$EMAIL_ACCOUNT" ]]; then
        resolve_account "$EMAIL_ACCOUNT"
        return 0
    fi
    PROFILE="$(_default_profile)"
    [[ -n "$PROFILE" ]] || _no_profile_error
    ACCOUNT="$(fm_get "$PROFILE" apple_mail_account)"
    if [[ -z "$ACCOUNT" ]]; then
        echo "Error: profile $PROFILE has no apple_mail_account in its frontmatter." >&2
        exit 1
    fi
}

# The profile's inbox mailbox name, defaulting to Inbox. Worth having as a
# setting: Exchange calls it "Inbox", IMAP accounts often call it "INBOX", and
# Apple Mail matches the name exactly.
default_inbox() {
    local value=""
    [[ -n "$PROFILE" ]] && value="$(fm_get "$PROFILE" inbox)"
    [[ -n "$value" ]] || value="Inbox"
    printf '%s' "$value"
}

# Which client handles a given action for the resolved profile.
# kind is "compose" or "reply"; falls back to outlook / mail.
resolve_client() {
    local kind="$1" value=""
    [[ -n "$PROFILE" ]] && value="$(fm_get "$PROFILE" "${kind}_client")"
    if [[ -z "$value" ]]; then
        case "$kind" in
            compose) value="outlook" ;;
            *) value="mail" ;;
        esac
    fi
    printf '%s' "$value"
}

# Escape backslashes and double quotes for an AppleScript string literal.
as_escape() {
    printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

# First email address of an Apple Mail account, or "" if it cannot be read.
# The items of Mail's `email addresses` list will not coerce to string one by
# one, so the list is joined through the text item delimiters and split again.
account_address() {
    local acct
    acct="$(as_escape "$1")"
    osascript << EOF 2>/dev/null
set savedDelims to AppleScript's text item delimiters
set AppleScript's text item delimiters to ","
set result_ to ""
try
    tell application "Mail" to set joined to (email addresses of account "$acct") as string
    set result_ to text item 1 of joined
end try
set AppleScript's text item delimiters to savedDelims
return result_
EOF
}
