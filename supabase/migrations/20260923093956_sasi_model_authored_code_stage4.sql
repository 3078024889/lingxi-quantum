-- SASI Model-Authored Code Stage IV

begin;

create table if not exists public.sasi_code_authoring_runs (
  id uuid primary key default gen_random_uuid(),
  evolution_cycle_id uuid null references public.sasi_evolution_cycles(id) on delete set null,
  strategy_id text not null,
  failure_ids jsonb not null default '[]'::jsonb,
  provider text null,
  model text null,
  repository_head_sha text not null,
  target_manifest jsonb not null default '[]'::jsonb,
  output_summary text not null default '',
  risk_level text not null check (risk_level in ('low','medium','high','blocked')),
  risk_reasons jsonb not null default '[]'::jsonb,
  proposal_id uuid null,
  state text not null check (
    state in (
      'requested',
      'authored',
      'rejected',
      'sandbox-passed',
      'sandbox-failed',
      'awaiting-benchmark',
      'awaiting-human-review',
      'approved',
      'discarded',
      'stale'
    )
  ),
  usage jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sasi_code_authoring_runs enable row level security;

-- No authenticated write policy.
-- Server-side evolution workers may persist records with service_role.
-- Production merge remains outside this table.

commit;
