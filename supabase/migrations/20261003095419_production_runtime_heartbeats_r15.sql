create table if not exists public.ops_runtime_heartbeats (
  key text primary key,
  last_started_at timestamptz,
  last_succeeded_at timestamptz,
  last_failed_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ops_runtime_heartbeats enable row level security;
revoke all on table public.ops_runtime_heartbeats from public, anon, authenticated;
grant all on table public.ops_runtime_heartbeats to service_role;

create index if not exists ops_runtime_heartbeats_updated_idx
  on public.ops_runtime_heartbeats(updated_at desc);
