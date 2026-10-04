---
name: nomos-task
description: Pick the most timely NOMOS consultancy task and do it — end to end, with any emails drafted for review. Covers the two workstreams Jack runs: the content programme (deep-dive pipeline, approach letters and chases, interviews, feature editors, editorial policy, Content HQ) and the one-to-one introductions from the private outreach list. Works from projects/nomos-consultancy/TODO.md as the to-do spine, with the two deep-dive CSVs carrying per-election status. Use whenever Jack asks "what's next for NOMOS", "do a NOMOS task", "work the consultancy list", "which commissions are due an approach", "who should I be introducing to NOMOS", or names a specific consultancy task to action (e.g. "send the Sweden approach"). Also use for chasing silent commissions and overdue replies from Charles.
argument-hint: [optional: a specific task, e.g. "sweden approach letter" or "work the lookback list"]
---

# NOMOS consultancy task runner

One invocation = one task moved to done (or as far as it can go without Jack). Gather the live picture, pick the most timely item, confirm it with Jack, execute it, write the result back.

**This is Jack's private consultancy, not the ICPS–NOMOS partnership.** Read `references/engagement.md` before doing anything. The confidentiality rule there is not optional and it decides which account mail goes out from.

**Hard rule: never send an email.** Draft and open for review only, chases included. Anything else that leaves the machine (a Content HQ deploy, anything to Charles) needs Jack's explicit go-ahead first.

**Scope.** Two workstreams: the **content programme** and the **one-to-one introductions**. The FOIA/public-records advisory and the briefings/pitch-support strand are real parts of the engagement but out of scope for this runner. If something urgent surfaces there, say so in the report and leave it.

## Step 1 — Gather

1. **`projects/nomos-consultancy/TODO.md`** — the to-do spine, and the first thing to read. What is due, what was promised, what is blocked and on whom. If the file does not exist, build it from the outreach log, the two CSVs and the Standing facts section of `projects/nomos-consultancy/CLAUDE.md` before going further, following `references/todo-format.md`.

2. **`projects/nomos-consultancy/CLAUDE.md`** — how to work here, and its "Standing facts and decisions" section: what is agreed, what Charles has signed off, what is waiting on him. TODO.md says what is outstanding; this says what is true. Where the two disagree, find out which is stale (check the mail, check the file that records the outcome) and fix the wrong one. Both being true is part of the job.

3. **The outreach log and the two deep-dive CSVs** in `projects/nomos-consultancy/content/deep-dives/`:
   - `outreach-log.csv` — **the source of truth for post-election outreach**, one row per commission conversation: who it went to, the date of the approach and each chase, whether and when they replied, what they said, the outcome (`Not sent`, `Awaiting reply`, `Agreed`, `Declined`, `Closed, no reply`, then `Interviewed` → `Piece drafted` → `Approved` → `Published`), and the next step with its date. Content HQ shows it on the single `/elections` page (past and future elections with outreach status on each row). Check it against Sent Items and the inbox before ranking: twice now a record has said "unsent" about mail that had gone.
   - `pipeline.csv` — 45 forward elections, September 2026 to March 2027. The `Approach window` column is a calendar: anything due this week or next is live work. `Status` carries a row's state until the first letter is drafted (Not approached, Lapsed, Watch, or a dated hold note); from then on the row points at the log and the log carries it.
   - `recent-elections.csv` — 27 elections already held, March to September 2026. Not a weekly rhythm: the whole list is approachable now, worked in one pass, priority 1 first.
   - Read `deep-dives/README.md` every time. It carries the working rules the CSVs cannot: one approach then two chases at two-week intervals and no more; warm route before cold email; six countries on both lists that must be approached **once**; `Watch` rows whose feasibility note has to be re-read before anything is sent; commission heads who change between research and approach.

4. **`projects/nomos-consultancy/contacts/`** — the introductions side. `2026-07-31-nomos-outreach-contacts.csv` holds 408 warm contacts (80 priority 1) with a `NOMOS angle` per person. The companion `.md` carries two pre-outreach checks that still have not been done: 18 people on multiple addresses, 23 whose on-file address may be dead. Do the relevant check before writing to anyone.

5. **The mail**, when a task turns on what someone last said. `/email-inbox` handles both sides: its `jack-icps` profile for the ICPS-side history on Exchange, its `jack-tech` profile for consultancy correspondence on `jack@vanderpump.tech`. Keep them apart. Commission-facing mail goes from `jack-icps` in Outlook with NOMOS played down; mail to the NOMOS side goes from `jack-tech`. The rule and the framing are in `references/engagement.md`.

Check today's date against the live approach windows before ranking. A window that passed unworked is a lost election, not a late task.

## Step 2 — Rank

Score the merged picture in this order, and be ready to defend the pick in one sentence:

