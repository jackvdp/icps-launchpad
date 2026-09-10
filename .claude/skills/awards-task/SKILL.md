---
name: awards-task
description: Pick the most timely Awards 26 (Manila) to-do item and do it — end to end, with any emails drafted for review. Works from the Philippines event dashboard (Neon Postgres) as the source of truth, with the awards26 TODO list and its satellites supplying the detail; ranks tasks by urgency and proximity to the event, confirms the pick with Jack, executes it, and ticks it off both lists. Use whenever Jack asks "what's next for the awards", "do an awards task", "work through the awards to-do list", "what should I be chasing", or names a specific awards task to action (e.g. "do the Rayudu welcome email"). Also use for chasing overdue replies from COMELEC, Tracy, sponsors or speakers.
argument-hint: [optional: a specific task to do, e.g. "rayudu welcome email"]
---

# Awards task runner

One invocation = one task moved to done (or as far as it can go without Jack). The job: gather the live to-do picture, pick the most timely item, confirm it with Jack, execute it, and write the result back so both lists stay true.

**Hard rule: never send an email.** Draft and open for review only. Everything else that leaves the machine (website deploys, LinkedIn posts) also needs Jack's explicit go-ahead first. On the dashboard you may tick rows off and add new ones as part of Step 5; changing or removing an existing row needs Jack's OK.

## Step 1 — Gather

Start with the dashboard. Everything else fills it in.

1. **The Philippines event dashboard — the source of truth.** Neon Postgres, queried via the neon MCP (load `mcp__neon__run_sql` with ToolSearch):
   - project `orange-lake-25542301`, database `verceldb`, table `philippines."Task"` (columns: `id`, `task`, `details`, `section`, `completed`, `order`)
   - Fallback if the MCP is unavailable: `source projects/dashboard/.env.local` and `psql "$POSTGRES_URL"`.
   - This is the definitive answer to **what the work is and whether it is done**. Its sections 1–9 run the full lifecycle from nominations to post-event, so it is also the only list that shows whole phases nobody has started. Read every row, not just the incomplete ones.
   - Where it and TODO.md disagree about whether something is done, find out which is stale rather than assuming: check the mail, the repo, or the file that actually records the outcome. Then fix the wrong one. Both lists being true is part of the job.
   - Known defect: some rows are still untouched country-template text (one says "Contact Embassies & Consulates in Santo Domingo", which should be Manila). Template wording does not make a row inapplicable, so read it as the phase it stands for. Correcting row text needs Jack's OK (see Step 5).

2. `projects/awards26/CLAUDE.md` — event dates, venue status, packages, key people. The dashboard says *what* is outstanding; this says *what is true about the event*. Do not trust dates memorised from elsewhere, a wrong-dates template has already circulated once.

3. `projects/awards26/TODO.md` — the detail the dashboard rows do not carry: who was emailed when, what was promised, what is blocked on whom, and the running commentary on each thread. Treat it as the dashboard's notes field rather than a competing list. Anything here with no dashboard row is a candidate for one.

4. The satellites TODO.md points to: `nominations-website-status.md` (nominations/Postmark), `bsva-workshop-sow.md` (workshop organisation). Skim both every time — a satellite can hide something that outranks everything on either list (the Postmark file once concealed a production email outage), and you cannot know that without looking.

Also check today's date against the event: **29 November – 3 December 2026, Manila**. Weeks-to-event drives the ranking below.

## Step 2 — Rank

Walk the dashboard's nine sections in order and ask what each one needs at this many weeks out. That is the frame. TODO.md and the satellites then tell you which of those are already moving, already promised, or already blocked, and add anything that has no row yet.

Score the merged list with this priority order, and be ready to defend the pick in one sentence each:

