-- SASI self-evolution control plane v0.1
-- Records proposed code mutations and their evaluation/promotion state.
-- Does not grant SASI direct production write or merge privileges.

begin;

create table if not exists public.sasi_code_proposals (
  id uuid primary key,
  strategy_id uuid null references public.sasi_learning_strategies(id) on delete set null,
  reason text not null,
  failure_ids uuid[] not null default '{}',
  base_head_sha text not null,
  patch_manifest jsonb not null,
  state text not null check (
    state in (
      'proposed',
      'sandboxed',
      'development-passed',
      'sealed-passed',
      'awaiting-human-approval',
      'approved',
      'rejected',
      'stale'
    )
  ),
  sandbox_result jsonb not null default '{}'::jsonb,
  development_eval_id uuid null references public.sasi_eval_runs(id) on delete set null,
  sealed_eval_id uuid null references public.sasi_eval_runs(id) on delete set null,
  human_approved_at timestamptz null,
  human_approved_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sasi_code_proposals enable row level security;

-- No anon/authenticated write policy. Trusted server processes may record
-- proposals; final production merge remains an explicit human-controlled action.

commit;
