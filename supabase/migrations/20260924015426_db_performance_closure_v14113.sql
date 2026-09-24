-- LINGXIFIELD V14.10.13–V14.10.16
-- Database performance closure.
--
-- Goals:
-- 1. Add covering indexes for all 24 foreign keys reported by Supabase Advisor.
-- 2. Optimize remaining auth.uid() RLS policies to use an initplan:
--      auth.uid() -> (select auth.uid())
--    without changing policy commands, roles, permissive/restrictive mode or ownership.
-- 3. Do NOT delete "unused" indexes merely because the young production tables
--    have not used them yet.
-- 4. Do NOT add policies to service-role-only RLS tables just to silence
--    "RLS enabled no policy" informational findings.

begin;

-- V14.10.13 — missing FK covering indexes.
create index if not exists ai_referral_rewards_inviter_user_id_idx
  on public.ai_referral_rewards(inviter_user_id);
create index if not exists ai_referral_rewards_referred_user_id_idx
  on public.ai_referral_rewards(referred_user_id);
create index if not exists ai_refund_requests_order_id_idx
  on public.ai_refund_requests(order_id);
create index if not exists ai_topup_reversals_user_id_idx
  on public.ai_topup_reversals(user_id);

create index if not exists cangxuan_characters_project_id_idx
  on public.cangxuan_characters(project_id);
create index if not exists cangxuan_continuity_events_user_id_idx
  on public.cangxuan_continuity_events(user_id);
create index if not exists cangxuan_knowledge_items_source_id_idx
  on public.cangxuan_knowledge_items(source_id);

create index if not exists field_questions_user_id_idx
  on public.field_questions(user_id);
create index if not exists practice_journal_entries_user_id_idx
  on public.practice_journal_entries(user_id);
create index if not exists reality_entries_user_id_idx
  on public.reality_entries(user_id);

create index if not exists sasi_assets_user_id_idx
  on public.sasi_assets(user_id);
create index if not exists sasi_byok_video_tasks_project_id_idx
  on public.sasi_byok_video_tasks(project_id);
create index if not exists sasi_deliveries_project_id_idx
  on public.sasi_deliveries(project_id);
create index if not exists sasi_jobs_node_id_idx
  on public.sasi_jobs(node_id);
create index if not exists sasi_jobs_project_id_idx
  on public.sasi_jobs(project_id);
create index if not exists sasi_node_dependencies_downstream_node_id_idx
  on public.sasi_node_dependencies(downstream_node_id);
create index if not exists sasi_nodes_user_id_idx
  on public.sasi_nodes(user_id);

create index if not exists tool_events_user_id_idx
  on public.tool_events(user_id);
create index if not exists tool_export_grants_user_id_idx
  on public.tool_export_grants(user_id);
create index if not exists tool_payment_quotes_tool_id_idx
  on public.tool_payment_quotes(tool_id);
create index if not exists tool_usage_ledger_order_id_idx
  on public.tool_usage_ledger(order_id);
create index if not exists tool_usage_ledger_user_id_idx
  on public.tool_usage_ledger(user_id);

create index if not exists wechat_mini_payment_events_order_id_idx
  on public.wechat_mini_payment_events(order_id);
create index if not exists wechat_mini_sessions_openid_idx
  on public.wechat_mini_sessions(openid);

-- V14.10.14 — optimize every remaining public-schema RLS policy that still
-- calls auth.uid() directly. ALTER POLICY preserves command and permissiveness.
do $$
declare
  p record;
  new_qual text;
  new_check text;
  sql_text text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='public'
      and (
        coalesce(qual,'') like '%auth.uid()%'
        or coalesce(with_check,'') like '%auth.uid()%'
      )
      and (
        coalesce(qual,'') not like '%select auth.uid()%'
        or coalesce(with_check,'') not like '%select auth.uid()%'
      )
  loop
    new_qual := case
      when p.qual is null then null
      else replace(p.qual, 'auth.uid()', '(select auth.uid())')
    end;
    new_check := case
      when p.with_check is null then null
      else replace(p.with_check, 'auth.uid()', '(select auth.uid())')
    end;

    sql_text := format('alter policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
    if new_qual is not null then
      sql_text := sql_text || ' using (' || new_qual || ')';
    end if;
    if new_check is not null then
      sql_text := sql_text || ' with check (' || new_check || ')';
    end if;

    execute sql_text;
  end loop;
end
$$;

commit;