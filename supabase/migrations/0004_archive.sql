-- Add soft-archive support. archived_at NULL = active; non-NULL = archived.
alter table public.daily_reports   add column if not exists archived_at timestamptz;
alter table public.weekly_reports  add column if not exists archived_at timestamptz;
alter table public.monthly_reports add column if not exists archived_at timestamptz;
