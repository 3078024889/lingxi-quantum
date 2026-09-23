-- SASI Learning Runtime Stage II
-- Durable run lineage, model observations, episodic and procedural memory.

begin;

create table if not exists public.sasi_learning_runs (
  id uuid primary key,
  user_id uuid null references auth.users(id) on delete cascade,
  project_id uuid null references public.sasi_projects(id) on delete cascade,
  source_id uuid not null,
  candidate_id uuid not null,
  state text not null check (
    state in (
      'started',
      'candidate-created',
      'reviewed',
      'needs-evidence',
      'ready-for-promotion',
      'promoted',
      'rejected',
      'failed'
    )
  ),
  extractor_teacher_id text not null,
  critic_teacher_ids jsonb not null default '[]'::jsonb,
  provider_trace jsonb not null default '[]'::jsonb,
  usage jsonb not null default '{}'::jsonb,
  failure_code text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sasi_model_observations (
  id bigserial primary key,
  provider text not null,
  model text not null,
  capability text not null,
  score numeric not null check (score between 0 and 1),
  latency_ms integer null check (latency_ms is null or latency_ms >= 0),
  input_tokens integer null check (input_tokens is null or input_tokens >= 0),
  output_tokens integer null check (output_tokens is null or output_tokens >= 0),
  cost_minor integer null check (cost_minor is null or cost_minor >= 0),
  currency text null,
  success boolean not null,
  benchmark text not null,
  observed_at timestamptz not null default now()
);

create index if not exists sasi_model_observations_lookup_idx
  on public.sasi_model_observations(provider, model, capability, observed_at desc);

create table if not exists public.sasi_episodic_memory (
  id uuid primary key,
  user_id uuid null references auth.users(id) on delete cascade,
  project_id uuid null references public.sasi_projects(id) on delete cascade,
  task_family text not null,
  task_summary text not null,
  outcome text not null check (outcome in ('success','partial','failure','aborted')),
  strategy_id text null,
  failure_codes jsonb not null default '[]'::jsonb,
  observations jsonb not null default '[]'::jsonb,
  lessons jsonb not null default '[]'::jsonb,
  evidence_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.sasi_procedural_memory (
  id uuid primary key,
  task_family text not null,
  strategy_id text null,
  title text not null,
  steps jsonb not null default '[]'::jsonb,
  success_rate numeric not null check (success_rate between 0 and 1),
  sample_size integer not null check (sample_size >= 0),
  last_used_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sasi_learning_runs enable row level security;
alter table public.sasi_model_observations enable row level security;
alter table public.sasi_episodic_memory enable row level security;
alter table public.sasi_procedural_memory enable row level security;

drop policy if exists "sasi_learning_run_owner_read" on public.sasi_learning_runs;
create policy "sasi_learning_run_owner_read"
on public.sasi_learning_runs
for select to authenticated
using (user_id = auth.uid());

drop policy if exists "sasi_episode_owner_read" on public.sasi_episodic_memory;
create policy "sasi_episode_owner_read"
on public.sasi_episodic_memory
for select to authenticated
using (user_id = auth.uid());

-- Model observations and global procedural memory intentionally have no
-- authenticated read/write policy in v1. Trusted server workers use service_role.

commit;
