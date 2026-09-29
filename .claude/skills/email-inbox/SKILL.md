---
name: email-inbox
description: Email assistant for any mailbox configured in Apple Mail. Sweeps an inbox in one pass: works out what is new, what actually needs a reply from the owner, files everything that does not, and leaves deliberate reminders untouched. Reads and searches through the apple-mail-readonly MCP, drafts replies in Apple Mail and new composes in Outlook or Mail, and files, flags and marks mail in batches. Which account, which client, whose voice and where things get filed all come from an account profile in .claude/email-accounts/. Use when the user wants to clear or triage an inbox, search past correspondence, follow a thread, reply, compose, file mail into folders, or write one of the standard emails from a template.
argument-hint: [optional: account name, "new", "all", a number, or a search term; no argument sweeps the default account's inbox]
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

## What a run is for

The inbox is not a to-do list. A run exists to get it back to holding only two
things: **threads waiting on a reply the owner owes**, and **messages the owner
is deliberately keeping in front of himself**. Everything else is filed.

So a default run is a **sweep**, not a tour:

1. work out what has arrived since the last sweep,
2. sort every conversation into **reply**, **file** or **park**,
3. show the whole plan as one table and take **one** confirmation,
4. file the whole file-pile in a single batch,
5. then spend the time on the handful that need drafting.

Do not walk the inbox one conversation at a time asking what to do with each.
That is the slow path, and it is only right when the user asks for it
(`/email-inbox walk`) or when the reply pile is what is left.

## Invoked with no arguments

`/email-inbox` on its own means **sweep the default account's inbox**: Step 0,
then Steps 1 to 6. The default account is the profile whose frontmatter says
`default: true`.

Say which account is in play in the first line of the reply, so a wrong default
is caught before anything is drafted or moved:

> Reading **jack-icps** (Exchange, jack.vanderpump@publicpolicyexchange.co.uk).
> 14 conversations, 6 new since the last sweep on 11 September, 3 parked.

An argument changes the starting point, not the account rules:

| Argument | What it means |
|---|---|
| *(none)* | sweep the default account's inbox |
| `new` | sweep, but only what arrived since the last sweep |
| `all` | sweep, including parked messages (offers to unpark) |
| `walk` | the old one-at-a-time tour of every conversation |
| `park` | park the conversation just discussed, as a reminder |
| a profile slug or account name (`jack-tech`) | sweep that account instead |
| a number (`10`) | sweep, capped at that many messages |
| any other text (`COMELEC`, `sponsor invoices`) | search rather than sweep, on the default account |

Anything ambiguous between an account name and a search term is an account
name; say so and offer the search if that was not the intent.

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
| Run a whole triage pass: file, mark and park in one batch | `sweep.sh` | Mail |
| List accounts and profiles | `accounts.sh` | Mail |
| Read live mailbox state, or read without the MCP | `fetch.sh` | Mail |
| Browse and search folders without the MCP | `mailboxes.sh` | Mail |
| Reply to a message, reply-all | `reply.sh` | Mail |
| Start a new message | `compose.sh` | Outlook or Mail, per profile |
| Mark one message read, unread, flagged, unflagged | `mark.sh` | Mail |
| File one message into a folder | `move.sh` | Mail |

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
- **The MCP's `to` field is every recipient, not the To line.** It folds CC in,
  so a message addressed to one person and copied to another comes back with
  both in `to` and the second also in `cc`. Never read it as evidence that
  someone is on the To line, and never report a duplicate-recipient bug from it.
  Apple Mail's `to recipients` / `cc recipients` are the authority when it
  matters. (Nearly mis-reported as a compose bug, 22 September 2026.)
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

### Step 1 — Load state, then fetch what is new

State first. It says when the inbox was last swept, and which messages the
owner is deliberately keeping in it.

```bash
.claude/skills/email-inbox/sweep.sh --state
```

- `swept <timestamp>` — the watermark. Anything received after it is **new**.
- `parked <id>` — a deliberate reminder. Never proposed, never touched.
- `awaiting <id>` — a reply was drafted and the message filed, but the send was
  never confirmed. **Settle these against Sent Items before reporting them.**
  One search per thread is cheap, and the owner often sends a draft while the
  run is still going, which makes the row stale the moment it is written. Say
  what actually went and what is genuinely still sitting in drafts. (On 22
  September 2026 four of five drafts had already been sent by the time the
  closing report was written.)

**Note the time before you read**, and pass it to `sweep.sh --swept-at` at the
end of the run:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
```

A run takes minutes. Anything arriving while you classify and draft is stamped
below a watermark set at the end, and never shows up as new again. Three
messages nearly went that way on 22 September 2026.

Then read the inbox:

```
mail_search_messages(account_uuid: <from profile>, mailbox_role: "inbox", limit: 40)
```

**Never pass `date_from`.** It is broken in this MCP: any search carrying it
returns an empty list, with no error and no warning, so a `new` sweep reports a
clean inbox that is not clean. Confirmed again 22 September 2026, on a sent
search that returned results the moment the filter came off. Fetch without it
and compare each message's `date` (Unix epoch) against the watermark in code.

Fetch the whole inbox for a
plain sweep, because filing decisions need the old messages too, and let the
parked list rather than the date decide what to leave alone.

Falling back to the script when the MCP is unavailable or its index is stale:

```bash
.claude/skills/email-inbox/fetch.sh --max 40 --ids
.claude/skills/email-inbox/fetch.sh --account jack-tech --unread --ids
```

`--ids` gives the Message-ID of each result, which is what every action wants.
**Collect ids as you go**: a sweep plan is built from them, and going back for
them afterwards costs another pass over the mailbox.

### Step 2 — Sort every conversation into reply, file or park

Group messages into conversations first (`mail_read_thread` takes any message
and returns its whole conversation in order, which beats matching subject lines
by hand). Then put every conversation in exactly one of three buckets.

**R — Reply.** The owner owes someone an answer. All three have to hold:

1. it is **addressed to him**, not just copied to him, or a colleague has
   **handed it over** ("Jack can you follow up on this", "Please advise", a
   forward with a direct question attached),
2. the substance is **his** rather than a colleague's, by the profile's Triage
   and People sections,
3. the **last message is not his**. If he sent it, the ball is with them, and
   that is a park, not a reply.

**F — File.** Nothing is owed and the thread is done with. The usual shapes:

- an answer he asked for and has now got,
- a thank-you or acknowledgement that closes the thread,
- CC-only traffic where a colleague owns it and has it in hand,
- confirmations, registrations and delegate logistics the events team record,
- notifications, newsletters, receipts, calendar acceptances.

Each one needs a destination from the profile's **Filing map**. If nothing in
the map fits, do not invent a folder: leave it in the inbox, say so in the
table, and ask once at the end of the run where that class of mail should go.
Then add the answer to the map.

**P — Park.** Leave it exactly as it is, unread status included. Park covers:

- **anything already in the parked list**. Do not re-propose it, do not list it
  by name. One line at the top of the run ("3 parked, untouched") is the whole
  report,
- **the owner's own reminders**: something sitting in the inbox that he has
  clearly chosen to keep in front of himself,
- **waiting on them**: he sent the last message and is expecting a reply,
- **anything old and quiet**. An old message still in the inbox is there on
  purpose. It is not an overdue action and it is not rubbish. Do not draft a
  chase, do not file it away, do not ask about it. Leave it and park it.

The last point matters more than it looks. An inbox that is not cleared fills
with mail that is neither live nor dead: it is the owner's own memory. Filing
it is worse than leaving it, because it disappears from the one place he looks.

**The default for anything ambiguous is park.** Under-acting costs a line in a
table. Over-acting costs a reply he has to unpick or a thread he has to find
again.

### Step 3 — Show the plan, take one confirmation

One table for the whole run, in bucket order, then one question. Never one
question per message.

```
**jack-icps** (Exchange) — 14 conversations, 6 new since 11 September, 3 parked and untouched.

**Needs you (3)**

| # | From | Subject | Age | Why |
|---|------|---------|-----|-----|
| 1 | Crescenda Babiera | Conference programme advert | 1d | asks you to confirm the 28 Sept call |

**Filing (8)**

| # | From | Subject | Age | To |
|---|------|---------|-----|----|
| 4 | Cesar Flores | RE: delegate details | 2d | Awards 26 Delegates — Swastee has it |

**Parking (3)** — left untouched

| # | From | Subject | Age | Why |
|---|------|---------|-----|-----|
| 12 | Declan O'Brien | Kofi Annan Foundation | 3w | quiet, your reminder to keep |

> File the 8, park the 3, and draft the 3 replies?
```

Keep the "why" column to a handful of words. The table is the reasoning; do not
also write it out in prose.

If the user changes a call ("no, Cesar's is mine", "don't file the Laxton one"),
move that row and carry on. If it is a change of rule rather than a one-off,
put it in the profile before the run ends.

### Step 4 — Sweep: file and park in one batch

`move.sh` and `mark.sh` act on one message per run of Mail. Filing eight that
way is eight walks of the inbox. `sweep.sh` takes a plan, resolves every
destination first, walks the inbox once, and does the lot in a few seconds.

Write the plan to the scratchpad as tab-separated lines:

```
<message-id>	file	Awards 26 Sponsors
<message-id>	file	Awards 26 Delegates
<message-id>	file-unread	Electoral Press
<message-id>	park		his own reminder to chase the floorplan
<message-id>	read
```

Then run it:

```bash
.claude/skills/email-inbox/sweep.sh --plan /path/to/sweep.tsv --dry-run
.claude/skills/email-inbox/sweep.sh --plan /path/to/sweep.tsv --swept-at 2026-09-22T18:40:00Z
```

- `file` marks read and files. `file-unread` files without marking read, for
  something worth reading later in its folder.
- `park` touches the message in no way at all. It only records the id, so later
  runs stay quiet about it.
- `read` and `flag` leave the message in the inbox.
- A destination that does not exist, or an ambiguous leaf name, **fails the
  whole plan before anything moves**. Fix the row and re-run.
- `--dry-run` when any destination in the plan is one this account has not
  filed to before. Otherwise the confirmation in Step 3 is the check, and a
  second one just slows the run down.

Parked ids survive between runs, and are dropped automatically once the message
leaves the inbox.

### Step 5 — Work the reply pile

Only now, and only the R bucket. For each, in order:

1. **Read the whole thread** with `mail_read_thread`. A reply written off the
   latest message alone repeats what was settled three messages ago.
2. **Draft it** to the profile's voice, run it through `/humanizer`, and show
   it in a code block.
3. **Open the draft** with `reply.sh` once the user is happy (see *Draft
   replies* below).
4. **File the original** as the draft opens, with an `awaiting` row:

```
<message-id>	awaiting	Awards 26 Sponsors	replied re 28 Sept call
```

`awaiting` files the message exactly as `file` does, and records that a reply
was drafted but not seen sent. That keeps the inbox honest: the thread is dealt
with from its point of view, and the state file carries the loose end.

If the user would rather keep a replied-to thread in the inbox until they have
actually sent, use `read` instead and say so. Do not decide that silently.

Draft several replies in one pass where the user is happy to review them
together: show all of them, then open them one after another. Reviewing three
drafts at once is faster than three rounds of show-ask-open.

### Step 6 — Close the run

Three lines, no more:

```
Filed 8, parked 3, 3 replies drafted and waiting in Mail for you to send.
Left in the inbox: the 3 you're replying to, plus the 3 parked.
Nothing matched a filing rule for the Eventbrite receipts — where should those go?
```

Then add anything learned to the profile: a new filing row, a correction to a
triage call, a colleague who owns a class of mail. Say what was added in a
line, do not ask permission for each one.

### Searching beyond the inbox

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

A sent-folder search is also how to settle an `awaiting` row when the user asks
whether a reply ever went.

### Draft replies

1. **Read the whole thread** before drafting.
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

**A reply that needs a letter or a document takes `--attach`.** Repeat it per
file. Do not reach for `compose.sh` because it has attachments: a compose breaks
the thread, rebuilds the recipients from scratch, and leaves a "Re:" subject
with nothing behind it. (Done wrongly on 22 September 2026 with the A Daga visa
letters, when `reply.sh` had no `--attach`; the flag was added the same day.)

```bash
.claude/skills/email-inbox/reply.sh \
  --mailbox "Awards 26 Sponsors" \
  --message-id "<CAFRMrpL...@mail.gmail.com>" \
  --attach projects/awards26/letters/2026-09-22-invitation-rajendra-daga.pdf \
  --attach projects/awards26/letters/2026-09-22-invitation-emil-mariya-benny.pdf \
  --body "Hi Raj, ..."
```

The files are pasted into the reply window straight after the body, the way a
Finder copy and paste would. Mail's scripting model cannot see pasted
attachments, so the script cannot confirm them: **tell the user to check the
attachment shows on the draft** before sending. Pass `--mailbox` when the message
has already been filed; without it the script only looks in the Inbox.

Use `--html` when the body has links or formatting, wrapping it in a `<div>`
with `<p>` paragraphs and `<a href='...'>` links.

### Draft a new email

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

### Compose from a template

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

### One-off filing, marking and flagging

`sweep.sh` is for a run. For a single correction afterwards, or for a thread
being dealt with outside a sweep, the single-message scripts are simpler:

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

Rules for filing, whichever script does it:

- **Read the profile's Filing map first** and use a folder it names. If nothing
  fits, ask where it should go, then add the answer to the map.
- **`--dry-run` first** whenever the match is by sender or subject rather than
  by message id. It lists what would move and moves nothing.
- **`--all` moves every match.** Without it, only the most recent one moves.
  Use it for a whole thread, never as a default.
- Destinations match on the leaf name. If a name exists in two places the script
  says so and asks for the full path (`Electoral/Awards 26 Sponsors`).
- Folder names are matched exactly, typos and all. Several older mailboxes are
  misspelled in Mail itself; match what is there rather than correcting it.
- Moving is the one thing here with no undo beyond moving it back. Within a run
  the Step 3 table is the confirmation; outside one, ask.

To park or unpark by hand:

```bash
.claude/skills/email-inbox/sweep.sh --park "<id>" --note "chase after the board meets"
.claude/skills/email-inbox/sweep.sh --unpark "<id>"
```

### The slow walk, when it is asked for

`/email-inbox walk`, or any request to go through the inbox one at a time,
means the conversation-by-conversation tour:

```
**Conversation 1 of N**
**Subject:** Subject line
**Between:** Participant names
**Messages:** N emails (oldest date - newest date)

> Summary of the thread: what was discussed, what was asked, where it stands

**Latest message:**
**From:** Sender <email>
**Date:** Day, DD Month YYYY

> Body of the most recent message
```

Then ask:

> **What would you like to do?**
> - **Reply** - I'll draft a response to the latest message
> - **Skip** - move to the next conversation
> - **Read all** - show every message in this thread
> - **File it** - move it to a folder and mark it read
> - **Park it** - leave it in the inbox and stop raising it
> - Or tell me what you'd like to say and I'll draft it

Keep a running count so the user knows their progress. If they say "skip all"
or "just show me the list", go back to the Step 3 table.

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
| `sweep.sh` | The batch script. `--plan FILE` files, marks and parks a whole run in one pass; `--state` shows the watermark, parked and awaiting; `--park`/`--unpark` by id; `--dry-run` |
| `accounts.sh` | List Apple Mail accounts (name, UUID, addresses) and configured profiles |
| `fetch.sh` | Read a mailbox live: `--max`, `--search`, `--offset`, `--unread`, `--ids`, `--mailbox` |
| `mailboxes.sh` | `--list [--filter]` to see folders; `--mailbox "Name" [--search] [--preview\|--full] [--ids]` to browse one |
| `reply.sh` | Reply-all draft in Apple Mail: `--message-id` or `--sender`/`--subject`, `--body`, `--cc`, `--attach`, `--html` |
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
- Pastes any `--attach` files as file URLs straight after the body
- **Never sends**

Constraints baked into the script, do not undo them:

- Do **not** set the `content` property of a reply: it overwrites the thread.
- Do **not** attach through the content either (`tell content of replyMsg to
  make new attachment`). It is a write to the content by another route, and it
  wiped the quoted thread from the Tracy trainers reply on 28 September 2026.
  Attachments go in by paste.
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
| Nomination received | Confirming to a commission that its nomination arrived. The most repeated email of the cycle; look it up in MongoDB before confirming | `templates/awards/nomination-received.md` |

See Step 5b for the workflow.

---

## Key rules

1. **Never send an email.** Only open drafts for the user to review and send.
2. **Establish the account first.** Read its profile, and its voice file, before
   acting. No profile means offer to create one, not carry on with guesses.
3. **One account at a time.** Every MCP search takes the profile's
   `account_uuid`; every script takes its account. Do not reach into other
   accounts, and do not write ad-hoc AppleScript that ignores the scoping.
4. **Sweep, do not tour.** One classification pass, one table, one
   confirmation, one batch. The conversation-by-conversation walk is for when
   it is asked for.
5. **Do not draft a reply to everything.** Apply the profile's Triage section.
   Copied-in is not addressed-to; a colleague's job is not the owner's.
6. **A reply is owed only if the last message is not his.** If he sent it, he is
   waiting, and that is a park.
7. **Never touch a parked message.** Not moved, not marked, not raised again.
   Old and quiet means kept on purpose, not forgotten: park it rather than
   filing it or chasing it.
8. **File everything that is settled**, to a folder the Filing map names. No
   rule in the map means ask once at the end of the run, then add the answer.
9. **Replies through Apple Mail, new composes through the profile's client.**
10. **Always reply-all.** `reply.sh` preserves existing CC recipients; `--cc` is
    for additional ones only.
11. **Preserve the thread in replies.** Clipboard paste after `Cmd+Up`. Never
    `set content of`, never `Cmd+A`.
12. **Show drafts first**, in a code block, and file the original as the draft
    opens.
13. **Match by Message-ID** where one is available; by sender plus subject
    otherwise.
14. **A sweep plan fails whole or not at all.** A bad destination stops it
    before anything moves; fix the row rather than splitting the run.
15. **Follow the profile's voice file and signature setting**, and never use em
    dashes.
16. **Keep the profile updated** as filing rules, people and triage judgements
    come to light.

## Notes

- Apple Mail must be running, or the scripts will launch it. Outlook likewise
  for composes that use it.
- The first run may trigger a macOS permission prompt for the terminal to
  control Mail or Outlook, and the MCP may need Full Disk Access
  (`mail_permissions_check` diagnoses it).
- For very large mailboxes keep `--max` reasonable, and prefer the MCP, which
  queries an index rather than walking messages.
- Per-account state (the sweep watermark, the parked list, awaiting rows) lives
  in `.claude/email-accounts/state/<slug>.tsv`. It is local working state and
  is not committed. Deleting it loses the parked list, which means the next
  sweep raises those messages again; nothing else breaks.
