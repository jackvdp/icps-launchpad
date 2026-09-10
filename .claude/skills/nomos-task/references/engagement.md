# The engagement — standing context

Read this at the start of every `/nomos-task` run. It changes rarely; the live status lives in `projects/nomos-consultancy/CLAUDE.md` and `TODO.md`.

## What this is

Jack's **personal, independent consultancy for NOMOS** (the Buzzmint side, Charles's company). Forty hours a month, invoiced monthly, as an independent consultant.

It is **not** the ICPS–NOMOS partnership, which lives in `projects/nomos` and is a different piece of work with different people and different files. Keep the two apart in every direction: no ICPS campaigns, audiences or back catalogue in the consultancy strategy, and no consultancy material in anything partnership-facing.

**Focus:** the verified credential for the electoral workforce (poll workers, temporary staff, permanent administrators). **Voter-facing identity (voter ID) is explicitly out of scope** and stays out of the content programme too.

## Confidentiality

This engagement is private to Jack. It stays out of all partnership-facing documents and correspondence.

- The agreed line, if it comes up, is that **Jack works directly with Buzzmint/Charles**. Nothing more.
- It is kept discreet from **Matt** in particular.
- Do not reference it in anything going to the wider ICPS or Network side.
- The 408-name outreach list is Jack's personal list. It never appears in partnership documents, and the Content HQ generator scripts exist specifically to strip mentions of it from anything published.

## Mail identity

NOMOS consultancy mail goes out from **`jack@vanderpump.tech`**, in **Apple Mail** (the account is configured there under that name). Not the ICPS Exchange account: an approach letter landing from an ICPS address crosses the line above.

Use this skill's `compose.sh`, which sets the sender for you. Signature:

```
Kind regards,

Jack Vanderpump
Editor, NOMOS content platform
jack@vanderpump.tech
```

`/email-inbox`'s `jack-icps` profile is for ICPS work: use it here only to *search* Exchange for correspondence history, never to send. Consultancy mail goes out on the `jack-tech` profile, which composes in Apple Mail from `jack@vanderpump.tech`.

## Writing

- British English. Professional, warm, concise. **Never use em dashes.**
- Dates as 17 September 2026.
- Run every outgoing draft through `/humanizer`.
- Write everything for publication. Assume anything sent to an official is disclosable under public records law: no commercial content, no product mentions, no assessment of electoral outcomes, no politics. This is the single discipline Charles cares most about.
- The approach letter must not grow. Its length is the reason people read it.

## People

| Person | Where | Notes |
|---|---|---|
| **Charles Symons** | Buzzmint / NOMOS | `charles@trustnomos.com`, also `charles@buzzmint.io`. Approved the content plan 4 September 2026. Jack holds final editorial sign-off. |
| **Sean Evins** | NOMOS | `sean@trustnomos.com`, also `scevins@gmail.com` |
| **NOMOS CTO** | NOMOS | Name not yet on file. Holds the answer the FOIA workstream is blocked on (who holds credential data, NOMOS or the issuing body). |
| **Matt** | ICPS side | The engagement is kept discreet from him. |

## Decisions already taken

Do not reopen these without Jack:

- Jack holds **final editorial sign-off**.
- Content publishes **under the NOMOS name**. No separate masthead for now.
- Contributor and editor **payment is undecided**. The honorarium question was put to Charles on 4 September 2026 and is still open. Do not promise a fee to anyone.
- The first feature editor quarter is **Q1 2027**. The Q4 2026 invite window had already passed.
- The editorial policy is **approved and sent** (4 September 2026). It can be shared with a commission that asks.
- The Content HQ app is **public**, decided 5 September 2026. Its copy rules are in `content-hq/CLAUDE.md` and are strict.

## The content programme in one paragraph

The platform publishes the operational record of how elections are actually run: the workforce, the logistics, the count, what proved hard and how it was handled. Neutral, research-based, no editorial line, no assessment of outcomes, no voter ID. Eight mechanisms ranked by yield in `content/content-strategy.md`, sequenced in three stages. **Stage 1 (seed) is where the work currently is**: in-house pieces and the first deep dives, both within our control. Stage 2 (feature editors, practice briefs, comparative pieces) does not open until stage 1 has produced something worth showing, because approaching the best contributors against an empty platform is hard to undo.

The lead mechanism is the **post-election deep dive**: approach a commission in the week after its count concludes, interview three to six weeks later. It self-schedules from the global election calendar and gives a genuine non-commercial reason to contact a commission cold. Planning assumption is one approach in four converting, so roughly 40 approaches over twelve months for ten published pieces.

## The introductions in one paragraph

Personal one-to-one introductions to electoral officials, content organisations and academics: the other half of what Jack is paid for. The spine is `contacts/2026-07-31-nomos-outreach-contacts.csv`, 408 people Jack has actually corresponded with, mined from about 52 filed Exchange mailboxes and web-enriched with a role, a priority and a per-person **NOMOS angle**. Eighty are priority 1. It is a warm list, not a prospecting list: every name already has a correspondence history, which is the whole point.

Two checks the companion `.md` flags and nobody has done yet: 18 people appear on more than one address, and 23 have an on-file address that may be dead. Check the individual before writing to them.

Introductions land better once there is something on the platform to point at, which is why they sit behind live content work in the ranking rather than ahead of it.

## Folder map

```
projects/nomos-consultancy/
├── CLAUDE.md            Engagement status — what is true right now
├── TODO.md              The to-do spine — what is outstanding
├── briefings/           Pitch-prep and advisory material (out of this skill's scope)
├── contacts/            The 408-name outreach list + Kansas City attendee work
├── content/
│   ├── content-strategy.md      Read first; the eight mechanisms and the three stages
│   ├── feature-editor-plan.md   Quarterly guest editor; Q1 2027 is the first
│   ├── editorial-policy.md      Approved, sent to Charles 4 Sep 2026
│   └── deep-dives/
│       ├── README.md            The working rules. Read every time.
│       ├── pipeline.csv         45 forward elections, Sep 2026 – Mar 2027
│       ├── recent-elections.csv 27 elections already held, Mar – Sep 2026
│       ├── approach-letter.md   Standard + lookback variants
│       └── interview-structure.md
└── content-hq/          Public Next.js app. Own CLAUDE.md. Read it before touching.
```

The folder is a Dropbox symlink to `Desktop/NOMOS-Consultancy`, deliberately outside the `ICPS/` tree. Local-only; a fresh clone will not have it. Recreate with:

```bash
ln -s "$HOME/Dropbox/My Mac (Mac-Pro)/Desktop/NOMOS-Consultancy" projects/nomos-consultancy
```
