-- SASI Measured Benchmark & Candidate Competition — V10.90

begin;

create table if not exists public.sasi_benchmark_suites (
  id uuid primary key default gen_random_uuid(),
  suite_key text not null,
  version integer not null check (version > 0),
  kind text not null check (kind in ('development','sealed','regression')),
  fixture_hash text not null,
  case_count integer not null check (case_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(suite_key, version, kind)
);

create table if not exists public.sasi_candidate_evaluations (
  id uuid primary key default gen_random_uuid(),
  evolution_cycle_id uuid null references public.sasi_evolution_cycles(id) on delete set null,
  candidate_id text not null,
  strategy_id text not null,
  suite_key text not null,
  suite_version integer not null,
  suite_kind text not null check (suite_kind in ('development','sealed','regression')),
  suite_hash text not null,
  tested_head_sha text not null,
  metrics jsonb not null,
  observations jsonb not null default '[]'::jsonb,
  passed boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists sasi_candidate_eval_lookup_idx
  on public.sasi_candidate_evaluations(
    evolution_cycle_id,
    candidate_id,
    suite_kind,
    created_at desc
  );

create table if not exists public.sasi_candidate_competitions (
  id uuid primary key default gen_random_uuid(),
  evolution_cycle_id uuid null references public.sasi_evolution_cycles(id) on delete set null,
  baseline_candidate_id text not null,
  candidate_ids jsonb not null default '[]'::jsonb,
  policy jsonb not null,
  decision jsonb not null,
  tested_head_sha text not null,
  development_suite_hash text not null,
  sealed_suite_hash text not null,
  regression_suite_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.sasi_benchmark_suites enable row level security;
alter table public.sasi_candidate_evaluations enable row level security;
alter table public.sasi_candidate_competitions enable row level security;

-- No authenticated write policy.
-- Trusted evaluation workers persist benchmark/evaluation evidence.
-- Sealed fixtures themselves should not be exposed through public read paths.

commit;
