-- SASI V5 quality-first routing and privacy-preserving learning foundation.
-- Additive only. No existing data is rewritten or deleted.
begin;

create table if not exists public.sasi_v5_route_decisions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid null references public.sasi_tasks(id) on delete set null,
  project_id uuid null references public.sasi_projects(id) on delete set null,
  task_family text not null check (char_length(task_family) between 2 and 80),
  capability text not null check (char_length(capability) between 2 and 120),
  quality_tier text not null check (quality_tier in ('fast','standard','premium')),
  selected_route_id text null,
  quoted_price_fen bigint null check (quoted_price_fen is null or quoted_price_fen > 0),
  expected_delivery_cost_fen bigint null check (expected_delivery_cost_fen is null or expected_delivery_cost_fen >= 0),
  expected_margin numeric null check (expected_margin is null or expected_margin between -1 and 1),
  rejected jsonb not null default '[]'::jsonb,
  selected_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists sasi_v5_route_user_created_idx on public.sasi_v5_route_decisions(user_id,created_at desc);
create index if not exists sasi_v5_route_family_created_idx on public.sasi_v5_route_decisions(task_family,created_at desc);

create table if not exists public.sasi_v5_outcome_signals (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid null references public.sasi_tasks(id) on delete set null,
  project_id uuid null references public.sasi_projects(id) on delete set null,
  task_family text not null check (char_length(task_family) between 2 and 80),
  capability text null,
  provider text null,
  model text null,
  route_id text null,
  signal text not null check (signal in ('saved','downloaded','continued','regenerated','abandoned','refunded','explicit-positive','explicit-negative','delivered','failed','repaired','escalated')),
  satisfaction_weight numeric not null check (satisfaction_weight between -1 and 1),
  latency_ms bigint null check (latency_ms is null or latency_ms >= 0),
  provider_cost_minor bigint null check (provider_cost_minor is null or provider_cost_minor >= 0),
  provider_cost_currency text null,
  attempt_count integer null check (attempt_count is null or attempt_count >= 0),
  validator_score numeric null check (validator_score is null or validator_score between 0 and 1),
  failure_code text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists sasi_v5_signal_user_created_idx on public.sasi_v5_outcome_signals(user_id,created_at desc);
create index if not exists sasi_v5_signal_family_created_idx on public.sasi_v5_outcome_signals(task_family,created_at desc);
create index if not exists sasi_v5_signal_failure_idx on public.sasi_v5_outcome_signals(failure_code,created_at desc) where failure_code is not null;

create table if not exists public.sasi_v5_agent_registry (
  id uuid primary key default gen_random_uuid(),
  agent_key text not null,
  version text not null,
  source text not null,
  stage text not null check (stage in ('experimental','candidate','canary','stable','retired','rejected','quarantine')),
  capabilities jsonb not null default '[]'::jsonb,
  permissions jsonb not null default '[]'::jsonb,
  license_status text not null default 'review' check (license_status in ('approved','blocked','review')),
  security_status text not null default 'review' check (security_status in ('approved','blocked','review')),
  quality_score numeric null check (quality_score is null or quality_score between 0 and 1),
  reliability_score numeric null check (reliability_score is null or reliability_score between 0 and 1),
  cost_profile jsonb not null default '{}'::jsonb,
  benchmark_evidence jsonb not null default '{}'::jsonb,
  traffic_share numeric not null default 0 check (traffic_share between 0 and 1),
  discovered_at timestamptz not null default now(),
  verified_at timestamptz null,
  updated_at timestamptz not null default now(),
  unique(agent_key,version)
);
create index if not exists sasi_v5_agent_stage_idx on public.sasi_v5_agent_registry(stage,updated_at desc);

create table if not exists public.sasi_v5_model_registry (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  model text not null,
  capability text not null,
  stage text not null check (stage in ('experimental','candidate','canary','stable','retired','rejected','quarantine')),
  protocol text null,
  region text null,
  currency text null,
  pricing_unit text null,
  price_snapshot jsonb not null default '{}'::jsonb,
  price_valid_until timestamptz null,
  quality jsonb not null default '{}'::jsonb,
  accepted_rate numeric null check (accepted_rate is null or accepted_rate between 0 and 1),
  p50_latency_ms bigint null check (p50_latency_ms is null or p50_latency_ms >= 0),
  p95_latency_ms bigint null check (p95_latency_ms is null or p95_latency_ms >= 0),
  license_status text not null default 'review' check (license_status in ('approved','blocked','review')),
  security_status text not null default 'review' check (security_status in ('approved','blocked','review')),
  last_verified_at timestamptz null,
  updated_at timestamptz not null default now(),
  unique(provider,model,capability)
);
create index if not exists sasi_v5_model_stage_idx on public.sasi_v5_model_registry(stage,capability,updated_at desc);

alter table public.sasi_v5_route_decisions enable row level security;
alter table public.sasi_v5_outcome_signals enable row level security;
alter table public.sasi_v5_agent_registry enable row level security;
alter table public.sasi_v5_model_registry enable row level security;

drop policy if exists "sasi_v5_route_owner_read" on public.sasi_v5_route_decisions;
create policy "sasi_v5_route_owner_read" on public.sasi_v5_route_decisions for select to authenticated using (auth.uid()=user_id);
drop policy if exists "sasi_v5_signal_owner_read" on public.sasi_v5_outcome_signals;
create policy "sasi_v5_signal_owner_read" on public.sasi_v5_outcome_signals for select to authenticated using (auth.uid()=user_id);

revoke all on public.sasi_v5_route_decisions, public.sasi_v5_outcome_signals, public.sasi_v5_agent_registry, public.sasi_v5_model_registry from anon,authenticated;
grant select on public.sasi_v5_route_decisions, public.sasi_v5_outcome_signals to authenticated;
grant all on public.sasi_v5_route_decisions, public.sasi_v5_outcome_signals, public.sasi_v5_agent_registry, public.sasi_v5_model_registry to service_role;

commit;
