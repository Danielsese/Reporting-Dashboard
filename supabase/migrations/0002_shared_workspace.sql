-- Switch from per-user auth to a single shared workspace (passcode-gated app).
-- All access is server-side via the service-role key; RLS stays ON so the
-- public/anon key can read nothing directly.

-- Drop the auth-era objects (safe if they don't exist).
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_leadership();
drop table if exists public.profiles cascade;

-- Rebuild report tables without author_id; uniqueness is per period.
drop table if exists public.daily_reports cascade;
drop table if exists public.weekly_reports cascade;
drop table if exists public.monthly_reports cascade;

create table public.daily_reports (
  id          uuid primary key default gen_random_uuid(),
  report_date date not null unique,
  revenue     numeric,
  top_model   text,
  top_chatter text,
  status      text not null default 'draft' check (status in ('draft', 'submitted')),
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.weekly_reports (
  id            uuid primary key default gen_random_uuid(),
  week_start    date not null unique,
  week_end      date not null,
  total_revenue numeric,
  best_model    text,
  best_chatter  text,
  status        text not null default 'draft' check (status in ('draft', 'submitted')),
  data          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.monthly_reports (
  id             uuid primary key default gen_random_uuid(),
  month          date not null unique, -- first day of the month
  target_revenue numeric,
  actual_revenue numeric,
  overall_rating text check (overall_rating in ('green', 'amber', 'red')),
  status         text not null default 'draft' check (status in ('draft', 'submitted')),
  data           jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_daily   before update on public.daily_reports   for each row execute function public.touch_updated_at();
create trigger touch_weekly  before update on public.weekly_reports  for each row execute function public.touch_updated_at();
create trigger touch_monthly before update on public.monthly_reports for each row execute function public.touch_updated_at();

-- RLS on, no policies → anon/public key is blocked; service role bypasses RLS.
alter table public.daily_reports   enable row level security;
alter table public.weekly_reports  enable row level security;
alter table public.monthly_reports enable row level security;
