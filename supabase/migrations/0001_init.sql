-- Chat Manager Reports Dashboard — initial schema
-- Run this in the Supabase SQL editor (or via the Supabase CLI).

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user) + role
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  role       text not null default 'manager' check (role in ('manager', 'leadership')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leadership check helper (SECURITY DEFINER avoids RLS recursion on profiles).
create or replace function public.is_leadership()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'leadership'
  );
$$;

-- Keep updated_at fresh.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Report tables
-- ---------------------------------------------------------------------------
create table if not exists public.daily_reports (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  report_date date not null,
  revenue     numeric,
  top_model   text,
  top_chatter text,
  status      text not null default 'draft' check (status in ('draft', 'submitted')),
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (author_id, report_date)
);

create table if not exists public.weekly_reports (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week_start    date not null,
  week_end      date not null,
  total_revenue numeric,
  best_model    text,
  best_chatter  text,
  status        text not null default 'draft' check (status in ('draft', 'submitted')),
  data          jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (author_id, week_start)
);

create table if not exists public.monthly_reports (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  month          date not null, -- first day of the month
  target_revenue numeric,
  actual_revenue numeric,
  overall_rating text check (overall_rating in ('green', 'amber', 'red')),
  status         text not null default 'draft' check (status in ('draft', 'submitted')),
  data           jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (author_id, month)
);

create trigger touch_daily   before update on public.daily_reports   for each row execute function public.touch_updated_at();
create trigger touch_weekly  before update on public.weekly_reports  for each row execute function public.touch_updated_at();
create trigger touch_monthly before update on public.monthly_reports for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.daily_reports   enable row level security;
alter table public.weekly_reports  enable row level security;
alter table public.monthly_reports enable row level security;

-- Profiles: owner or leadership can read; owner can update their own.
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_leadership());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- Reports: author full control; leadership read-only across all authors.
do $$
declare t text;
begin
  foreach t in array array['daily_reports', 'weekly_reports', 'monthly_reports']
  loop
    execute format($f$
      create policy "%1$s_select" on public.%1$s
        for select using (author_id = auth.uid() or public.is_leadership());
      create policy "%1$s_insert" on public.%1$s
        for insert with check (author_id = auth.uid());
      create policy "%1$s_update" on public.%1$s
        for update using (author_id = auth.uid()) with check (author_id = auth.uid());
      create policy "%1$s_delete" on public.%1$s
        for delete using (author_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- To promote a user to leadership (run once Stan has signed in):
--   update public.profiles set role = 'leadership' where id = (
--     select id from auth.users where email = 'stan@example.com'
--   );
-- ---------------------------------------------------------------------------
