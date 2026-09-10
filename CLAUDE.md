# ICPS Launchpad — Workspace

This repo is the working directory for **Jack Vanderpump** (Head of Policy Research, ICPS). It serves two purposes:

1. The **electoralnetwork.org** website (Next.js, in `web/`)
2. All **Electoral Members' Network / ICPS admin work** — emails, comms, events, articles, awards programme, speaker research. Drafts, skills, and notes live at the repo root alongside `web/`.

## Repo layout

```
.
├── web/                Next.js app (electoralnetwork.org) — package.json, src/, pages/, etc.
├── .claude/skills/     Skills (admin + website)
├── projects/           Cross-cutting work, one subfolder per project (each has its own CLAUDE.md)
├── scripts/            Admin AppleScripts
└── CLAUDE.md           This file
```

Vercel deploys from `web/`. The project's **Root Directory** is set to `web` in the Vercel dashboard (Settings → General → Root Directory). Default Next.js commands then work unchanged. Do not add a root-level `vercel.json` — it conflicts with framework detection.


---

## Projects

Cross-cutting work lives in `projects/`, one subfolder per project. **Each project folder keeps its own `CLAUDE.md`** with the current status, an index of the folder, key people and dates, and conventions. Read that file first when picking up a project, and keep it updated as things move.

| Project | What it is | Status doc |
|---------|-----------|------------|
| **nomos** | ICPS / NOMOS partnership: awareness campaigns, audience build, the 22nd Awards presence | `projects/nomos/CLAUDE.md` |
| **nomos-consultancy** | Jack's private, independent consultancy for NOMOS/Buzzmint. Separate from the ICPS partnership; keep confidential and out of partnership documents | `projects/nomos-consultancy/CLAUDE.md` |
| **awards26** | 22nd International Electoral Awards (Manila, 2026): sponsors, invoices, booking forms | `projects/awards26/CLAUDE.md` |
| **bsva** | BSVA survey analysis and rebuild | `projects/bsva/claude.md` |
| **smartmatic** | Smartmatic webinar series planning (results transmission, inclusive elections) | (no status doc yet) |
| **horizon** | EU Horizon Europe grant bid (INDEPACT): call, pitch, work packages | (no status doc yet) |

Note: `projects/` is gitignored (local working area), so its contents are not committed. Drafted emails and speaker/contact CSVs now live inside the relevant project folder (not a top-level `emails/` directory).

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
| Triage inbox, draft replies (Apple Mail) and new composes (Outlook) | `/email-inbox` |
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
– Never use m dashes
– Use humanizer skill for any communication/articles

### File & path quirks
- Legacy docs are all here /ICPS
- `.pages` (Apple Pages) files can't be read directly — use `.emltpl` or exported `.txt`
- `.emltpl` files: raw email with quoted-printable encoding; plain text usually lives in lines 20–100
- Drafted emails are transient: compose to a scratch/working file, open or send via Outlook / Apple Mail (or run the mail-merge), then delete the file. Do not store email drafts in the repo. There is no top-level `emails/` directory. Persistent data deliverables (speaker/contact CSVs, research lists) go into the relevant `projects/<project>/` folder.

### Email templates
- Reusable email templates live in the `/email-inbox` skill at `.claude/skills/email-inbox/templates/` (index and conventions in its `README.md`). Webinar templates in `templates/webinars/`: `speaker-briefing.md` (pre-event logistics email to confirmed speakers), `delegate-briefing.md` (joining details to registered delegates). Awards templates in `templates/awards/`: `sponsor-welcome.md` (first logistics email to a newly signed sponsor/exhibitor), `sponsor-nominations.md` (asking sponsors to nominate partner commissions ahead of a nominations deadline). Edition-specific notes sit at the end of each awards template under their own heading.

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
