# Drafting replies and new emails

Read this before drafting anything. The voice comes from the profile: read the file its `voice:` key names first.

## Every draft

1. **Read the whole thread** with `mail_read_thread`. A reply written off the latest message alone repeats what was settled three messages ago.
2. **Draft it** to the profile's voice and run it through `/humanizer`.
3. **Show it in a code block** and ask before opening it.
4. **Open it** with `reply.sh` or `compose.sh`. Never send.

Draft several in one pass where the user is happy to review them together: show all of them, then open them one after another.

### Style, whatever the account

- **No em dashes.** Use commas, full stops, semicolons or parentheses. This covers HTML bodies: no `&mdash;` either.
- **Signatures follow the profile's `signature:` key.** `client` means the mail client appends one, so the draft ends at the closing line ("Kind regards,") with no name, title or contact block. `none` means the draft signs off in full.
- Concise and focused. One clear ask per email.
- **Link to the event page** in any email that invites someone to, or mentions, a webinar, roundtable or awards event: the live `electoralnetwork.org/events/<id>` URL, hyperlinked on descriptive text such as "the event page", never a bare URL.

## Replies: `reply.sh`

Replies always go through **Apple Mail**, whatever the profile's compose client: Mail holds every account, and its reply-all keeps the thread and the existing recipients.

```bash
.claude/skills/email-inbox/reply.sh \
  --message-id "<GV4P189MB3607...@...OUTLOOK.COM>" \
  --body "Hi Tracy,

Thanks for confirming.

Kind regards,"
```

- **Match by `--message-id`**, which is exact. Without one, `--sender` matches the most recent message from that sender, so add `--subject` whenever the sender has more than one thread in play.
- **Pass `--mailbox`** when the message has already been filed; without it the script only looks in the Inbox.
- **`--cc`** is for addresses not already on the thread, and only when the address is certain from the conversation. Never invent one.
- **`--html`** when the body has links or formatting: wrap it in a `<div>` with `<p>` paragraphs and `<a href='...'>` links.

**A reply that needs a letter or document takes `--attach`**, once per file. Do not switch to `compose.sh` because there is an attachment: a compose breaks the thread, rebuilds the recipients from scratch, and leaves a "Re:" subject with nothing behind it.

```bash
.claude/skills/email-inbox/reply.sh \
  --mailbox "Awards 26 Sponsors" \
  --message-id "<CAFRMrpL...@mail.gmail.com>" \
  --attach projects/awards26/letters/2026-09-22-invitation-rajendra-daga.pdf \
  --body "Hi Raj, ..."
```

The files are pasted into the reply straight after the body. Mail's scripting cannot see pasted attachments, so the script cannot confirm them: **tell the user to check the attachment shows on the draft** before sending.

### How `reply.sh` works, and what not to undo

It opens a reply window on the resolved account, adds any CC recipients, moves the cursor to the top with `Cmd+Up`, pastes the body, then pastes any attachments as file URLs. It never sends.

- Do **not** set the reply's `content` property: it overwrites the quoted thread.
- Do **not** attach through the content (`tell content of replyMsg to make new attachment`). It is a write to the content by another route, and it has wiped a quoted thread. Attachments go in by paste.
- Do **not** use `Cmd+A`: it can select and replace the thread.
- The `delay 2` after opening the window lets it load before pasting.

## New emails: `compose.sh`

1. Confirm recipients. If an address is unknown, ask, or pass `placeholder@example.com` and say so.
2. Show the draft, ask, then open it.

```bash
.claude/skills/email-inbox/compose.sh \
  --to "someone@example.org" \
  --subject "Subject" \
  --html \
  --body "<p>Hi Name,</p><p>...</p><p>Kind regards,</p>"
```

The client comes from the profile's `compose_client`. Outlook renders HTML properly and is right for any account it holds. Apple Mail is the only option for accounts Outlook lacks; its drafts carry a plain-text body, so an `--html` body is flattened (links kept inline as URLs) and the formatted version is left on the clipboard. The script says when that happens.

### From a template

When the request matches a template in `templates/` (index in `templates/README.md`), start from it: read the template, fill every bracketed field from the user, the event's data file or the relevant `projects/<project>/` folder, show the filled body, then run its `compose.sh --html` command. The wording is a starting point: adjust it to the recipient, and vary the skeleton when drafting several from one template in a sitting. A profile can point at its own templates folder with a `templates:` key.

## HTML in Outlook composes

**Always use `--html`** for anything with structure (lists, links, bold, headings). Outlook's `content` is HTML, so plain-text bullets render as one run-on paragraph. Plain-text mode is fine for simple prose: newlines become `<br>`, but it never produces bullets or bold.

The script wraps `--body` in `<body style='font-family: Calibri, Arial, sans-serif; font-size: 15px;'>`, with `p { margin: 0 0 14px 0 }`, `p:last-child { margin-bottom: 0 }` and margins on lists. Supply only the inner HTML.

- `<p>` for paragraphs. The wrapper handles spacing, so write consecutive `<p>` siblings. No `<p>&nbsp;</p>` spacers or inline margins: they double the spacing. If a draft ever looks cramped, check the wrapper's `p` rule first.
- `<b>`/`<strong>`, `<i>`/`<em>`, `<ol><li>`, `<ul><li>` (no `<p>` inside `<li>`), `<a href='...'>`, `<br>`.
- Entities: `&amp;`, `&lt;`, `&gt;`, `&nbsp;`. Never `&mdash;`.
- **Single quotes inside HTML attributes.** The body reaches AppleScript inside double quotes.

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
