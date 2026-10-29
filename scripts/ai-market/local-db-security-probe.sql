-- Disposable local database verification only. Raises on missing tables / weak RLS.
do $$
declare t text; expected text[] := array[
 'ai_market_sources','ai_market_identity','ai_market_evidence','ai_market_ingest_runs',
 'ai_market_metric_observations','ai_market_ranking_snapshots',
 'ai_market_verified_capabilities','ai_market_profile_claims',
 'ai_market_vendor_claims','ai_market_sponsored_orders',
 'ai_market_payment_events','ai_market_payment_refunds'
];
begin
 foreach t in array expected loop
  if to_regclass('public.'||t) is null then raise exception 'MISSING_TABLE: %',t; end if;
  if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=t and c.relrowsecurity) then raise exception 'RLS_OFF: %',t; end if;
  if has_table_privilege('anon','public.'||t,'SELECT') or has_table_privilege('authenticated','public.'||t,'SELECT') or has_table_privilege('anon','public.'||t,'INSERT') or has_table_privilege('authenticated','public.'||t,'UPDATE') then raise exception 'PUBLIC_PRIVILEGE: %',t; end if;
 end loop;
 raise notice 'AI_MARKET_SCHEMA_RLS_PASS: % tables',array_length(expected,1);
end $$;
