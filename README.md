# Reports Dashboard

A platform for the chat manager to fill out **Daily**, **Weekly**, and **Monthly**
manager reports in one organized place. Leadership (Stan) can review every
submitted report and see trends over time.

Built with **Next.js 16 (App Router) + TypeScript + Tailwind**, **Supabase**
(Postgres), **react-hook-form + zod**, and **recharts**.

Access is gated by a single **shared access code** (no individual accounts). All
database access happens server-side with the Supabase service-role key, so the
data is never exposed to the browser — the only way in is the passcode.

## Features

- **Three structured report forms** mirroring the existing templates, with
  green/yellow/red status pickers, checklists, repeatable rows (whales,
  offenders, events…) and the recurring "1 / 2 / 3" lists.
- **Draft + autosave** — work is saved as you type; submit when ready.
- **History & browsing** — every report is listed by date and re-openable.
- **Auto-carry** — starting a weekly report pulls revenue and roll-ups from that
  week's daily reports; starting a monthly report pulls from that month's
  weekly reports.
- **Dashboard** — revenue trend (last 30 days), key stats, recent reports.
- **Roles** — `manager` fills + submits; `leadership` reads everyone's reports
  (enforced by Postgres Row Level Security).

## Setup

### 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project**.
2. Open **Project Settings → API** and copy the **Project URL** and the
   **anon public** key.

### 2. Run the database migration

In the Supabase dashboard → **SQL Editor**, run both migration files in order:
[`0001_init.sql`](supabase/migrations/0001_init.sql) then
[`0002_shared_workspace.sql`](supabase/migrations/0002_shared_workspace.sql).
(If starting fresh, running just `0002` is enough — it rebuilds the tables.)

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...           # Project URL (https://<ref>.supabase.co)
SUPABASE_SERVICE_ROLE_KEY=...          # Secret/service-role key (sb_secret_...)
APP_PASSCODE=...                       # The shared access code people type in
AUTH_TOKEN=...                         # Random string: openssl rand -hex 32
```

### 4. Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and enter the **access code** (`APP_PASSCODE`).

### Changing the access code

Edit `APP_PASSCODE` in your environment. To force everyone to re-enter it,
also change `AUTH_TOKEN` (this invalidates existing sessions).

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel (or use the Vercel CLI).
2. Add the four env vars (`NEXT_PUBLIC_SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `APP_PASSCODE`, `AUTH_TOKEN`) in the Vercel
   project settings.

## Project structure

```
src/
  app/
    login/                   passcode sign-in (page + server action)
    auth/signout/            clears the session cookie
    (app)/                   authenticated area (sidebar shell)
      page.tsx               dashboard
      daily|weekly|monthly/  list + new + [id] + server actions
  components/
    forms/                   Daily / Weekly / Monthly form bodies
    form/                    field components, section layout, save shell
    charts/                  recharts trend
    app-shell.tsx, report-list.tsx, …
  lib/
    supabase/admin.ts        server-only service-role client
    session.ts               passcode session cookie helpers
    schemas/                 zod schemas per report type
    autocarry.ts             daily→weekly→monthly aggregation
    dates.ts, parse.ts, constants.ts
middleware.ts                passcode gate
supabase/migrations/         SQL schema
```

## Notes

- The Missed-Upsells model roster lives in
  [`src/lib/constants.ts`](src/lib/constants.ts) — edit `MODELS` as the roster
  changes.
- PDF export is not implemented yet (intentionally deferred).
