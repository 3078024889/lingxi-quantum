-- SASI Self-Evolution Stage III
-- Durable failure attribution, hypotheses, evolution cycles and promotion records.

begin;

create table if not exists public.sasi_failure_attributions_v2 (
  id uuid primary key,
  run_id uuid null references public.sasi_learning_runs(id) on delete set null,
  task_family text not null,
  failure_code text not null,
  category text not null,
  observation text not null,
  likely_causes jsonb not null default '[]'::jsonb,
  affected_capabilities jsonb not null default '[]'::jsonb,
  severity text not null check (severity in ('low','medium','high','critical')),
  reproducible boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.sasi_improvement_hypotheses (
  id uuid primary key,
  failure_attribution_id uuid not null references public.sasi_failure_attributions_v2(id) on delete cascade,
  task_family text not null,
  statement text not null,
  expected_effect text not null,
  target_capabilities jsonb not null default '[]'::jsonb,
  proposed_interventions jsonb not null default '[]'::jsonb,
  falsification_criteria jsonb not null default '[]'::jsonb,
  confidence numeric not null check (confidence between 0 and 1),
  created_at timestamptz not null default now()
);

create table if not exists public.sasi_evolution_cycles (
  id uuid primary key,
  episode_id uuid null references public.sasi_episodic_memory(id) on delete set null,
  failure_attribution_id uuid not null references public.sasi_failure_attributions_v2(id) on delete cascade,
  hypothesis_id uuid not null references public.sasi_improvement_hypotheses(id) on delete cascade,
  parent_strategy_id text not null,
  child_strategy_id text not null,
  state text not null check (
    state in (
      'attributed',
      'hypothesis-created',
      'strategy-mutated',
      'awaiting-sandbox',
      'sandboxed',
      'evaluated',
      'awaiting-human-approval',
      'promoted',
      'rejected'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sasi_evolution_promotion_records (
  id uuid primary key,
  strategy_id text not null,
  hypothesis_id uuid not null references public.sasi_improvement_hypotheses(id) on delete cascade,
  proposal_id uuid null,
  development_result jsonb not null,
  sealed_result jsonb not null,
  regression_result jsonb not null,
  sandbox_passed boolean not null,
  human_approved boolean not null default false,
  tested_head_sha text not null,
  current_head_sha text not null,
  decision text not null check (decision in ('promote','reject','stale')),
  reasons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.sasi_failure_attributions_v2 enable row level security;
alter table public.sasi_improvement_hypotheses enable row level security;
alter table public.sasi_evolution_cycles enable row level security;
alter table public.sasi_evolution_promotion_records enable row level security;

-- No authenticated write policies.
-- Trusted service-role workers persist evolution evidence.
-- Human approval remains outside autonomous database mutation.

commit;
