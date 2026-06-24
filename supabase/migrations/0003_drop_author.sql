-- Definitive fix: remove per-user author_id from the report tables and make
-- uniqueness per-period. Only touches the three report tables, so nothing here
-- can fail on auth.users permissions.

-- Dropping the column also drops the old composite unique(author_id, ...) it was part of.
alter table public.daily_reports   drop column if exists author_id cascade;
alter table public.weekly_reports  drop column if exists author_id cascade;
alter table public.monthly_reports drop column if exists author_id cascade;

-- One report per period.
alter table public.daily_reports
  add constraint daily_reports_report_date_key unique (report_date);
alter table public.weekly_reports
  add constraint weekly_reports_week_start_key unique (week_start);
alter table public.monthly_reports
  add constraint monthly_reports_month_key unique (month);
