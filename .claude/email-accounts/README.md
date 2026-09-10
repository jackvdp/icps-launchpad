# Email account profiles

One file per mailbox the `/email-inbox` skill works with. A profile says which
Apple Mail account to act on, which client composes new mail, whose voice to
write in, where things get filed, and what does not need answering.

Without a profile the skill knows nothing about the account, so it asks to
create one before doing anything else.

```
.claude/email-accounts/
├── README.md          this file
├── jack-icps.md       profile (default)
├── jack-tech.md       profile
└── voice/
    ├── jack.md            how Jack writes
    └── jack-registers.md  register by recipient, from a read of his Sent Items
```

These files are committed. They hold working addresses and filing conventions,
not credentials: mail access comes from Apple Mail itself and from the
`apple-mail-readonly` MCP, neither of which needs anything stored here.

## Which profile the skill uses

1. what the user named in the request ("check my Tech mail", "reply from ICPS")
2. `--account` on a script, which accepts a profile slug, an Apple Mail
   account name, or an address
3. `$EMAIL_ACCOUNT`
4. the profile with `default: true`
5. the only profile, if there is one

Profiles are looked for in `$EMAIL_ACCOUNTS_DIR`, then
`<repo>/.claude/email-accounts/`, then `~/.claude/email-accounts/`. The last
one is the place for a profile that should follow the user between repos.

## Frontmatter

| Key | Required | What it does |
|---|---|---|
| `name` | yes | slug, matching the filename |
| `default` | no | `true` on the profile to use when none is named. At most one |
| `owner` | yes | whose mailbox this is, as it should read in a signature or a brief |
| `address` | yes | the address mail is sent from |
| `apple_mail_account` | yes | the account name as Apple Mail shows it in its sidebar. Run `accounts.sh` to see the list |
| `account_uuid` | no | the same account's UUID, which is what the MCP filters on. `accounts.sh` prints it |
| `compose_client` | no | `outlook` or `mail`, for new messages. Default `outlook` |
| `reply_client` | no | `mail`. Replies go through Apple Mail whatever this says, because Mail holds every account and keeps the thread |
| `signature` | no | `client` (a signature is configured in the mail client, so drafts must not add one), `none`, or the sign-off to type |
| `voice` | no | path to a voice file, relative to this folder |
| `templates` | no | path to a templates folder, relative to this folder |
| `inbox` | no | mailbox to read by default. Default `Inbox` |

## Body

Free-form Markdown under known headings. The skill reads these before drafting
and, where a heading says so, updates them as it learns.

- **`## Filing map`** — a table of mailbox paths and what belongs in each. The
  skill matches against it before filing anything with `move.sh`, and adds a
  row when the user files something somewhere new. Only fill in what is
  actually used; `mailboxes.sh --list` shows everything that exists.
- **`## Triage`** — who else's mail arrives here, what is not the owner's to
  answer, how stale a thread has to be before it is dead. This is what stops
  the skill drafting replies to the whole inbox.
- **`## People`** — colleagues and regular correspondents, with addresses and
  what each owns.
- **`## Notes`** — anything else worth knowing: standing conventions, links to
  project folders, quirks of this account.

## Adding a profile

1. Run `.claude/skills/email-inbox/accounts.sh`. It lists the accounts Apple
   Mail has, with their UUIDs and addresses, and the profiles that already
   exist.
2. Copy the template below into `<slug>.md`, fill in the frontmatter from that
   output, and ask the owner what belongs under `Filing map`, `Triage` and
   `People`. Guess nothing: a wrong filing rule scatters mail.
3. Leave the body sections thin at first. They fill up as the account gets used.

```markdown
---
name: someone-work
default: false
owner: Someone Else
address: someone@example.org
apple_mail_account: Exchange
account_uuid: 00000000-0000-0000-0000-000000000000
compose_client: outlook
reply_client: mail
signature: client
voice: voice/someone.md
inbox: Inbox
---

# Someone's work mail

One line on what this account is for.

## Filing map

| Mailbox | What goes there |
|---|---|
| Inbox | anything not yet filed |

## Triage

Who else's mail lands here and what is not theirs to answer.

## People

| Name | Address | Owns |
|---|---|---|

## Notes
```
