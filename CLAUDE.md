# ICPS Launchpad — Workspace

This repo is the working directory for **Jack Vanderpump** (Head of Policy Research, ICPS). It serves two purposes:

1. The **electoralnetwork.org** website (Next.js, in `web/`)
2. All **Electoral Members' Network / ICPS admin work** — emails, comms, events, articles, awards programme, speaker research. Drafts, skills, and notes live at the repo root alongside `web/`.

## Repo layout

```
.
├── web/                Next.js app (electoralnetwork.org) — package.json, src/, pages/, etc.
├── .claude/skills/     Skills (admin + website)
├── .claude/email-accounts/  Mail account profiles used by /email-inbox
├── projects/           Cross-cutting work, one subfolder per project (each has its own CLAUDE.md)
├── scripts/            Admin AppleScripts
└── CLAUDE.md           This file
```

Vercel deploys from `web/`. The project's **Root Directory** is set to `web` in the Vercel dashboard (Settings → General → Root Directory). Default Next.js commands then work unchanged. Do not add a root-level `vercel.json` — it conflicts with framework detection.


---

## Projects

Cross-cutting work lives in `projects/`, one subfolder per project. **Each project folder keeps its own `CLAUDE.md`** (with an `AGENTS.md` symlink to it). Read it first when picking up a project.

| Project | What it is | CLAUDE.md |
|---------|-----------|------------|
| **nomos** | ICPS / NOMOS partnership: awareness campaigns, audience build, the 22nd Awards presence | `projects/nomos/CLAUDE.md` |
| **nomos-consultancy** | Jack's private, independent consultancy for NOMOS/Buzzmint. Separate from the ICPS partnership; keep confidential and out of partnership documents | `projects/nomos-consultancy/CLAUDE.md` |
| **awards26** | 22nd International Electoral Awards (Manila, 2026): sponsors, delegates, letters, logistics | `projects/awards26/CLAUDE.md` |
| **smartmatic** | ICPS–Smartmatic 2026 webinar series | `projects/smartmatic/CLAUDE.md` |
| **training** | ICPS training-course marketing: audience lists for course outreach | `projects/training/CLAUDE.md` |
| **dashboard** | The Philippines event dashboard app (Neon Postgres), a separate repo symlinked in | none; see memory for the Neon project |
| **judging** | The Awards judging app (Next.js, shadcn, MongoDB): private packs for the Awarding Committee, scoring, results. A separate repo symlinked in, deployed at electoral-judging.vercel.app | none; see its `README.md` |
| **bsva** | BSVA survey analysis and rebuild (separate git repo, left as is) | `projects/bsva/claude.md` |
| **horizon** | EU Horizon Europe grant bid (INDEPACT): call, pitch, work packages | none |

Note: `projects/` is gitignored (local working area), so its contents are not committed. Drafted emails and speaker/contact CSVs now live inside the relevant project folder (not a top-level `emails/` directory).

### How CLAUDE.md and TODO.md work (Jack, 28 September 2026)

- **CLAUDE.md says how to work here, not what happened.** Sections, in order: what the project is (two or three lines, plus any confidentiality rule); how to work here (skills, processes, commands); where things live (folder index, and where status is kept); rules and pitfalls; people; standing facts (dates, venue, decisions in force). Under 500 lines, ideally under 150. Test each line: would an agent get something wrong without it? If not, cut it.
- **No status logs.** No "Status (as of …)" sections, correspondence logs, open-actions lists or meeting history. Moving status lives in its system of record (the mail, the awards Neon dashboard, the consultancy outreach log and CSVs) and CLAUDE.md points at it. When a standing fact changes, edit it in place.
- **Repeatable processes live in skills.** CLAUDE.md names the skill rather than restating its steps.
- **TODO.md holds only what can't be done yet**, one line each with what holds it: a date, a blocker, or Jack's review. If it can be done now, do it instead. Delete a line once done, with no ticks and no history. A line with no date or blocker gets done or dropped.
- **History lives in git.** Project folders in Dropbox have none, so keep at most a short list of decisions there, one dated line each, and only where knowing why stops a mistake being repeated.

