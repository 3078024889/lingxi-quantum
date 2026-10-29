-- LINGXIFIELD A-H staging integration: run only after isolated DB restore and explicit review.
-- Depends on 20261029_ai_market_data_center_a.sql. Never applied to active production by automation.
create table if not exists public.ai_market_verified_capabilities (
  id bigint generated always as identity primary key,
  entity_id text not null references public.ai_market_identity(id) on delete restrict,
  capability_key text not null check(length(capability_key) between 2 and 120),
  evidence_id bigint not null references public.ai_market_evidence(id) on delete restrict,
  verified_by uuid not null references auth.users(id),
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(entity_id,capability_key,evidence_id)
);
create index if not exists ai_market_verified_caps_entity on public.ai_market_verified_capabilities(entity_id,capability_key);
create table if not exists public.ai_market_profile_claims (
  id bigint generated always as identity primary key,
  entity_id text not null references public.ai_market_identity(id) on delete restrict,
  field text not null check(length(field) between 2 and 120),
  field_value text not null check(length(field_value) between 1 and 4000),
  source_url text not null check(source_url ~ '^https://'),
  source_name text not null check(length(source_name) between 1 and 200),
  checked_at timestamptz not null,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  check ((reviewed_at is null) = (reviewed_by is null))
);
create index if not exists ai_market_profile_claims_entity_review on public.ai_market_profile_claims(entity_id,reviewed_at desc);
alter table public.ai_market_verified_capabilities enable row level security;
alter table public.ai_market_profile_claims enable row level security;
revoke all on public.ai_market_verified_capabilities,public.ai_market_profile_claims from anon,authenticated;
-- The service-role API still validates evidence.entity_id = capability.entity_id and checked=true.
-- Do not insert fabricated verified records. Unverified source candidates belong in staging review only.
