---
name: email-inbox
description: Email assistant for any mailbox configured in Apple Mail. Reads and searches mail through the apple-mail-readonly MCP, walks conversations as threads, drafts replies in Apple Mail and new composes in Outlook or Mail, and files, flags and marks mail read. Which account, which client, whose voice and where things get filed all come from an account profile in .claude/email-accounts/. Use when the user wants to triage an inbox, search past correspondence, follow a thread, reply, compose, file mail into folders, or write one of the standard emails from a template.
argument-hint: [optional: account name, number of emails, search term, or "next" to continue]
allowed-tools: Bash, Read, Write, Edit
---

# Email Assistant

An interactive email assistant for any mailbox Apple Mail holds. It reads and
searches through the **apple-mail-readonly MCP**, acts on mail through
AppleScript wrappers in this folder, and **never sends anything**: every
outgoing message is opened as a draft for the user to review and send.

Everything account-specific lives outside this skill, in an **account profile**.
The skill itself knows nothing about whose mail it is, which folders exist, or
how the owner writes.

---

## Step 0 — Establish the account

**Do this before anything else, every time.**

```bash
.claude/skills/email-inbox/accounts.sh
```

That prints the accounts Apple Mail has (with the UUIDs the MCP filters on) and
the profiles already configured.

**If a profile matches the request, read it in full before acting.** Its
frontmatter fixes the account, the compose client and the voice file; its body
carries the filing map, the triage rules and the people. Read the voice file it
names too, before drafting anything.

**If the user named an account** ("check my Tech mail", "reply from ICPS"), use
that profile. Otherwise use the one marked `default: true`. If a request clearly
belongs to a different account from the one in play, say so and switch rather
than sending from the wrong address.

**If no profile exists for the account in question, stop and offer to create
one.** Do not guess at settings and carry on: the wrong account, the wrong
compose client or a wrong filing rule all produce mail that has to be unpicked.
Say what is missing and offer to set it up:

> There is no profile for that account yet. I can create one at
> `.claude/email-accounts/<slug>.md`. I need to know: which Apple Mail account
> it is, the address to send from, whether new mail should compose in Outlook or
> Apple Mail, whether a signature is already configured in the client, and which
> folders you file into. Shall I set it up?

Then write the profile from the template in `.claude/email-accounts/README.md`,
filling the frontmatter from `accounts.sh` output and the body from the user's
answers. Leave the body sections thin: they fill up with use.

**Keep the profile current.** When the user files something somewhere the filing
map does not cover, corrects a triage judgement, or names a colleague who owns a
class of mail, add it to the profile. That is the point of the file. Say what
was added in a line, do not ask permission for each row.

---

## The two halves of the toolkit

**Reading and searching go through the MCP.** It reads Apple Mail's own index
directly, so it is fast, returns structured results, understands threads, and
never changes mail state.

| Want | MCP tool |
|---|---|
| What accounts exist | `mail_list_accounts` |
| What folders exist, with message and unread counts | `mail_list_mailboxes` |
| Find messages by sender, subject, date, unread, attachments | `mail_search_messages` |
| Read one message, with body and headers | `mail_read_message` |
| Read a whole conversation in order | `mail_read_thread` |
| What is attached to a message | `mail_list_attachments` |

**Acting on mail goes through the scripts.** The MCP is read-only by design and
will never mark, move, reply or send, so anything that changes state is a script
in this folder.

| Want | Script | Client |
|---|---|---|
| List accounts and profiles | `accounts.sh` | Mail |
| Read live mailbox state, or read without the MCP | `fetch.sh` | Mail |
| Browse and search folders without the MCP | `mailboxes.sh` | Mail |
| Reply to a message, reply-all | `reply.sh` | Mail |
| Start a new message | `compose.sh` | Outlook or Mail, per profile |
| Mark read, unread, flagged, unflagged | `mark.sh` | Mail |
| File into a folder | `move.sh` | Mail |

Every script takes `--account`, which accepts a profile slug (`jack-tech`), an
Apple Mail account name (`Exchange`), or an address. Without it they use the
default profile.

### Using the MCP well

