# TODO.md format

`projects/nomos-consultancy/TODO.md` is a **lightweight list of reminders**: things Jack (or a later run) still has to do but cannot do yet, because a date has not arrived, a result is not in, a draft is waiting on his review, or something else stands in the way. It is not a record. Per-election status lives in `pipeline.csv` and `recent-elections.csv`, outreach history in `outreach-log.csv`, and standing context in `CLAUDE.md`.

Jack, 28 September 2026: "TODO.md needs to be lightweight of just reminders of things that I need to do but for whatever reason can't do now." The file had grown to narrative paragraphs, ticked items and research notes; that is what this format prevents.

## Structure

Three sections, in this order.

```markdown
# NOMOS consultancy — to do

*Reminders only: things still to do that can't be done yet, each with the date or blocker that holds it. Delete a line once it's done. Outreach history lives in `content/deep-dives/outreach-log.csv`.*

## Live now
## Content programme
## Introductions
```

- **Live now**: anything with a date in the next fortnight, in date order. Approaches to send, chases due, things promised to a named person. This section is what the ranking reads first, so an item only belongs here if it has a date.
- **Content programme**: the rest of the content side: seed pieces, feature editors, Experts Corner, Content HQ.
- **Introductions**: the outreach list work, including the pre-outreach data checks.

## Item conventions

```markdown
- [ ] **Isle of Man approach:** send by Fri 2 Oct 2026. Draft open in Outlook (ICPS account).
- [ ] **Berlin approach, w/c 12 Oct 2026**, once the final result is set. Check for a formal challenge to the seat calculation first.
```

- One line per item, two at most. Say what to do, and what holds it (the date or the blocker).
- **Delete an item once it is done.** No ticked items, no completion dates, no history.
- Partly done: rewrite the line as what is left.
- Research, drafting notes and figures go in the CSV row or the log's internal columns, not here. Point to them if needed.

## What does not go here

- Done items, in any form.
- Waiting on someone else with nothing for Jack to do. If silence needs a chase, the item is the chase, with its date ("Chase the IEC on Wed 30 Sep"). Open questions put to Charles or the NOMOS team belong in the "Standing facts and decisions" section of `projects/nomos-consultancy/CLAUDE.md`.
- Outreach history: who a commission was written to, when, the chases, their reply, whether they agreed. That is `content/deep-dives/outreach-log.csv`, shown on Content HQ's `/elections` page.
- Per-election status for rows not yet written to. That is the CSVs' `Status` column.
- Working rules and lessons (for example, check Sent Items before recording anything as unsent). Those go in this skill.
- Anything from the FOIA advisory or briefings strands beyond a one-line pointer. They are outside this runner's scope.
