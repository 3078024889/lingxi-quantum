-- Draft only. DO NOT APPLY TO PRODUCTION.
-- Execute after tool-pass-v2-unapplied-database-draft.sql in disposable PG17.
-- Credits ORIGINAL wallets only, never an external PSP/payment-card refund.
begin;

create table if not exists public.tool_pass_wallet_refunds_v2 (
 refund_id uuid primary key,
 order_id uuid not null unique references public.tool_pass_orders_v2(request_id),
 user_id uuid not null,
 currency text not null check(currency in ('CNY','USD')),
 total_minor bigint not null check(total_minor>0),
 active_minor bigint not null check(active_minor>=0),
 legacy_minor bigint not null check(legacy_minor>=0),
 active_refundable_minor bigint not null check(active_refundable_minor>=0),
 legacy_refundable_minor bigint not null check(legacy_refundable_minor>=0),
 created_at timestamptz not null default now(),
 constraint tool_pass_refund_balances_check check(active_minor+legacy_minor=total_minor),
 constraint tool_pass_refund_principal_check check(
  active_refundable_minor<=active_minor and legacy_refundable_minor<=legacy_minor)
);
alter table public.tool_pass_wallet_refunds_v2 enable row level security;
revoke all on public.tool_pass_wallet_refunds_v2 from public,anon,authenticated;

-- Existing historical AI wallet event types remain valid. Add one distinct
-- type; never mislabel this as an external PSP refund/hold release.
alter table public.ai_wallet_ledger drop constraint if exists ai_wallet_ledger_kind_check;
alter table public.ai_wallet_ledger add constraint ai_wallet_ledger_kind_check check(kind in (
 'topup','reserve','settle','release','referral_bonus','refund_hold',
 'refund_release','refund_complete','topup_reversal','referral_reversal',
 'debt_offset','withdrawal_hold','withdrawal_release','withdrawal_complete',
 'usage_v49','tool_pass_refund_v2'
));