1. **Broken promises first.** Anything promised to a named person by a date now passed (e.g. "promised for the evening of 14 Aug"). These cost trust daily.
2. **Blockers.** Tasks that hold up a chain of others (venue confirmation gates the website, FAQ, and sponsor materials sweep). Unblocking one of these is worth more than three leaf tasks.
3. **Nearly-done items.** Drafts already sitting open in Outlook or Apple Mail that just need a final check and send — cheap wins that clear the board. But verify the draft is still current first: a draft written weeks ago may be overtaken by later correspondence (check the thread before counting it as a win), and an outdated send is worse than a late one.
4. **Lifecycle proximity.** As the event nears, dashboard sections shift from "someday" to "now": nominations and judging need months of runway; printing, badges and seating plans matter in the final six weeks. A whole section sitting untouched past its realistic start date outranks any single leaf task, and the dashboard is the only place that shows this, so say so even when nothing in TODO.md names it.
5. **Chases.** "Waiting on others" items are not actionable — unless the silence has stretched past about a week, at which point a polite chase email becomes the task.

If Jack named a task in the invocation, skip the ranking and go straight to confirming that one (but mention anything ranked above it that looks more urgent).

## Step 3 — Confirm

Present the recommended task, a one-line plan for it, and one or two runners-up via AskUserQuestion. Wait for the pick. Do not start executing before this — Jack may know context that reorders everything (a call that already happened, a reply that landed this morning).

## Step 4 — Execute

Do the task properly, routing through the existing skills rather than reinventing them:

| Task shape | Route |
|---|---|
| New outgoing email (welcome, chase, invitation) | `/email-inbox` on the `jack-icps` profile: composes in **Outlook**, draft only |
| Reply in an existing thread | `/email-inbox`: replies go through **Apple Mail**, draft only |
| Checking what someone last said | `/email-inbox` search, which reads Exchange through the apple-mail-readonly MCP |
| Filing a settled thread out of the inbox | `/email-inbox` `move.sh`, against the filing map in `.claude/email-accounts/jack-icps.md` |
| Website content or code change | `/website-dev`; events via `/edit-event` / `/add-event` |
| Speaker research | `/find-speakers` |
| Bulk contact list or mail merge | `/find-bulk-contacts`, `/send-bulk-emails` |
| Anything awards-lifecycle (categories, judging, citations) | `/awards-admin` |

Email style: British English, warm and concise, no em dashes, run drafts through `/humanizer`. Check `projects/awards26/CLAUDE.md` and the sponsor overview for the correct names, packages and history before writing — a chase email that misstates what was agreed is worse than no email.

If the task turns out to be blocked mid-way (missing attachment, unanswered question only Jack can resolve), stop, report exactly what is missing, and leave the task un-ticked with a progress note instead.

## Step 5 — Write back

Only after the work is genuinely done (or handed to Jack as an open draft):

The dashboard is updated first, because it is what the next invocation trusts.

1. **Dashboard** — find the matching row in `philippines."Task"` and set `completed = true` (`UPDATE ... SET completed = true WHERE id = '...'`, always on the specific id, never a bare `WHERE section = ...`). Never mark a task complete whose real-world action is still sitting unsent in a draft window; that is the one write that quietly corrupts the source of truth.
   - If the work has **no row at all**, insert one in the section it belongs to, with `details` carrying enough to be actionable on its own. New rows are a normal part of keeping this list true, so do not leave the work homeless just because the template did not anticipate it.
   - **Editing or deleting existing rows needs Jack's explicit OK**, including fixing the leftover template wording. Ask, then do it in the same session rather than logging it for later.

2. **TODO.md** — tick the item (`- [x]`) with a completion date, or annotate partial progress in place. Add any new tasks that surfaced, dated, per the file's own convention. Keep it as the narrative record: who was contacted, what was promised, what is blocked and on whom, the things a one-line dashboard row cannot hold. Where the two lists disagreed in Step 1, correct whichever was stale.

3. **Report** — close with: what was done, where any drafts are waiting (which app, which window), what was ticked or added on the dashboard and in TODO.md, and what the next-ranked task is, so the following invocation has a head start.
