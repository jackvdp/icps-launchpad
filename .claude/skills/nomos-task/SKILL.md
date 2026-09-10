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

1. **`projects/nomos-consultancy/TODO.md`** — the to-do spine, and the first thing to read. Who was written to and when, what was promised, what is blocked and on whom. If the file does not exist, build it from the Status section of `projects/nomos-consultancy/CLAUDE.md` and the two CSVs before going further, following `references/todo-format.md`.

2. **`projects/nomos-consultancy/CLAUDE.md`** — the engagement's Status section: what is agreed, what Charles has signed off, what is waiting on him. TODO.md says what is outstanding; this says what is true. Where the two disagree, find out which is stale (check the mail, check the file that records the outcome) and fix the wrong one. Both being true is part of the job.

3. **The two deep-dive CSVs** in `projects/nomos-consultancy/content/deep-dives/`:
   - `pipeline.csv` — 45 forward elections, September 2026 to March 2027. The `Approach window` column is a calendar: anything due this week or next is live work. `Status` runs Not approached → Approached → Chasing → Agreed → Interviewed → Drafted → Approved → Published (or Declined / Lapsed / Watch).
   - `recent-elections.csv` — 27 elections already held, March to September 2026. Not a weekly rhythm: the whole list is approachable now, worked in one pass, priority 1 first.
   - Read `deep-dives/README.md` every time. It carries the working rules the CSVs cannot: one approach then two chases at two-week intervals and no more; warm route before cold email; six countries on both lists that must be approached **once**; `Watch` rows whose feasibility note has to be re-read before anything is sent; commission heads who change between research and approach.

4. **`projects/nomos-consultancy/contacts/`** — the introductions side. `2026-07-31-nomos-outreach-contacts.csv` holds 408 warm contacts (80 priority 1) with a `NOMOS angle` per person. The companion `.md` carries two pre-outreach checks that still have not been done: 18 people on multiple addresses, 23 whose on-file address may be dead. Do the relevant check before writing to anyone.

5. **The mail**, when a task turns on what someone last said. `/email-inbox` searches Exchange for the ICPS-side history; consultancy correspondence lives in Apple Mail on the `jack@vanderpump.tech` account.

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
| Approach letter or chase to a commission | `content/deep-dives/approach-letter.md`, drafted via this skill's `compose.sh` (Apple Mail, `jack@vanderpump.tech`) |
| Interview prep or write-up | `content/deep-dives/interview-structure.md` |
| Warm introduction to a contact | The `NOMOS angle` column on the outreach CSV; same compose script |
| Reply in an existing consultancy thread | Apple Mail on `jack@vanderpump.tech`, draft only |
| Checking what someone last said | `/email-inbox` search across Exchange mailboxes |
| Speaker or expert research | `/find-speakers` |
| Content HQ app change | `content-hq/CLAUDE.md` first — the app is **public** and its copy rules are strict |
| Making a draft read human | `/humanizer` |

Three checks before any letter goes out, all of them easy to skip and expensive to miss:

- **Verify the count actually concluded**, and refresh the one specific line from that election's own coverage. That line is the only thing separating the letter from a circular.
- **Check the commission head's name is current.** Several on both lists changed between research and now. Writing to someone who has left is worse than writing late.
- **Take the warm route first** wherever the `Warm route` column names one. Ask for an introduction rather than emailing the commission cold.

Everything is written for publication: assume anything sent to an official is disclosable under public records law. No commercial content, no NOMOS product mentions, no assessment of electoral outcomes. Style and signature are in `references/engagement.md`.

If the task turns out blocked mid-way, stop, say exactly what is missing, and leave it un-ticked with a progress note rather than half-done.

## Step 5 — Write back

Only after the work is genuinely done, or handed to Jack as an open draft. **Never mark something done whose real-world action is still sitting unsent in a draft window.** That is the one write that quietly corrupts the list.

1. **The CSV row** — set `Status` on the specific election row and date the action in its notes. A drafted-but-unsent approach stays `Not approached` with a note, not `Approached`.
2. **`TODO.md`** — tick the item with a completion date, or annotate partial progress in place. Add anything new that surfaced, dated. Keep it as the narrative record: who was contacted, what was promised, what is blocked and on whom.
3. **`CLAUDE.md`'s Status section** — only when something changed that the engagement's standing picture should carry (a commission agreed, Charles answered the honorarium question, a workstream unblocked). Not for routine ticks.
4. **Content HQ** — if either CSV changed, regenerate the app data (`python3 scripts/generate-pipeline.py` / `generate-recent.py`, run from `content-hq/`) so the public view does not drift. Deploying is Jack's call, not yours.
5. **Report** — what was done, where any draft is waiting (which app, which window), what was ticked, and what the next-ranked task is, so the following invocation has a head start.
