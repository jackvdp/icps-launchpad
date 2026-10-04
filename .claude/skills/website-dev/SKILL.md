---
name: website-dev
description: Website-development context for electoralnetwork.org. Use when editing code, components, pages, API routes, data files, or styles in this Next.js repo. Covers tech stack, project structure, key data files, conventions, and commands.
argument-hint: "task description, e.g. add a new admin page or update the winners data"
---

# Website Development - electoralnetwork.org

This is the website for the **International Electoral Awards & Symposium**, run by ICPS and the Electoral Members' Network. Use this skill for any code change in the repo.

## Tech stack

- **Framework:** Next.js 15 (**Pages Router**, not App Router)
- **Language:** TypeScript / React 18
- **Styling:** Bootstrap 5.2 + SASS (`web/src/assets/scss/` compiles to `web/public/css`)
- **Database:** MongoDB via Mongoose (events, articles, bookings, users) + Supabase (auth, SSR sessions)
- **Storage:** AWS S3 + Vercel Blob
- **Email:** SMTP (SMTP.com) via Nodemailer
- **Image processing:** Sharp
- **AI:** `@ai-sdk/anthropic` + `ai` SDK
- **Other UI:** Swiper, GLightbox, Isotope, ScrollCue, react-markdown, react-countup

## Project structure

The Next.js app lives in `web/` at the repo root. Everything below is relative to `web/`. Run all `npm` commands from `web/` (or use the root `vercel.json` commands, which `cd web` for you).

```
web/
  pages/
    _app.tsx, _document.tsx, 404.tsx
    index.tsx                 - Home
    about.tsx, contact.tsx, gallery.tsx, account.tsx
    register/                 - Sign-up flow
    forgot.tsx, reset-password.tsx
    awards/                   - Main awards pages (index, categories, schedule, submit, winners)
      2023/, 2024/            - Archived editions
    admin/                    - Admin dashboard (auth-gated)
      dashboard/, articles/, bookings/, events/, images/, comms-plan.tsx
    api/                      - API routes (send-email, users, comms-templates, etc.)
    articles/                 - Public articles (MongoDB-backed)
    events/                   - Public events (MongoDB-backed)

  src/
    data/                     - Static TypeScript data files (see table below)
    components/               - React components
    assets/                   - SCSS source (compiled to web/public/css via `npm run sass`)
    auth/                     - Supabase auth helpers
    backend/                  - Server-side utilities (MongoDB models, API helpers)
    helpers/                  - Shared utilities
    hooks/                    - React hooks
    markups/, plugins/        - Misc UI fragments and 3rd-party integrations
    theme/                    - Theme tokens / shared styles
    scripts/                  - One-off scripts (seeds, migrations)

```

## Key data files (`web/src/data/`)

| File | Purpose |
|------|---------|
| `award-categories.ts` | All 11 award category definitions, descriptions, criteria |
| `winners25.ts` | 2025 winners (Gaborone) |
| `winners24.ts` | 2024 winners |
| `winners.ts` | Historical winners (pre-2024) |
| `judges.ts` | Current judging committee |
| `schedule.ts` | Current event schedule |
| `sponsors.ts` | Sponsors |
| `organisers.ts` | Co-host organisations |
| `faq.ts` | FAQs |
| `countries.ts` | Country list (for nominations + registration) |
| `comms-plan-2026.ts` | 2026 delegate-acquisition comms plan |

## MongoDB-backed content

Events, articles, bookings, and users live in **MongoDB**, not in `web/src/data/`. Don't try to edit them by hand:

| To do this | Use this skill |
|------------|----------------|
| Add an event/webinar | `/add-event` |
| Edit an event/webinar | `/edit-event` |
| Write & publish an article | `/add-article` |
| Draft a comms-plan email (.eml) | `/comms-email` |

Mongoose models live in `web/src/backend/`.

## Commands

All `npm` commands must be run from `web/` — the `package.json` is there, not at repo root.

```bash
cd web
npm run dev      # Start development server (next dev)
npm run build    # Production build (next build)
npm run start    # Start production server (next start)
npm run lint     # ESLint
npm run sass     # Compile web/src/assets/scss/ to web/public/css/
```

When you edit SCSS, you (or the user) need to run `npm run sass` to see the change in the browser. The `dev` server alone doesn't recompile SCSS.

## Conventions

- **Pages Router**, not App Router. Don't introduce `app/` directory patterns. Data fetching uses `getServerSideProps` / `getStaticProps`, not server components.
- **TypeScript everywhere.** Match existing types in `web/src/data/*` when extending.
- **British English** in user-facing copy (page titles, button text, descriptions).
- **Accessibility:** alt text on all images, descriptive link text, semantic HTML.
- **Bootstrap 5 utility classes** for layout where reasonable; custom SCSS for anything beyond.
- **Admin pages** are auth-gated via Supabase. Check `web/src/auth/` for the helpers before adding new admin routes.
- **Email** goes through the shared SMTP transport in `src/backend/services/email/mailer.ts` (`sendMail`). Bodies are rendered in `src/backend/services/email/templates/`, not by the provider. Config: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`.

## Deployment

Hosted on Vercel. Pushing to `main` deploys.

## Database backups

The Atlas cluster has no backups of its own, so the site takes them. Vercel's cron (`web/vercel.json`) calls `pages/api/cron/backup.ts` once a day at 02:00 UTC, which copies every database on the cluster into one gzipped JSON file in the private Blob store `electoral-backups` (`src/backend/use_cases/backups/backupCluster.ts`). It only reads the cluster.

- The route answers only to `Authorization: Bearer <CRON_SECRET>`, which Vercel's cron sends. `CRON_SECRET` and `BACKUP_BLOB_READ_WRITE_TOKEN` are set on the Vercel project and in `web/.env.local`.
- The backup holds contact details and password hashes. Never write it to the site's public store (`BLOB_READ_WRITE_TOKEN`).
- The site's own Blob calls pass `siteStore()` (`src/backend/services/blob/siteStore.ts`) so they always use the public store. Keep doing that in new code: connecting the backup store to the project in Vercel's dashboard adds `BLOB_STORE_ID`, which the Blob package prefers to `BLOB_READ_WRITE_TOKEN`, and on 4 October 2026 that emptied the gallery until the variable was removed. If `BLOB_STORE_ID` or `BLOB_WEBHOOK_PUBLIC_KEY` reappear on the project, remove them.
- `node --env-file=.env.local scripts/fetch-backup.mjs` (from `web/`) lists the backups; add `latest` to download one to `~/Backups/electoral-mongodb/blob/` and check it unpacks. `scripts/backup-cluster.mjs` takes a copy straight to this machine instead, in the layout `mongorestore` reads.
- Files uploaded to Blob (nomination documents, images) are not in the backup. Nothing prunes old backups; each is about 350 KB.

## Style guide (when touching user-facing copy)

- British English (organise, recognise, honour, programme, centre)
- Dates: 17 September 2026 (Day-Month-Year)
- Numbers: words for one-nine, numerals for 10+
- Define acronyms on first use
- Never use em dashes - use hyphens, colons, commas, or parentheses
