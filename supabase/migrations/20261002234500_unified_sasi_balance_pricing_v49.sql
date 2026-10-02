begin;

-- V49: one active SASI balance system. CNY and USD remain separate price books/wallet currencies.
-- Historical AI wallet tables are intentionally not dropped here because old paid orders/refunds must remain auditable.
-- New sales and new SASI usage must not credit or consume those legacy wallets.

create unique index if not exists sasi_credit_ledger_usage_reference_uidx
  on public.sasi_credit_ledger(reference_id)
  where kind='usage_v49' and reference_id is not null;
create unique index if not exists sasi_usd_wallet_ledger_usage_reference_uidx
  on public.sasi_usd_wallet_ledger(reference_id)
  where kind='usage_v49' and reference_id is not null;

create or replace function public.charge_sasi_usage_v49(
  p_user_id uuid,
  p_currency text,
  p_amount_minor bigint,
  p_reference_id text,
  p_kind text,
  p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  w public.sasi_wallets%rowtype;
  u public.sasi_usd_wallets%rowtype;
  already boolean;
begin
  if p_user_id is null or p_amount_minor<=0 or coalesce(length(p_reference_id),0)<3 then
    return jsonb_build_object('ok',false,'error','INVALID_USAGE_CHARGE');
  end if;
  if upper(p_currency)='USD' then
    select exists(select 1 from public.sasi_usd_wallet_ledger where kind='usage_v49' and reference_id=p_reference_id) into already;
    if already then return jsonb_build_object('ok',true,'alreadyCharged',true,'chargedMinor',p_amount_minor); end if;
    insert into public.sasi_usd_wallets(user_id) values(p_user_id) on conflict do nothing;
    select * into u from public.sasi_usd_wallets where user_id=p_user_id for update;
    if u.available_cents<p_amount_minor then return jsonb_build_object('ok',false,'error','SASI_BALANCE_INSUFFICIENT','availableMinor',u.available_cents,'requiredMinor',p_amount_minor); end if;
    update public.sasi_usd_wallets
      set available_cents=available_cents-p_amount_minor,
          refundable_cents=greatest(0,coalesce(refundable_cents,0)-p_amount_minor),updated_at=now()
      where user_id=p_user_id returning * into u;
    insert into public.sasi_usd_wallet_ledger(user_id,kind,delta_available_cents,delta_reserved_cents,available_after_cents,reserved_after_cents,reference_id,metadata)
      values(p_user_id,'usage_v49',-p_amount_minor,0,u.available_cents,u.reserved_cents,p_reference_id,coalesce(p_metadata,'{}'::jsonb)||jsonb_build_object('usageKind',left(coalesce(p_kind,'sasi'),80),'pricingVersion','2026-10-02-v49'));
    return jsonb_build_object('ok',true,'alreadyCharged',false,'chargedMinor',p_amount_minor,'availableMinor',u.available_cents);
  elsif upper(p_currency)='CNY' then
    select exists(select 1 from public.sasi_credit_ledger where kind='usage_v49' and reference_id=p_reference_id) into already;
    if already then return jsonb_build_object('ok',true,'alreadyCharged',true,'chargedMinor',p_amount_minor); end if;
    insert into public.sasi_wallets(user_id) values(p_user_id) on conflict do nothing;
    select * into w from public.sasi_wallets where user_id=p_user_id for update;
    if w.available_points<p_amount_minor then return jsonb_build_object('ok',false,'error','SASI_BALANCE_INSUFFICIENT','availableMinor',w.available_points,'requiredMinor',p_amount_minor); end if;
    update public.sasi_wallets
      set available_points=available_points-p_amount_minor,
          refundable_points=greatest(0,coalesce(refundable_points,0)-p_amount_minor),updated_at=now()
      where user_id=p_user_id returning * into w;
    insert into public.sasi_credit_ledger(user_id,kind,delta_available,delta_reserved,available_after,reserved_after,reference_id,metadata)
      values(p_user_id,'usage_v49',-p_amount_minor,0,w.available_points,w.reserved_points,p_reference_id,coalesce(p_metadata,'{}'::jsonb)||jsonb_build_object('usageKind',left(coalesce(p_kind,'sasi'),80),'pricingVersion','2026-10-02-v49'));
    return jsonb_build_object('ok',true,'alreadyCharged',false,'chargedMinor',p_amount_minor,'availableMinor',w.available_points);
  end if;
  return jsonb_build_object('ok',false,'error','UNSUPPORTED_CURRENCY');
exception when unique_violation then
  return jsonb_build_object('ok',true,'alreadyCharged',true,'chargedMinor',p_amount_minor);
end $$;

revoke all on function public.charge_sasi_usage_v49(uuid,text,bigint,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.charge_sasi_usage_v49(uuid,text,bigint,text,text,jsonb) to service_role;

create or replace function public.credit_sasi_topup(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare o public.orders%rowtype; amount_minor bigint; expected_rmb numeric; w public.sasi_wallets%rowtype;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then return jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); end if;
 if o.product_id !~ '^sasi-balance-(10|20|50|100|200|500|1000|2000|10000)$' and o.product_id !~ '^sasi-balance-custom-[0-9]{1,5}$' then return jsonb_build_object('ok',false,'error','INVALID_SASI_TOPUP'); end if;
 expected_rmb:=substring(o.product_id from '([0-9]+)$')::numeric;
 if expected_rmb<10 or expected_rmb>10000 or round(o.amount_rmb,2)<>round(expected_rmb,2) then return jsonb_build_object('ok',false,'error','AMOUNT_MISMATCH'); end if;
 amount_minor:=(expected_rmb*100)::bigint;
 if exists(select 1 from public.sasi_credit_ledger where kind='topup' and reference_id=p_order_id::text) then update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id; return jsonb_build_object('ok',true,'alreadyPaid',true); end if;
 insert into public.sasi_wallets(user_id) values(o.user_id) on conflict do nothing;
 update public.sasi_wallets set available_points=available_points+amount_minor,refundable_points=coalesce(refundable_points,0)+amount_minor,updated_at=now() where user_id=o.user_id returning * into w;
 insert into public.sasi_credit_ledger(user_id,kind,delta_available,delta_reserved,available_after,reserved_after,reference_id,metadata) values(o.user_id,'topup',amount_minor,0,w.available_points,w.reserved_points,p_order_id::text,jsonb_build_object('provider',o.provider,'currency','CNY','productId',o.product_id,'pricingVersion','2026-10-02-v49'));
 update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;
 return jsonb_build_object('ok',true,'amountMinor',amount_minor,'availableMinor',w.available_points);
end $$;
revoke all on function public.credit_sasi_topup(uuid) from public,anon,authenticated;
grant execute on function public.credit_sasi_topup(uuid) to service_role;

commit;