- **Filter by account.** Pass `account_uuid` from the profile on every search,
  or results come back from every account on the machine, including personal
  mail a work profile has no business reading.
- **Mailbox names come back URL-encoded.** `Awards%2026%20Sponsors` is
  `Awards 26 Sponsors`. Decode before showing them to the user, and pass the
  decoded name to the scripts, which match what Mail displays.
- **The MCP's `message_id` is not a Message-ID.** It is a local index rowid
  (`mailmsg_90740`). To act on a message with `mark.sh` or `move.sh`, call
  `mail_read_message` with `include_headers: true` and use the real
  `Message-ID` header from the result. The scripts accept it with or without
  its angle brackets.
- **Search metadata first, read bodies second.** `mail_search_messages` never
  reads bodies; pull them only for the messages that matter.
- Junk, trash and drafts are excluded unless asked for.
- The index can lag a few moments behind Mail. When something was just filed or
  just arrived and the MCP does not show it, `fetch.sh` reads live state.

---

## Workflow

### Step 1 — Fetch the inbox

```
mail_search_messages(account_uuid: <from profile>, mailbox_role: "inbox", limit: 30)
```

Add `unread_only: true` to see only what has not been read, `date_from` to
bound it, `sender` or `subject` to narrow it.

Falling back to the script:

```bash
.claude/skills/email-inbox/fetch.sh --max 30
.claude/skills/email-inbox/fetch.sh --account jack-tech --unread --ids
.claude/skills/email-inbox/fetch.sh --search "COMELEC"
.claude/skills/email-inbox/fetch.sh --mailbox "Awards 26 Sponsors" --max 15
```

`--ids` adds the Message-ID of each result, which is what `mark.sh` and
`move.sh` want.

### Step 1b — Search beyond the inbox

Most mail is filed, so the inbox is only the live part. To find what was agreed,
what someone last said, or anything older than the current thread:

```
mail_list_mailboxes(account_uuid: ..., query: "Awards 26")
mail_search_messages(account_uuid: ..., mailbox_id: 322, query: "advert")
mail_search_messages(account_uuid: ..., mailbox_role: "sent", query: "Symposium Review")
```

The profile's **Filing map** says which folders hold what: read it rather than
listing every mailbox and guessing. Without the MCP, `mailboxes.sh --list
--filter "term"` then `--mailbox "Name" --search "term"` does the same job more
slowly.

Never browse a sent or deleted folder without a search term: they run to tens of
thousands of messages.

### Step 2 — Group into conversations

Group messages into conversations. The MCP does this properly:
`mail_read_thread` takes any message and returns its whole conversation in
order, which is better than matching subject lines by hand.

Present a summary table first:

```
You have **N conversations** in your inbox:

| # | From | Subject | Messages | Latest |
|---|------|---------|----------|--------|
| 1 | name(s) | subject | count | date |
```

Then note which need attention and which are resolved or informational. Before
deciding that, apply Step 2b.

### Step 2b — Is it actually the owner's to answer?

**Read the profile's `## Triage` section and apply it.** Landing in an inbox
does not mean a message is addressed to the owner, and drafting a reply to
everything produces mail that should not be sent, and worse, mail that cuts
across a colleague who already owns the thread.

The three checks that generalise across accounts:

1. **Who is it addressed to?** Read the To line of the latest message, not just
   the sender. If the owner is only in CC, or the mail is written to someone
   else by name, the default is **no draft**. Say what was asked and who owns
   it, then move on.
2. **Has someone handed it over?** A colleague explicitly passing something on
   makes it the owner's, whoever it was originally written to.
3. **Whose job is the substance?** The profile's Triage and People sections say
   what belongs to colleagues. When something is theirs, the right output is
   usually a note of what was asked so it gets tracked, not a draft.

**Stale threads.** An inbox that is not cleared holds old conversations
indefinitely. Check the date of the latest message. Something weeks old that has
gone quiet is usually a dead thread, and reviving it produces an apologetic
chase nobody wanted to send.

When in doubt, list it as "not obviously yours, no draft made" and let the user
ask. Under-drafting costs a sentence; over-drafting costs a reply they have to
unpick.

