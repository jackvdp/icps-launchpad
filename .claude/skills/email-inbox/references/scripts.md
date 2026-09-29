# Scripts, one-off filing and the slow walk

All scripts are in `.claude/skills/email-inbox/` and share `lib.sh`, which resolves the account and reads the profile. Each has its full usage in a header comment. Every script takes `--account` (a profile slug, an Apple Mail account name or an address); without it they use the default profile.

| Script | Purpose |
|---|---|
| `sweep.sh` | The batch script. `--plan FILE` files, marks and parks a whole run in one pass; `--settle` checks awaiting rows against Sent Items; `--state` shows the watermark, parked and awaiting; `--park`/`--unpark` by id; `--dry-run` |
| `accounts.sh` | List Apple Mail accounts (name, UUID, addresses) and configured profiles |
| `fetch.sh` | Read a mailbox live: `--max`, `--search`, `--offset`, `--unread`, `--ids`, `--mailbox` |
| `mailboxes.sh` | `--list [--filter]` to see folders; `--mailbox "Name" [--search] [--preview\|--full] [--ids]` to browse one |
| `reply.sh` | Reply-all draft in Apple Mail: `--message-id` or `--sender`/`--subject`, `--body`, `--cc`, `--attach`, `--html`, `--mailbox` |
| `compose.sh` | New draft: `--to`, `--subject`, `--body`, `--cc`, `--bcc`, `--html`, `--attach`, `--client` |
| `mark.sh` | `--read`/`--unread`/`--flag`/`--unflag`, matched by `--message-id` or `--sender`/`--subject`, plus `--all`, `--dry-run` |
| `move.sh` | `--to "Folder"`, matched by `--message-id` or `--sender`/`--subject`, plus `--from-mailbox`, `--all`, `--dry-run` |

## Reading without the MCP

When the MCP is unavailable or its index is behind Mail:

```bash
.claude/skills/email-inbox/fetch.sh --max 40 --ids
.claude/skills/email-inbox/fetch.sh --account jack-tech --unread --ids
.claude/skills/email-inbox/mailboxes.sh --list --filter "Awards"
.claude/skills/email-inbox/mailboxes.sh --mailbox "Awards 26 Sponsors" --search "advert" --ids
```

`--ids` gives each result's Message-ID, which every action wants. Collect ids as you go: going back for them costs another pass over the mailbox. Never browse a sent or deleted folder without a search term; they run to tens of thousands of messages.

## One-off filing, marking and flagging

`sweep.sh` is for a run. For a single correction, or a thread handled outside a sweep:

```bash
.claude/skills/email-inbox/mark.sh --read --message-id "<id>"
.claude/skills/email-inbox/mark.sh --flag --sender "raj@adaga.in" --subject "Booking"
.claude/skills/email-inbox/mark.sh --read --subject "Manila workshop" --all
.claude/skills/email-inbox/move.sh --to "Awards 26 Sponsors" --message-id "<id>" --dry-run
.claude/skills/email-inbox/move.sh --to "Awards 26 Sponsors" --message-id "<id>"
```

Rules for filing, whichever script does it:

- **Use a folder the profile's Filing map names.** If nothing fits, ask where it should go, then add the answer to the map.
- **`--dry-run` first** whenever the match is by sender or subject rather than by message id.
- **`--all` moves every match**; without it only the most recent moves. Use it for a whole thread, never as a default.
- Destinations match on the leaf name. If a name exists in two places the script asks for the full path (`Electoral/Awards 26 Sponsors`).
- Folder names match exactly, typos and all. Several older mailboxes are misspelled in Mail itself; match what is there.
- Moving has no undo beyond moving it back. Within a run the plan table is the confirmation; outside one, ask.

Park or unpark by hand:

```bash
.claude/skills/email-inbox/sweep.sh --park "<id>" --note "chase after the board meets"
.claude/skills/email-inbox/sweep.sh --unpark "<id>"
```

## The slow walk, when it is asked for

`/email-inbox walk`, or any request to go through the inbox one at a time, means the conversation-by-conversation tour:

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

Then ask: **Reply** (draft a response), **Skip**, **Read all** (show every message), **File it**, **Park it**, or tell me what to say. Keep a running count. If the user says "skip all" or "just show me the list", go back to the sweep table.
