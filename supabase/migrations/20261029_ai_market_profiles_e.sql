-- E: staging-only evidence-backed claims and external feedback; no production auto-migration.
create table if not exists public.ai_market_profile_claims (
 id bigint generated always as identity primary key,
 entity_id text not null references public.ai_market_identity(id),
 field text not null check(field in ('founded_year','headquarters','funding','official_website','commercial_license','free_quota','regional_access','refund_policy','price','service_limits')),
 field_value text not null,
 source_name text not null,
 source_url text not null,
 source_class text not null check(source_class in ('official','registry','licensed_third_party')),
 evidence_id bigint not null references public.ai_market_evidence(id),
 checked_at timestamptz not null,
 created_at timestamptz not null default now(),
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 check ((reviewed_by is null)=(reviewed_at is null))
);
create table if not exists public.ai_market_external_feedback (
 id bigint generated always as identity primary key,
 entity_id text not null references public.ai_market_identity(id),
 platform text not null check(platform in ('youtube','github','x','first_party')),
 external_id text not null,
 source_url text not null,
 topic text not null,
 concise_summary text not null,
 observed_at timestamptz not null,
 evidence_id bigint references public.ai_market_evidence(id),
 rights_checked boolean not null default false,
 reviewed_by uuid references auth.users(id),
 reviewed_at timestamptz,
 unique(platform,external_id,entity_id),
 check ((reviewed_by is null)=(reviewed_at is null))
);
create index if not exists ai_market_profile_claims_entity_field on public.ai_market_profile_claims(entity_id,field,checked_at desc);
create index if not exists ai_market_external_feedback_entity_recent on public.ai_market_external_feedback(entity_id,observed_at desc);
alter table public.ai_market_profile_claims enable row level security;
alter table public.ai_market_external_feedback enable row level security;
revoke all on public.ai_market_profile_claims,public.ai_market_external_feedback from anon,authenticated;
