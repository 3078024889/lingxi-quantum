-- SASI General Intelligence Seed v0.1
-- Knowledge units, evidence, conflicts and active-learning queue.

begin;

create table if not exists public.sasi_knowledge_units (
  id uuid primary key default gen_random_uuid(),
  concept text not null,
  domain text not null,
  definition text not null,
  epistemic_state text not null check (
    epistemic_state in (
      'verified-fact',
      'well-supported',
      'model-derived-hypothesis',
      'contested',
      'unknown',
      'deprecated'
    )
  ),
  confidence numeric not null check (confidence between 0 and 1),
  prerequisites jsonb not null default '[]'::jsonb,
  relations jsonb not null default '[]'::jsonb,
  conditions jsonb not null default '[]'::jsonb,
  counterexamples jsonb not null default '[]'::jsonb,
  common_misconceptions jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  valid_from timestamptz null,
  valid_until timestamptz null,
  last_verified_at timestamptz null,
  supersedes uuid null references public.sasi_knowledge_units(id) on delete set null,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sasi_knowledge_units_concept_idx
  on public.sasi_knowledge_units (concept);

create index if not exists sasi_knowledge_units_domain_idx
  on public.sasi_knowledge_units (domain);

create table if not exists public.sasi_knowledge_conflicts (
  id uuid primary key default gen_random_uuid(),
  concept text not null,
  incumbent_id uuid not null references public.sasi_knowledge_units(id) on delete cascade,
  challenger_id uuid not null references public.sasi_knowledge_units(id) on delete cascade,
  reason text not null,
  state text not null default 'open'
    check (state in ('open','resolved','superseded','dismissed')),
  resolution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz null
);

create table if not exists public.sasi_active_learning_queue (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  domain text not null,
  reason text not null check (
    reason in (
      'unknown',
      'low-confidence',
      'contradiction',
      'stale',
      'task-blocker',
      'user-correction'
    )
  ),
  priority text not null check (priority in ('critical','high','normal','low')),
  source_context_ids jsonb not null default '[]'::jsonb,
  state text not null default 'queued'
    check (state in ('queued','researching','verified','deferred','discarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sasi_knowledge_units enable row level security;
alter table public.sasi_knowledge_conflicts enable row level security;
alter table public.sasi_active_learning_queue enable row level security;

-- No direct anonymous/authenticated writes.
-- Trusted ingestion/promotion workers use service_role after source verification.

commit;
