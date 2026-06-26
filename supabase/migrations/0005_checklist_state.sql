-- Ops Checklist completion state. One row per (checklist, period_key); `checked`
-- holds the set of completed item ids. Auto-reset is free: a new period key has
-- no row, so the list shows empty. Shared across the workspace (single passcode).
create table if not exists public.checklist_state (
  id         uuid primary key default gen_random_uuid(),
  checklist  text not null check (checklist in ('daily', 'weekly', 'monthly')),
  period_key text not null,
  checked    jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique (checklist, period_key)
);

alter table public.checklist_state enable row level security;
-- No policies → anon/public key blocked; the server uses the service-role key.
