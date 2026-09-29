---
name: email-inbox
description: Email assistant for any mailbox configured in Apple Mail. Sweeps an inbox in one pass: works out what is new, what actually needs a reply from the owner, files everything that does not, and leaves deliberate reminders untouched. Reads and searches through the apple-mail-readonly MCP, drafts replies in Apple Mail and new composes in Outlook or Mail, and files, flags and marks mail in batches. Which account, which client, whose voice and where things get filed all come from an account profile in .claude/email-accounts/. Use when the user wants to clear or triage an inbox, search past correspondence, follow a thread, reply, compose, file mail into folders, or write one of the standard emails from a template.
argument-hint: [optional: account name, "new", "all", a number, or a search term; no argument sweeps the default account's inbox]
allowed-tools: Bash, Read, Write, Edit
---

# Email Assistant

An email assistant for any mailbox Apple Mail holds. It reads and searches through the **apple-mail-readonly MCP**, acts on mail through the scripts in this folder, and **never sends anything**: every outgoing message is opened as a draft for the user to review and send.

Everything account-specific (which account, which folders, whose voice) lives in an **account profile** in `.claude/email-accounts/`, not in this skill.

Two reference files hold the detail, read when needed:

- `references/drafting.md`: **read before drafting any reply or new email.** Replies, attachments, composes, templates, HTML, signatures.
- `references/scripts.md`: the scripts and their flags, reading without the MCP, one-off filing and marking, and the one-at-a-time walk.

## What a run is for

The inbox is not a to-do list. A run gets it back to holding only two things: **threads waiting on a reply the owner owes**, and **messages the owner is deliberately keeping in view**. Everything else is filed.

So a default run is a **sweep**, not a tour: work out what is new, sort every conversation into **reply**, **file** or **park**, show the plan as one table and take **one** confirmation, file the lot in a single batch, then spend the time on the replies. Do not walk the inbox one conversation at a time unless asked (`/email-inbox walk`).

## Arguments

`/email-inbox` on its own sweeps the default account's inbox (the profile with `default: true`). Say which account is in play in the first line, so a wrong default is caught before anything moves:

> Reading **jack-icps** (Exchange, jack.vanderpump@publicpolicyexchange.co.uk).
> 14 conversations, 6 new since the last sweep on 11 September, 3 parked.

| Argument | Meaning |
|---|---|
| *(none)* | sweep the default account's inbox |
| `new` | sweep only what arrived since the last sweep |
| `all` | sweep, including parked messages (offers to unpark) |
| `walk` | the one-at-a-time tour (`references/scripts.md`) |
| `park` | park the conversation just discussed |
| a profile slug or account name (`jack-tech`) | sweep that account instead |
| a number (`10`) | sweep, capped at that many messages |
| any other text (`COMELEC`) | search rather than sweep, on the default account |

Anything ambiguous between an account name and a search term is an account name; say so and offer the search.

## Step 0: Establish the account

**Before anything else, every time:**

```bash
.claude/skills/email-inbox/accounts.sh
```

It prints the accounts Apple Mail has (with the UUIDs the MCP filters on) and the profiles configured.

- **A profile matches: read it in full, and the voice file it names, before acting.** Its frontmatter fixes the account, compose client and voice; its body carries the filing map, triage rules and people.
- Use the account the user named ("check my Tech mail"), otherwise the default. If a request belongs to a different account from the one in play, say so and switch.
- **No profile for the account: stop and offer to create one** at `.claude/email-accounts/<slug>.md`, from the template in that folder's `README.md`. Ask which Apple Mail account it is, the address to send from, Outlook or Apple Mail for composes, whether the client already adds a signature, and the folders filed into. Do not guess and carry on.
- **Keep the profile current.** When the user files somewhere the map does not cover, corrects a triage call, or names a colleague who owns a class of mail, add it, and say so in a line.

## Tools

**Reading goes through the MCP**: fast, thread-aware, never changes mail state. `mail_list_accounts`, `mail_list_mailboxes` (folders with counts), `mail_search_messages` (metadata only), `mail_read_message`, `mail_read_thread`, `mail_list_attachments`.

**Acting goes through the scripts**, since the MCP is read-only: `sweep.sh` (batch file, mark, park, settle), `reply.sh`, `compose.sh`, `mark.sh`, `move.sh`, plus `fetch.sh` and `mailboxes.sh` for reading without the MCP. Flags in `references/scripts.md`.

MCP pitfalls:

- **Pass the profile's `account_uuid` on every search**, or results come from every account on the machine.
- **Never pass `date_from`.** Any search carrying it silently returns nothing. Fetch without it and compare each message's `date` (Unix epoch) yourself.
- **`message_id` is a local rowid, not a Message-ID.** To act on a message, call `mail_read_message` with `include_headers: true` and use the real `Message-ID` header (angle brackets optional).
- **`to` is every recipient, CC included.** Never read it as the To line; Apple Mail's `to recipients` and `cc recipients` are the authority.
- **Mailbox names come back URL-encoded** (`Awards%2026%20Sponsors`). Decode before showing them or passing them to scripts.
- Search metadata first, read bodies second. Junk, trash and drafts are excluded unless asked for. The index can lag a few moments behind Mail; `fetch.sh` reads live state.

## Step 1: Load state, then fetch what is new

```bash
.claude/skills/email-inbox/sweep.sh --settle
```

That checks each **awaiting** row (a reply drafted, send not seen) against Sent Items, clears the ones that went, and prints the rest of the state:

- `swept <timestamp>`: the watermark. Anything received after it is **new**.
- `parked <id>`: a deliberate reminder. Never proposed, never touched.
- `awaiting <id>`: still unsent after the settle. Report these as drafts waiting, not as done.

If the settle cannot read Mail's index it says so; then search Sent Items with the MCP, one search per thread.

**Note the time before reading** (`date -u +%Y-%m-%dT%H:%M:%SZ`) and pass it to `sweep.sh --swept-at` at the end, so mail arriving while you classify and draft is not stamped below the watermark.

Then read the inbox: `mail_search_messages(account_uuid: …, mailbox_role: "inbox", limit: 40)`. Fetch the whole inbox for a plain sweep, since filing decisions need the old messages too, and let the parked list rather than the date decide what to leave alone.

## Step 2: Sort every conversation into reply, file or park

Group messages into conversations (`mail_read_thread` returns a whole conversation from any message), then put each in exactly one bucket.

**R: Reply.** The owner owes an answer. All three must hold:

1. it is **addressed to them**, not just copied, or a colleague has **handed it over** ("can you follow up on this", a forward with a direct question),
2. the substance is **theirs** rather than a colleague's, by the profile's Triage and People sections,
3. the **last message is not theirs**. If they sent it, the ball is with the other side: that is a park.

**F: File.** Nothing is owed and the thread is done: an answer they asked for and got, a thank-you that closes the thread, CC-only traffic a colleague owns, confirmations and logistics the events team record, notifications, newsletters, receipts, calendar acceptances. Each needs a destination from the profile's **Filing map**. If nothing fits, leave it, say so in the table, and ask once at the end where that class of mail goes; then add the answer to the map.

**P: Park.** Leave it exactly as it is, unread status included:

- anything already parked (one line at the top, "3 parked, untouched", is the whole report),
- the owner's own reminders, kept in the inbox on purpose,
- waiting on them: the owner sent the last message,
- **anything old and quiet.** An old message still in the inbox is there on purpose: the inbox is the owner's memory. Do not draft a chase, file it or ask about it.

**The default for anything ambiguous is park.** Under-acting costs a line in a table; over-acting costs a reply to unpick or a thread to find again.

## Step 3: Show the plan, take one confirmation

One table for the whole run, in bucket order, then one question:

```
**jack-icps** (Exchange): 14 conversations, 6 new since 11 September, 3 parked and untouched.

**Needs you (3)**
| # | From | Subject | Age | Why |
|---|------|---------|-----|-----|
| 1 | Crescenda Babiera | Conference programme advert | 1d | asks you to confirm the 28 Sept call |

**Filing (8)**
| # | From | Subject | Age | To |
|---|------|---------|-----|----|
| 4 | Cesar Flores | RE: delegate details | 2d | Awards 26 Delegates (Swastee has it) |

**Parking (3)**, left untouched
| # | From | Subject | Age | Why |
|---|------|---------|-----|-----|
| 12 | Declan O'Brien | Kofi Annan Foundation | 3w | quiet, a reminder to keep |

> File the 8, park the 3, and draft the 3 replies?
```

Keep "why" to a handful of words; the table is the reasoning. If the user changes a call, move that row and carry on. If it is a change of rule rather than a one-off, put it in the profile before the run ends.

## Step 4: File and park in one batch

Write the plan to the scratchpad as tab-separated lines:

```
<message-id>	file	Awards 26 Sponsors
<message-id>	file-unread	Electoral Press
<message-id>	park		a reminder to chase the floorplan
<message-id>	read
```

```bash
.claude/skills/email-inbox/sweep.sh --plan /path/to/sweep.tsv --swept-at 2026-09-22T18:40:00Z
```

- `file` marks read and files; `file-unread` files without marking read. `read` and `flag` leave the message in the inbox. `park` touches nothing and only records the id.
- A destination that does not exist, or an ambiguous leaf name, **fails the whole plan before anything moves**. Fix the row and re-run.
- Add `--dry-run` when a destination is one this account has not filed to before; otherwise the Step 3 confirmation is the check.

Parked ids survive between runs and drop out once the message leaves the inbox.

## Step 5: Work the reply pile

Only the R bucket, following `references/drafting.md`: read the whole thread, draft in the profile's voice, run `/humanizer`, show it, open it with `reply.sh` once the user is happy. Show several drafts together where that suits the user.

**File the original as the draft opens**, with an `awaiting` row in a plan:

```
<message-id>	awaiting	Awards 26 Sponsors	replied re 28 Sept call
```

It files the message exactly as `file` does and records that the send is not yet seen, which the next run's `--settle` resolves. If the user would rather keep a replied-to thread in the inbox until they have sent, use `read` instead, and say so.

## Step 6: Close the run

Three lines, no more:

```
Filed 8, parked 3, 3 replies drafted and waiting in Mail for you to send.
Left in the inbox: the 3 you're replying to, plus the 3 parked.
Nothing matched a filing rule for the Eventbrite receipts. Where should those go?
```

Then add anything learned to the profile (a filing row, a triage correction, a colleague who owns a class of mail) and say what was added in a line.

## Searching beyond the inbox

Most mail is filed. To find what was agreed or what someone last said, read the profile's **Filing map** for the right folder, then search it:

```
mail_list_mailboxes(account_uuid: …, query: "Awards 26")
mail_search_messages(account_uuid: …, mailbox_id: 322, query: "advert")
mail_search_messages(account_uuid: …, mailbox_role: "sent", query: "Symposium Review")
```

## Hard rules

1. **Never send an email.** Only open drafts.
2. **Establish the account first**, and read its profile and voice file. No profile means offer to create one.
3. **One account at a time.** Every MCP search takes the profile's `account_uuid`; every script takes its account. No ad-hoc AppleScript that ignores the scoping.
4. **Never touch a parked message.** Old and quiet means kept on purpose.
5. **A reply is owed only if the last message is not the owner's**, and it is addressed to them, and it is theirs.
6. **Show drafts first**, in a code block, and ask before opening them.
7. **Replies preserve the thread**: Apple Mail, reply-all, paste after `Cmd+Up`. Never `set content of`, never `Cmd+A`.
8. **Follow the profile's voice file and signature setting.** No em dashes.

## Notes

- Apple Mail must be running (the scripts launch it), and Outlook for composes that use it. The first run may prompt for permission to control Mail or Outlook; the MCP may need Full Disk Access (`mail_permissions_check` diagnoses it).
- Per-account state (watermark, parked, awaiting) lives in `.claude/email-accounts/state/<slug>.tsv`. It is local and not committed. Deleting it loses the parked list, so the next sweep raises those messages again; nothing else breaks.
