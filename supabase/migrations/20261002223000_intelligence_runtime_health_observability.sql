begin;

alter table public.sasi_provider_connections
  add column if not exists cooldown_until timestamptz,
  add column if not exists last_success_at timestamptz,
  add column if not exists last_latency_ms integer;

create table if not exists public.sasi_intelligence_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text,
  capability text not null check (capability in ('text','image','video','audio')),
  provider text not null,
  model_id text,
  connection_id uuid,
  status text not null check (status in ('succeeded','failed','uncertain')),
  latency_ms integer,
  input_tokens bigint,
  output_tokens bigint,
  error_code text,
  created_at timestamptz not null default now()
);

create index if not exists sasi_intelligence_runs_user_created_idx
  on public.sasi_intelligence_runs(user_id, created_at desc);
create index if not exists sasi_intelligence_runs_provider_created_idx
  on public.sasi_intelligence_runs(provider, created_at desc);

alter table public.sasi_intelligence_runs enable row level security;

drop policy if exists sasi_intelligence_runs_select_own on public.sasi_intelligence_runs;
create policy sasi_intelligence_runs_select_own
  on public.sasi_intelligence_runs
  for select
  using (auth.uid() = user_id);

commit;