### Step 3 — Walk through conversations one at a time

```
**Conversation 1 of N**
**Subject:** Subject line
**Between:** Participant names
**Messages:** N emails (oldest date – newest date)

> Summary of the thread: what was discussed, what was asked, where it stands

**Latest message:**
**From:** Sender <email>
**Date:** Day, DD Month YYYY

> Body of the most recent message
```

Then ask:

> **What would you like to do?**
> - **Reply** — I'll draft a response to the latest message
> - **Skip** — move to the next conversation
> - **Read all** — show every message in this thread
> - **File it** — move it to a folder and mark it read
> - **Search** — find a specific email
> - Or tell me what you'd like to say and I'll draft it

### Step 4 — Draft replies

1. **Read the whole thread** with `mail_read_thread` before drafting. A reply
   written off the latest message alone repeats what was settled three messages
   ago.
2. **Show the draft** in a code block first.
3. **Ask** before opening it.
4. **Open the draft** with `reply.sh`.

```bash
.claude/skills/email-inbox/reply.sh \
  --message-id "<GV4P189MB3607...@...OUTLOOK.COM>" \
  --body "Hi Tracy,

Thanks for confirming.

Kind regards,"
```

Matching by `--message-id` is exact. Without one, `--sender` matches the first
(most recent) message from that sender, so add `--subject` whenever the sender
has more than one thread in play.

Replies always go through **Apple Mail**, whatever the profile's compose client
is: Mail holds every account, and its reply-all keeps the thread and the
existing recipients. Use `--cc` only for addresses not already on the thread,
and only when you know the address for certain from the conversation. Never
invent one.

Use `--html` when the body has links or formatting, wrapping it in a `<div>`
with `<p>` paragraphs and `<a href='...'>` links.

### Step 5 — Draft a new email

For a new conversation rather than a reply:

1. Confirm recipients. If an address is unknown, ask, or pass
   `placeholder@example.com` and say so.
2. **Show the draft** in a code block.
3. **Ask** before opening it.
4. **Open the draft** with `compose.sh`.

```bash
.claude/skills/email-inbox/compose.sh \
  --to "someone@example.org" \
  --subject "Subject" \
  --html \
  --body "<p>Hi Name,</p><p>...</p><p>Kind regards,</p>"
```

The client comes from the profile's `compose_client`. Outlook renders HTML
properly and is right for any account it holds. Apple Mail is the only option
for accounts Outlook does not have; its drafts carry a plain-text body, so an
`--html` body is flattened (links kept inline as URLs) and the formatted version
is left on the clipboard for the user to paste if they want it. The script says
so when that happens.

### Step 5b — Compose from a template