---

## Routing — which skill to use

| Task | Skill |
|------|-------|
| Awards programme: nominations, judging, ceremony, winners, post-event close-out, categories, venue/co-host details | `/awards-admin` |
| Pick and execute the most timely Awards 26 to-do item (TODO.md + Philippines dashboard) | `/awards-task` |
| Pick and execute the most timely NOMOS consultancy task: deep-dive pipeline, approach letters, content programme, one-to-one introductions | `/nomos-task` |
| General ICPS / Network admin: emails, invitations, briefs, press releases, training proposals, webinars, roundtables | `/electoral-network-admin` |
| Website development (Next.js, MongoDB, components, project structure) | `/website-dev` |
| Email for the 2026 delegate-acquisition comms plan | `/comms-email` |
| Add an event/webinar to the site | `/add-event` |
| Edit an event/webinar on the site | `/edit-event` |
| Write and publish an article | `/add-article` |
| LinkedIn post on the Network organisation page | `/linkedin-post` |
| Social/promo graphics: LinkedIn carousels, post images, event visuals (design canvas + PDF/PNG render) | `/social-graphics` |
| Triage an inbox, search and follow threads, draft replies, file and mark mail | `/email-inbox` |
| Edit a Pages/Word document, build a letter from a template, export a PDF | `/edit-doc` |
| Research and shortlist external speakers (CSV + emails) | `/find-speakers` |
| Build a large audience/delegate contact list (100-500) for a mail merge | `/find-bulk-contacts` |
| Mail-merge a template through Outlook to a CSV list | `/send-bulk-emails` |
| Make AI-sounding text read more human | `/humanizer` |
| Start/stop a Claude session on this Mac that's reachable from the phone (Remote Control) | `/remote-session` |

Skills load their own context when invoked — don't pre-load awards or website detail into the conversation by reading files speculatively. Use the skill.

---

## Always-on conventions

### Writing & style (everywhere)
- British English
- Professional, warm, concise tone
- Dates: 17 September 2026 (Day–Month–Year)
- Define acronyms on first use; plain language; alt text on images
- Never use em dashes
- Run any communication or article through `/humanizer`

### File & path quirks
- Legacy docs: `ICPS/` (a symlink to the Dropbox ICPS folder)
- `.pages` (Apple Pages) files can't be read directly — use `.emltpl` or exported `.txt`
- `.emltpl` files: raw email with quoted-printable encoding; plain text usually lives in lines 20–100
- Drafted emails are transient: compose to a scratch/working file, open or send via Outlook / Apple Mail (or run the mail-merge), then delete the file. Do not store email drafts in the repo. There is no top-level `emails/` directory. Persistent data deliverables (speaker/contact CSVs, research lists) go into the relevant `projects/<project>/` folder.

### Mail accounts
- `/email-inbox` works on any account Apple Mail holds, and reads its settings from an **account profile** in `.claude/email-accounts/` (one Markdown file per account: which Apple Mail account, which client composes, whose voice, the filing map, the triage rules). `jack-icps.md` is the default (Exchange / ICPS); `jack-tech.md` covers the private consultancy address. The format and how to add one are in that folder's `README.md`. Reading and searching go through the `apple-mail-readonly` MCP; replying, composing, filing and marking go through the skill's scripts. Reusable email templates are in the skill's `templates/` folder, indexed in its `README.md`.

---

## Website quick-start (full context: `/website-dev`)

Next.js 15 (Pages Router) · TypeScript · Bootstrap 5 + SASS · MongoDB (Mongoose) + Supabase auth · AWS S3 + Vercel Blob · SMTP (SMTP.com via Nodemailer).

The app lives in `web/`. Run all `npm` commands from there:

```bash
cd web
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
npm run sass     # Compile SCSS
```

Invoke `/website-dev` for project structure, data files, component conventions, deployment notes.
