-- SASI Promotion / Rollback Lineage — V11.00

begin;

create table if not exists public.sasi_promotion_snapshots (
  id uuid primary key,
  evolution_cycle_id uuid null references public.sasi_evolution_cycles(id) on delete set null,
  strategy_id text not null,
  proposal_id uuid null,
  repository_head_sha text not null,
  benchmark_evidence_id text not null,
  promoted_at timestamptz not null,
  promoted_by text not null,
  previous_stable_snapshot_id uuid null references public.sasi_promotion_snapshots(id) on delete set null,
  state text not null check (state in ('stable','canary','degraded','rolled-back','superseded')),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.sasi_post_promotion_observations (
  id bigserial primary key,
  snapshot_id uuid not null references public.sasi_promotion_snapshots(id) on delete cascade,
  correctness numeric null check (correctness is null or correctness between 0 and 1),
  quality numeric null check (quality is null or quality between 0 and 1),
  stability numeric null check (stability is null or stability between 0 and 1),
  latency_ms numeric null check (latency_ms is null or latency_ms >= 0),
  cost_minor numeric null check (cost_minor is null or cost_minor >= 0),
  error_rate numeric null check (error_rate is null or error_rate between 0 and 1),
  sample_count integer not null check (sample_count >= 0),
  observed_at timestamptz not null default now()
);

create table if not exists public.sasi_rollback_plans (
  id uuid primary key,
  from_snapshot_id uuid not null references public.sasi_promotion_snapshots(id) on delete cascade,
  to_snapshot_id uuid not null references public.sasi_promotion_snapshots(id) on delete restrict,
  from_head_sha text not null,
  to_head_sha text not null,
  reason_codes jsonb not null default '[]'::jsonb,
  requires_human_approval boolean not null default true,
  approved_by text null,
  approved_at timestamptz null,
  executed_at timestamptz null,
  state text not null default 'prepared'
    check (state in ('prepared','approved','executed','rejected','stale')),
  created_at timestamptz not null default now()
);

alter table public.sasi_promotion_snapshots enable row level security;
alter table public.sasi_post_promotion_observations enable row level security;
alter table public.sasi_rollback_plans enable row level security;

-- No authenticated write policies.
-- Rollback execution is intentionally not implemented as an autonomous DB trigger.

commit;
