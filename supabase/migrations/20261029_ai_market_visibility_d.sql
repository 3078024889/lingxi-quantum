-- Package D is staging-only; no automated production migration.
create table if not exists public.ai_market_visibility_observations (
 id bigint generated always as identity primary key,
 site text not null,
 entity_id text references public.ai_market_identity(id),
 query text not null,
 source text not null check(source in ('google_search_console','bing_webmaster','controlled_ai_probe')),
 kind text not null check(kind in ('search_performance','ai_citation_probe')),
 surface text,
 region text not null,
 language text not null,
 observed_day date not null,
 clicks integer check(clicks>=0),
 impressions integer check(impressions>=0),
 average_position numeric(12,5) check(average_position>=1),
 sample_size integer check(sample_size>=1),
 citation_count integer check(citation_count>=0),
 model_version text,
 method_version text,
 prompt_hash text,
 capture_method text,
 evidence_url text not null,
 evidence_id bigint references public.ai_market_evidence(id),
 verified_by uuid references auth.users(id),
 verified_at timestamptz,
 captured_at timestamptz not null default now(),
 check((verified_at is null)=(verified_by is null)),
 check(citation_count is null or sample_size is not null and citation_count<=sample_size),
 check((kind='search_performance' and source in ('google_search_console','bing_webmaster') and clicks is not null and impressions is not null and (sample_size is null) and (citation_count is null)) or
       (kind='ai_citation_probe' and source='controlled_ai_probe' and sample_size is not null and citation_count is not null and method_version is not null and model_version is not null and prompt_hash is not null))
);
create index if not exists ai_market_visibility_scope_idx on public.ai_market_visibility_observations(kind,source,site,observed_day,region,language);
create index if not exists ai_market_visibility_query_idx on public.ai_market_visibility_observations(site,query,observed_day desc);
alter table public.ai_market_visibility_observations enable row level security;
revoke all on public.ai_market_visibility_observations from anon,authenticated;
-- Do not publish owner-only Search Console data or probe traces without explicit authorization.
