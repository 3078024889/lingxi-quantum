-- Staging-only migration; do not apply automatically to production.
create table if not exists public.ai_market_candidates (
  candidate_key text primary key check (candidate_key ~ '^hf:(models|spaces):[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'),
  source text not null check (source = 'huggingface_hub'),
  source_url text not null,
  kind text not null check (kind in ('model_repository','space_repository')),
  display_name text not null,
  publisher text not null,
  verification_status text not null default 'candidate' check (verification_status in ('candidate','verified','rejected')),
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  source_updated_at timestamptz,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  raw_evidence jsonb not null default '{}'::jsonb,
  check ((verification_status = 'verified') = (verified_at is not null and verified_by is not null))
);
create index if not exists ai_market_candidates_recent_idx on public.ai_market_candidates (last_seen_at desc, candidate_key);
create index if not exists ai_market_candidates_status_recent_idx on public.ai_market_candidates (verification_status,last_seen_at desc);
alter table public.ai_market_candidates enable row level security;
revoke all on public.ai_market_candidates from anon, authenticated;
-- Only server-side service_role can access after explicit administrator check.
-- Ingestion must not mark unreviewed candidates verified.