create or replace function public.refund_unused_tool_pass_wallet_v2(
 p_user_id uuid,p_order_id uuid,p_refund_id uuid
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 o public.tool_pass_orders_v2%rowtype;
 past public.tool_pass_wallet_refunds_v2%rowtype;
 active_debit bigint;legacy_debit bigint;
 s public.sasi_wallets%rowtype;a public.ai_wallets%rowtype;
 u public.sasi_usd_wallets%rowtype;d public.ai_usd_wallets%rowtype;
 reference text;
 meta jsonb;
begin
 if p_user_id is null or p_order_id is null or p_refund_id is null then
  return jsonb_build_object('ok',false,'error','INVALID_REFUND_REQUEST');end if;
 perform pg_advisory_xact_lock(hashtextextended('toolpass-v2:'||p_user_id::text,0));
 select * into o from public.tool_pass_orders_v2 where request_id=p_order_id for update;
 if not found or o.user_id<>p_user_id then
  return jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND');end if;
 select * into past from public.tool_pass_wallet_refunds_v2
  where order_id=p_order_id or refund_id=p_refund_id for update;
 if found then
  if past.order_id<>p_order_id or past.refund_id<>p_refund_id or past.user_id<>p_user_id then
   return jsonb_build_object('ok',false,'error','REFUND_IDEMPOTENCY_CONFLICT');end if;
  return jsonb_build_object('ok',true,'alreadyRefunded',true,'refundId',p_refund_id,'amountMinor',past.total_minor);
 end if;
 if o.state<>'active' then return jsonb_build_object('ok',false,'error','PASS_NOT_ACTIVE');end if;
 -- The immutable operation must be tied to this exact order, not a mere
 -- matching account or clock interval. Account advisory lock serializes
 -- claims and refunds so the check cannot race a new paid use.
 if exists(select 1 from public.tool_pass_operation_v2
   where pass_order_id=p_order_id and access_kind='pass') then
  return jsonb_build_object('ok',false,'error','PASS_ALREADY_USED');end if;
 if o.active_source_minor+o.legacy_source_minor<>o.amount_minor or
   o.active_refundable_source_minor>o.active_source_minor or
   o.legacy_refundable_source_minor>o.legacy_source_minor then
  return jsonb_build_object('ok',false,'error','CHARGE_PROVENANCE_INVALID');end if;
 reference:='toolpass-v2:'||p_order_id::text;
 if o.currency='CNY' then
  select coalesce(sum(-delta_available),0) into active_debit
   from public.sasi_credit_ledger where user_id=p_user_id and kind='usage_v49' and reference_id=reference;
  select coalesce(sum(-delta_available_fen),0) into legacy_debit
   from public.ai_wallet_ledger where user_id=p_user_id and kind='usage_v49' and reference_id=reference;
 else
  select coalesce(sum(-delta_available_cents),0) into active_debit
   from public.sasi_usd_wallet_ledger where user_id=p_user_id and kind='usage_v49' and reference_id=reference;
  select coalesce(sum(-delta_cents),0) into legacy_debit
   from public.ai_usd_wallet_ledger where user_id=p_user_id and kind='usage_v49' and reference_id=reference;
 end if;
 if active_debit is distinct from o.active_source_minor
   or legacy_debit is distinct from o.legacy_source_minor then
  return jsonb_build_object('ok',false,'error','SOURCE_LEDGER_MISMATCH');end if;
 reference:='toolpass-refund-v2:'||p_refund_id::text;
 meta:=jsonb_build_object('product','tool_pass_v2','orderId',p_order_id,
  'refundId',p_refund_id,'refundedTo','original_wallet_sources',
  'currency',o.currency,'notExternalProviderRefund',true);
 -- Match existing charge lock order: current SASI wallet, then legacy AI.
 if o.currency='CNY' then
  select * into s from public.sasi_wallets where user_id=p_user_id for update;
  select * into a from public.ai_wallets where user_id=p_user_id for update;
  if o.active_source_minor>0 then
   update public.sasi_wallets set
    available_points=available_points+o.active_source_minor,
    refundable_points=refundable_points+o.active_refundable_source_minor,
    updated_at=now() where user_id=p_user_id returning * into s;
   insert into public.sasi_credit_ledger(user_id,kind,delta_available,delta_reserved,
     delta_refundable,available_after,reserved_after,refundable_after,refund_hold_after,reference_id,metadata)
   values(p_user_id,'refund',o.active_source_minor,0,o.active_refundable_source_minor,
     s.available_points,s.reserved_points,s.refundable_points,s.refund_hold_points,reference,meta);
  end if;
  if o.legacy_source_minor>0 then
   update public.ai_wallets set
    available_fen=available_fen+o.legacy_source_minor,
    refundable_fen=refundable_fen+o.legacy_refundable_source_minor,
    updated_at=now() where user_id=p_user_id returning * into a;
   insert into public.ai_wallet_ledger(user_id,kind,delta_available_fen,delta_refundable_fen,
     available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
     bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata)
   values(p_user_id,'tool_pass_refund_v2',o.legacy_source_minor,o.legacy_refundable_source_minor,
     a.available_fen,a.reserved_fen,a.refundable_fen,a.refund_hold_fen,
     a.bonus_available_fen,a.bonus_reserved_fen,a.adjustment_debt_fen,reference,meta);
  end if;
 else
  select * into u from public.sasi_usd_wallets where user_id=p_user_id for update;
  select * into d from public.ai_usd_wallets where user_id=p_user_id for update;
  if o.active_source_minor>0 then
   update public.sasi_usd_wallets set
    available_cents=available_cents+o.active_source_minor,
    refundable_cents=refundable_cents+o.active_refundable_source_minor,
    updated_at=now() where user_id=p_user_id returning * into u;
   insert into public.sasi_usd_wallet_ledger(user_id,kind,
     delta_available_cents,delta_reserved_cents,delta_refundable_cents,
     available_after_cents,reserved_after_cents,refundable_after_cents,refund_hold_after_cents,
     reference_id,metadata)
   values(p_user_id,'tool_pass_refund_v2',o.active_source_minor,0,o.active_refundable_source_minor,
     u.available_cents,u.reserved_cents,u.refundable_cents,u.refund_hold_cents,reference,meta);
  end if;
  if o.legacy_source_minor>0 then
   update public.ai_usd_wallets set
    available_cents=available_cents+o.legacy_source_minor,
    refundable_cents=refundable_cents+o.legacy_refundable_source_minor,
    updated_at=now() where user_id=p_user_id returning * into d;
   insert into public.ai_usd_wallet_ledger(user_id,kind,
     delta_cents,delta_refundable_cents,available_after_cents,refundable_after_cents,
     refund_hold_after_cents,reserved_after_cents,reference_id,metadata)
   values(p_user_id,'tool_pass_refund_v2',o.legacy_source_minor,o.legacy_refundable_source_minor,
     d.available_cents,d.refundable_cents,d.refund_hold_cents,d.reserved_cents,reference,meta);
  end if;
 end if;
 update public.tool_pass_orders_v2 set state='refunded' where request_id=p_order_id;
 insert into public.tool_pass_wallet_refunds_v2(
  refund_id,order_id,user_id,currency,total_minor,active_minor,legacy_minor,
  active_refundable_minor,legacy_refundable_minor)
 values(p_refund_id,p_order_id,p_user_id,o.currency,o.amount_minor,
  o.active_source_minor,o.legacy_source_minor,
  o.active_refundable_source_minor,o.legacy_refundable_source_minor);
 return jsonb_build_object('ok',true,'alreadyRefunded',false,
  'refundId',p_refund_id,'amountMinor',o.amount_minor,'currency',o.currency,
  'destination','original_wallets_only');
end $$;

revoke all on function public.refund_unused_tool_pass_wallet_v2(uuid,uuid,uuid)
 from public,anon,authenticated;
grant execute on function public.refund_unused_tool_pass_wallet_v2(uuid,uuid,uuid) to service_role;
commit;
