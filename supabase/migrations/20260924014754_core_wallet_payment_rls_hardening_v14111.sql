-- LINGXIFIELD V14.10.11
-- Core wallet/payment least privilege and RLS performance hardening.
-- No data mutation. No policy broadening.

begin;

-- Browser clients may read only their own rows through RLS.
-- All mutations remain server/service-role controlled.
revoke all on table public.orders from anon;
revoke insert, update, delete on table public.orders from authenticated;
grant select on table public.orders to authenticated;
grant select, insert, update, delete on table public.orders to service_role;

revoke all on table public.tool_payment_quotes from anon;
revoke insert, update, delete on table public.tool_payment_quotes from authenticated;
grant select on table public.tool_payment_quotes to authenticated;
grant select, insert, update, delete on table public.tool_payment_quotes to service_role;

revoke all on table public.tool_export_grants from anon;
revoke insert, update, delete on table public.tool_export_grants from authenticated;
grant select on table public.tool_export_grants to authenticated;
grant select, insert, update, delete on table public.tool_export_grants to service_role;

revoke all on table public.tool_paid_jobs from anon;
revoke insert, update, delete on table public.tool_paid_jobs from authenticated;
grant select on table public.tool_paid_jobs to authenticated;
grant select, insert, update, delete on table public.tool_paid_jobs to service_role;

revoke all on table public.ai_wallets from anon;
revoke insert, update, delete on table public.ai_wallets from authenticated;
grant select on table public.ai_wallets to authenticated;
grant select, insert, update, delete on table public.ai_wallets to service_role;

revoke all on table public.ai_wallet_ledger from anon;
revoke insert, update, delete on table public.ai_wallet_ledger from authenticated;
grant select on table public.ai_wallet_ledger to authenticated;
grant select, insert, update, delete on table public.ai_wallet_ledger to service_role;

revoke all on table public.ai_requests from anon;
revoke insert, update, delete on table public.ai_requests from authenticated;
grant select on table public.ai_requests to authenticated;
grant select, insert, update, delete on table public.ai_requests to service_role;

revoke all on table public.sasi_wallets from anon;
revoke insert, update, delete on table public.sasi_wallets from authenticated;
grant select on table public.sasi_wallets to authenticated;
grant select, insert, update, delete on table public.sasi_wallets to service_role;

-- Avoid auth.uid() re-evaluation for every row.
drop policy if exists "own orders read" on public.orders;
create policy "own orders read" on public.orders
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own tool quotes" on public.tool_payment_quotes;
create policy "users read own tool quotes" on public.tool_payment_quotes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own tool grants" on public.tool_export_grants;
create policy "users read own tool grants" on public.tool_export_grants
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own paid tool jobs" on public.tool_paid_jobs;
create policy "users read own paid tool jobs" on public.tool_paid_jobs
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own ai wallet" on public.ai_wallets;
create policy "users read own ai wallet" on public.ai_wallets
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own ai ledger" on public.ai_wallet_ledger;
create policy "users read own ai ledger" on public.ai_wallet_ledger
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users read own ai requests" on public.ai_requests;
create policy "users read own ai requests" on public.ai_requests
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "own sasi wallet read" on public.sasi_wallets;
create policy "own sasi wallet read" on public.sasi_wallets
  for select to authenticated
  using ((select auth.uid()) = user_id);

commit;