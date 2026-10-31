-- V3.8: Public, aggregated coverage only. Raw candidate rows stay protected.
-- SECURITY DEFINER is in the unexposed private schema; public wrapper is SECURITY INVOKER.
create or replace function private.ai_market_coverage_aggregate()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
 select pg_catalog.jsonb_build_object(
  'candidateCount',(select count(*) from public.ai_market_candidates),
  'approvedCandidateCount',(select count(*) from public.ai_market_candidates where verification_status='verified'),
  'sourceItemCount',(select count(*) from public.ai_market_source_items),
  'reviewNeededCount',(select count(*) from public.ai_market_source_items where needs_review is true),
  'latestObservedAt',(select max(last_seen_at) from public.ai_market_source_items),
  'syncRunCount',(select count(*) from public.ai_market_source_sync_runs)
 );
$$;
revoke all on function private.ai_market_coverage_aggregate() from public;
grant usage on schema private to anon,authenticated;
grant execute on function private.ai_market_coverage_aggregate() to anon,authenticated;

create or replace function public.ai_market_public_coverage()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$ select private.ai_market_coverage_aggregate(); $$;
revoke all on function public.ai_market_public_coverage() from public;
grant execute on function public.ai_market_public_coverage() to anon,authenticated;
