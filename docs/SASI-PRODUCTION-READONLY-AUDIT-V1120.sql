-- SELECT-only production audit
select version,name from supabase_migrations.schema_migrations order by version;
select table_name from information_schema.tables where table_schema='public' and (table_name like 'sasi_%' or table_name like 'ai_%') order by table_name;
select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname='public' and tablename like 'sasi_%' order by tablename,policyname;
select n.nspname as schema_name,p.proname,pg_get_function_identity_arguments(p.oid) as args,p.prosecdef as security_definer,has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and (p.proname like '%sasi%' or p.proname like '%ai_funds%' or p.proname='ai_wallet_snapshot') order by p.proname;
