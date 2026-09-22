alter function public.handle_new_user() set search_path = public, pg_temp;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

alter function public.rate_limit_check(text, integer, integer) set search_path = public, pg_temp;

alter function public.rls_auto_enable() set search_path = public, pg_temp;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
grant execute on function public.rls_auto_enable() to service_role;

drop policy if exists "deny client ai topup reversals" on public.ai_topup_reversals;
create policy "deny client ai topup reversals" on public.ai_topup_reversals
for all using (false) with check (false);

drop policy if exists "deny client tool pricing" on public.tool_pricing;
create policy "deny client tool pricing" on public.tool_pricing
for all using (false) with check (false);

drop policy if exists "deny client tool events" on public.tool_events;
create policy "deny client tool events" on public.tool_events
for all using (false) with check (false);