Some emails recur. When the request matches a template in
`.claude/skills/email-inbox/templates/` (index in that folder's `README.md`),
start from the template rather than from scratch:

1. Read the template. It gives recipients, subject, the bracketed fields, and a
   ready-to-run `compose.sh --html` command.
2. Fill every field from the user, the event's data file, or the relevant
   `projects/<project>/` folder. Leave nothing bracketed.
3. Show the filled body and ask before opening it.

The wording is a starting point, not a script. Adjust it to the recipient, and
when drafting several from one template in a sitting, vary the skeleton.

A profile can point at its own templates folder with a `templates:` key.

### Step 6 — File, mark and flag

Filing is how the inbox stays a list of live threads. Once a conversation is
dealt with, offer to file it.

```bash
# Mark read, by exact id
.claude/skills/email-inbox/mark.sh --read --message-id "<id>"

# Flag something to come back to
.claude/skills/email-inbox/mark.sh --flag --sender "raj@adaga.in" --subject "Booking"

# Mark a whole thread read
.claude/skills/email-inbox/mark.sh --read --subject "Manila workshop" --all

# File it, checking first
.claude/skills/email-inbox/move.sh --to "Awards 26 Sponsors" --message-id "<id>" --dry-run
.claude/skills/email-inbox/move.sh --to "Awards 26 Sponsors" --message-id "<id>"
```

Rules for filing:

- **Read the profile's Filing map first** and use a folder it names. If nothing
  fits, ask where it should go, then add the answer to the map.
- **Confirm before moving.** Marking read is cheap to undo; moving is not, and
  a wrong destination scatters mail with no undo beyond moving it back.
- **`--dry-run` first** whenever the match is by sender or subject rather than
  by message id. It lists what would move and moves nothing.
- **`--all` moves every match.** Without it, only the most recent one moves.
  Use it for a whole thread, never as a default.
- Destinations match on the leaf name. If a name exists in two places the script
  says so and asks for the full path (`Electoral/Awards 26 Sponsors`).
- Folder names are matched exactly, typos and all. Several older mailboxes are
  misspelled in Mail itself; match what is there rather than correcting it.

### Step 7 — Continue through the inbox

After each conversation is handled, move to the next. Keep a running count so
the user knows their progress. If they say "skip all" or "just show me the
list", present the summary table again.

---

## Style for drafts

**The voice comes from the profile.** Read the file its `voice:` key names
before drafting anything, and follow it. What follows applies whatever the
account.

- **No em dashes.** Use commas, full stops, semicolons or parentheses. This
  covers HTML bodies: no `&mdash;` either.
- **Signatures follow the profile's `signature:` key.** `client` means one is
  configured in the mail client and appended automatically, so the draft ends at
  "Kind regards," with no name, title or contact block; anything added
  duplicates it. `none` means the draft signs off in full.
- Concise and focused. One clear ask per email.
- Show the draft in a code block before opening it, so the user can change it.
- **Link to the event page** in any email that invites someone to, or
  references, a webinar, roundtable or awards event: the live
  `electoralnetwork.org/events/<id>` URL, hyperlinked on descriptive text such
  as "the event page", never a bare URL.
- **Run drafts through `/humanizer`** before showing them.

---

## Scripts

All scripts are in `.claude/skills/email-inbox/` and share `lib.sh`, which
resolves the account and reads the profile. Each has its usage in a header
comment.

| Script | Purpose |
|---|---|
| `accounts.sh` | List Apple Mail accounts (name, UUID, addresses) and configured profiles |
| `fetch.sh` | Read a mailbox live: `--max`, `--search`, `--offset`, `--unread`, `--ids`, `--mailbox` |
| `mailboxes.sh` | `--list [--filter]` to see folders; `--mailbox "Name" [--search] [--preview\|--full] [--ids]` to browse one |
| `reply.sh` | Reply-all draft in Apple Mail: `--message-id` or `--sender`/`--subject`, `--body`, `--cc`, `--html` |
| `compose.sh` | New draft: `--to`, `--subject`, `--body`, `--cc`, `--bcc`, `--html`, `--attach`, `--client` |
| `mark.sh` | `--read`/`--unread`/`--flag`/`--unflag`, matched by `--message-id` or `--sender`/`--subject`, plus `--all`, `--dry-run` |
| `move.sh` | `--to "Folder"`, matched by `--message-id` or `--sender`/`--subject`, plus `--from-mailbox`, `--all`, `--dry-run` |

### HTML in Outlook composes

**Always use `--html`** for any email with structure: lists, links, bold,
headings. Outlook's `content` property is HTML, so plain-text bullets render as
one run-on paragraph. Real structure needs real tags.

Plain-text mode is safe for simple prose: newlines become `<br>`, so paragraphs
and blank lines survive. It never produces bullets or bold.

The script wraps `--body` in this shell, so supply only the inner HTML:

```html
<body style='font-family: Calibri, Arial, sans-serif; font-size: 15px;'>
  <!-- your --body goes here -->
</body>
```

with `p { margin: 0 0 14px 0 }`, `p:last-child { margin-bottom: 0 }`, and
margins on `ul`/`ol`/`li`.

- `<p>` for paragraphs. **Spacing is handled by the wrapper**, so write
  consecutive `<p>` siblings and they space properly. Do not add
  `<p>&nbsp;</p>` spacers or inline `style='margin...'`: the wrapper already
  supplies the margin and extras double it up. (The wrapper previously set
  `p { margin: 0 }`, which collapsed multi-paragraph drafts into one solid
  block; fixed 17 Aug 2026. If a draft ever looks cramped again, check that
  rule first rather than papering over it with spacers.)
- `<b>` or `<strong>`, `<i>` or `<em>`, `<ol><li>`, `<ul><li>` (do not wrap
  `<li>` content in `<p>`), `<a href='...'>`, `<br>`.
- `&amp;`, `&lt;`, `&gt;`, `&nbsp;`. **Never** `&mdash;` or an em dash.
- **Use single quotes inside HTML attributes.** The body is passed to
  AppleScript wrapped in double quotes, so single quotes avoid escaping.

Example:

```bash
.claude/skills/email-inbox/compose.sh \
  --to "tracy.drewett@parlicentre.co.uk" \
  --subject "Awards categories, proposed revamp" \
  --html \
  --body "<p>Hi Tracy,</p>
<p>Quick proposal on the awards categories. New slate below:</p>
<ol>
<li><b>International Electoral Cooperation Award</b>, renamed from International Institutional Engagement.</li>
<li><b>Electoral Conflict Management Award</b>, unchanged.</li>
</ol>
<p>Full details at <a href='https://electoralnetwork.org/admin/comms-plan'>the comms plan dashboard</a>.</p>"
```

### How the reply script works

- Generates an AppleScript at `/tmp/mail-reply.applescript`
- Opens a reply window on the resolved account, adds any CC recipients
- Moves the cursor to the top with `Cmd+Up`, then pastes the body
- **Never sends**

Constraints baked into the script, do not undo them:

- Do **not** set the `content` property of a reply: it overwrites the thread.
- Do **not** use `Cmd+A`: it can select and replace the thread.
- The `delay 2` after opening the reply window lets it load before pasting.

---

## Email templates

Reusable emails live in `.claude/skills/email-inbox/templates/`, one file per
template, grouped by area. `templates/README.md` holds the index, the shared
conventions, and how to add a new one.

| Template | Use it when | File |
|---|---|---|
| Speaker briefing | Sending confirmed webinar or roundtable speakers their logistics about a week out | `templates/webinars/speaker-briefing.md` |
| Delegate briefing | Sending registered delegates their joining details, usually the day before | `templates/webinars/delegate-briefing.md` |
| Sponsor welcome | First logistics email to a newly signed Awards sponsor or exhibitor | `templates/awards/sponsor-welcome.md` |
| Sponsor nominations ask | Asking a sponsor to nominate the partner commissions they work with | `templates/awards/sponsor-nominations.md` |

See Step 5b for the workflow.

---

## Key rules

1. **Never send an email.** Only open drafts for the user to review and send.
2. **Establish the account first.** Read its profile, and its voice file, before
   acting. No profile means offer to create one, not carry on with guesses.
3. **One account at a time.** Every MCP search takes the profile's
   `account_uuid`; every script takes its account. Do not reach into other
   accounts, and do not write ad-hoc AppleScript that ignores the scoping.
4. **Do not draft a reply to everything.** Apply the profile's Triage section.
   See Step 2b.
5. **Replies through Apple Mail, new composes through the profile's client.**
6. **Always reply-all.** `reply.sh` preserves existing CC recipients; `--cc` is
   for additional ones only.
7. **Preserve the thread in replies.** Clipboard paste after `Cmd+Up`. Never
   `set content of`, never `Cmd+A`.
8. **Show the draft first**, in a code block.
9. **Match by Message-ID** where one is available; by sender plus subject
   otherwise.
10. **Confirm before moving mail**, and `--dry-run` any move matched by sender
    or subject.
11. **Follow the profile's voice file and signature setting**, and never use em
    dashes.
12. **Keep the profile updated** as filing rules, people and triage judgements
    come to light.

## Notes

- Apple Mail must be running, or the scripts will launch it. Outlook likewise
  for composes that use it.
- The first run may trigger a macOS permission prompt for the terminal to
  control Mail or Outlook, and the MCP may need Full Disk Access
  (`mail_permissions_check` diagnoses it).
- For very large mailboxes keep `--max` reasonable, and prefer the MCP, which
  queries an index rather than walking messages.
