-- SASI Cognitive Kernel v0.1
-- Stores model observations, memory, failures, hypotheses, strategies and eval runs.
-- It does NOT grant autonomous write access to production code or CORE-0.

begin;

create table if not exists public.sasi_memory_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  project_id uuid null references public.sasi_projects(id) on delete cascade,
  kind text not null check (kind in ('semantic','episodic','procedural','self')),
  scope text not null check (scope in ('global','user','project','task')),
  subject text not null,
  body jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  confidence numeric not null default 0.5 check (confidence between 0 and 1),
  supersedes uuid null references public.sasi_memory_records(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sasi_failure_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null references auth.users(id) on delete cascade,
  project_id uuid null references public.sasi_projects(id) on delete cascade,
  task_family text not null,
  failure_code text not null,
  observation jsonb not null default '{}'::jsonb,
  attribution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sasi_learning_strategies (
  id uuid primary key default gen_random_uuid(),
  strategy_key text not null,
  task_family text not null,
  version integer not null check (version > 0),
  stage text not null check (stage in ('proposal','sandbox','development-eval','sealed-eval','candidate','promoted','rejected')),
  genome jsonb not null,
  parent_ids uuid[] not null default '{}',
  hypothesis text not null default '',
  core_zero_version text not null,
  created_at timestamptz not null default now(),
  promoted_at timestamptz null,
  unique(strategy_key, version)
);

create table if not exists public.sasi_eval_runs (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references public.sasi_learning_strategies(id) on delete cascade,
  benchmark_kind text not null check (benchmark_kind in ('development','sealed','regression')),
  benchmark_hash text null,
  metrics jsonb not null default '{}'::jsonb,
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sasi_model_profiles (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model text not null,
  enabled boolean not null default false,
  verified boolean not null default false,
  byok boolean not null default true,
  capabilities jsonb not null default '{}'::jsonb,
  cost_weight numeric not null default 0.5 check (cost_weight between 0 and 1),
  latency_weight numeric not null default 0.5 check (latency_weight between 0 and 1),
  reliability_weight numeric not null default 0.5 check (reliability_weight between 0 and 1),
  observations jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(provider, model, byok)
);

alter table public.sasi_memory_records enable row level security;
alter table public.sasi_failure_events enable row level security;
alter table public.sasi_learning_strategies enable row level security;
alter table public.sasi_eval_runs enable row level security;
alter table public.sasi_model_profiles enable row level security;

-- Per-user/project memory and failures can only be read by their owner.
drop policy if exists "sasi_memory_owner_read" on public.sasi_memory_records;
create policy "sasi_memory_owner_read"
on public.sasi_memory_records
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "sasi_failure_owner_read" on public.sasi_failure_events;
create policy "sasi_failure_owner_read"
on public.sasi_failure_events
for select to authenticated
using (user_id = auth.uid());

-- Strategy/eval/model tables intentionally have no authenticated write policy.
-- Trusted server workers use service_role after sandbox/eval gates pass.

commit;