1. **Approach windows closing.** A forward-pipeline row whose window falls this week or next outranks nearly everything: the letter's whole claim to attention is that it arrives in the week after the count. A window a fortnight past is not recoverable by sending late. Either move the row to the lookback framing or mark it Lapsed, and say which.
2. **Broken promises.** Anything promised to a named person by a date now passed. Charles included.
3. **Blockers.** Work that gates a chain. The seed pieces are the clearest one: the strategy's own sequencing says do not open stage 2 (feature editors, practice briefs) until stage 1 has produced something worth showing, so an empty platform blocks the editor invitations queued behind it.
4. **Due chases.** An approached commission silent for two weeks earns one chase; silent two weeks after that, one final chase; then leave it. Count the emails already sent before drafting a third.
5. **The lookback pass.** Not urgent by date, but it decays: the one-month rows (Zambia, Kazakhstan, Osun) are the strongest on that list and weaken every week. Working a batch of priority 1 counts as a task.
6. **Introductions.** Warm intros from the outreach list, sequenced behind whatever content work is live, since an intro lands better once there is something on the platform to point at.

If Jack named a task in the invocation, skip the ranking and confirm that one, but mention anything ranked above it that looks more urgent.

## Step 3 — Confirm

Present the recommended task, a one-line plan, and one or two runners-up via AskUserQuestion. Wait for the pick. Do not execute before this: Jack may know a call already happened or a reply landed this morning.

## Step 4 — Execute

Route through what already exists rather than reinventing it:

| Task shape | Route |
|---|---|
| Approach letter or chase to a commission | `content/deep-dives/approach-letter.md`, drafted via `/email-inbox`'s `compose.sh --account jack-icps` (Outlook, ICPS signature auto-appended). **Every approach (not chases) goes with a formal letter** on ICPS headed paper, built with `/edit-doc` from `content/deep-dives/letters/_template-approach-letter.docx` and attached as a PDF with `--attach`; steps under "The formal letter" in `approach-letter.md` |
| Interview prep or write-up | `content/deep-dives/interview-structure.md` |
| Warm introduction to a contact | The `NOMOS angle` column on the outreach CSV; same compose script |
| Reply in an existing thread | `/email-inbox` on whichever profile holds the thread (commission threads are on `jack-icps`, NOMOS-side threads on `jack-tech`), draft only |
| Checking what someone last said | `/email-inbox` search, on whichever profile holds the thread |
| Speaker or expert research | `/find-speakers` |
| Content HQ app change | `content-hq/CLAUDE.md` first — the app is **public** and its copy rules are strict |
| Making a draft read human | `/humanizer` |

Three checks before any letter goes out, all of them easy to skip and expensive to miss:

- **Verify the count actually concluded**, and refresh the one specific line from that election's own coverage. That line is the only thing separating the letter from a circular.
- **Check the commission head's name is current.** Several on both lists changed between research and now. Writing to someone who has left is worse than writing late.
- **Take the warm route first** wherever the `Warm route` column names one. Ask for an introduction rather than emailing the commission cold.

Everything is written for publication: assume anything sent to an official is disclosable under public records law. No commercial content, no NOMOS product mentions, no assessment of electoral outcomes. Style and signature are in `references/engagement.md`.

If the task turns out blocked mid-way, stop, say exactly what is missing, and rewrite its TODO line as what is left rather than leaving it half-done.

## Step 5 — Write back

Only after the work is genuinely done, or handed to Jack as an open draft. **Never mark something done whose real-world action is still sitting unsent in a draft window.** That is the one write that quietly corrupts the list.

1. **The outreach log** — anything written to, or heard from, a commission goes in `outreach-log.csv`. A new letter adds a row (a drafted-but-unsent one with `Outcome` `Not sent` and only the `Drafted` date filled in); a send, a chase, a reply or an agreement updates the row's dates, `Response`, `Outcome` and `Next step`. Dates always as `22 Sep 2026`. The public columns must stay public-safe (roles, not names; no addresses, no quotes); names, addresses and working detail go in the two internal columns, which are never published. Point the election row's `Status` in the CSV at the log the first time a row gets a log entry.
2. **The CSV row** — for rows without a log entry only: holds, lapses, `Watch`, re-dated windows, verified heads.
3. **`TODO.md`** — delete the item once it is done (no ticks, no completion notes); if it is partly done, rewrite the line as what is left. Add anything new that can't be done yet, one line with its date or blocker. It is a list of reminders, not a record: history belongs in the log, detail in the CSV row. Format in `references/todo-format.md`.
4. **Not `CLAUDE.md`.** Outreach progress, including a commission agreeing, is recorded in the log and seen on Content HQ. `CLAUDE.md`'s "Standing facts and decisions" section is for the engagement itself (Charles's decisions, scope, a workstream opening or closing), and Jack has said outreach does not belong there (28 September 2026).
5. **Content HQ** — after changing the log or either CSV, regenerate all three (`python3 scripts/generate-outreach.py`, `generate-pipeline.py`, `generate-recent.py`, run from `content-hq/`). Each refuses to write if a forbidden phrase survives or a log `Covers` key matches no row. Deploying is Jack's call, not yours.
6. **Report** — what was done, where any draft is waiting (which app, which window), what came off the TODO list, and what the next-ranked task is, so the following invocation has a head start.
