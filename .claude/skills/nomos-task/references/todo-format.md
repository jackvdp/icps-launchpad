# TODO.md format

`projects/nomos-consultancy/TODO.md` is the to-do spine for the consultancy. It is the narrative record, not a second copy of the CSVs: per-election status lives in `pipeline.csv` and `recent-elections.csv`, and TODO.md carries the things a CSV row cannot hold.

## Structure

Four sections, in this order. Do not add more without reason: the value of the file is that it stays short enough to read in one pass.

```markdown
# NOMOS consultancy — to do

*Last worked: 10 September 2026. Per-election status lives in the two deep-dive CSVs; this file carries the rest.*

## Live now
## Content programme
## Introductions
## Waiting on someone else
```

- **Live now** — anything with a date attached that falls in the next fortnight. Approach windows opening, chases due, things promised to a named person. This section is what the ranking reads first, so an item only belongs here if it has a date.
- **Content programme** — everything else on the content side: seed pieces, feature editors, editorial policy follow-ups, Content HQ.
- **Introductions** — the outreach list work, including the two pre-outreach data checks.
- **Waiting on someone else** — not actionable, but tracked so a chase can surface when the silence stretches. Every item names **who** and **since when**.

## Item conventions

```markdown
- [ ] Sweden approach letter — window w/c 21 Sep. Warm route: two Valmyndigheten contacts on the outreach list, ask for an intro first.
- [x] Editorial policy sent to Charles (4 Sep 2026)
- [ ] Q1 2027 editor shortlist — invitations out by late October
```

- Date every completion in brackets: `(4 Sep 2026)`.
- A blocked item says what it is blocked on and on whom, in the item itself: `blocked on the CTO (asked 24 Aug)`.
- Partial progress gets annotated in place rather than ticked: `— draft in Apple Mail, unsent`.
- New tasks that surface during a run get added, dated, in the section they belong to.

## What does not go here

- Per-election status. That is the CSVs' `Status` column, and duplicating it guarantees the two disagree.
- Standing context (people, decisions, the engagement basis). That is `references/engagement.md` in this skill and the Status section of `projects/nomos-consultancy/CLAUDE.md`.
- Anything from the FOIA advisory or briefings strands beyond a one-line pointer. They are outside this runner's scope.
