-- Harden legacy AI wallet credit RPCs against late callbacks for failed/refunded orders.
-- No historical rows, balances, ledgers, or order states are modified by this migration.

CREATE OR REPLACE FUNCTION public.credit_ai_topup(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
 o public.orders%rowtype;
 v public.ai_wallets%rowtype;
 inviter public.ai_wallets%rowtype;
 ref public.ai_referrals%rowtype;
 amount_fen bigint;
 expected_rmb numeric;
 reward_fen bigint;
 debt_offset bigint;
 inviter_offset bigint;
 net_credit bigint;
 net_reward bigint;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then return pg_catalog.jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); end if;
 if coalesce(o.status,'') not in ('pending','paid') then
   return pg_catalog.jsonb_build_object('ok',false,'error','ORDER_NOT_PAYABLE');
 end if;

 select x.amount_fen,x.amount_rmb into amount_fen,expected_rmb
 from (values
  ('ai-balance-10'::text,1000::bigint,10::numeric),
  ('ai-balance-30'::text,3000::bigint,30::numeric),
  ('ai-balance-50'::text,5000::bigint,50::numeric),
  ('ai-balance-100'::text,10000::bigint,100::numeric),
  ('ai-balance-300'::text,30000::bigint,300::numeric),
  ('ai-balance-500'::text,50000::bigint,500::numeric)
 ) x(product_id,amount_fen,amount_rmb) where x.product_id=o.product_id;

 if amount_fen is null then return pg_catalog.jsonb_build_object('ok',false,'error','INVALID_AI_TOPUP'); end if;
 if o.amount_rmb is null or round(o.amount_rmb,2)<>round(expected_rmb,2) then return pg_catalog.jsonb_build_object('ok',false,'error','AMOUNT_MISMATCH'); end if;
 if exists(select 1 from public.ai_wallet_ledger where kind='topup' and reference_id=p_order_id::text) then
   update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;
   return pg_catalog.jsonb_build_object('ok',true,'alreadyPaid',true);
 end if;

 insert into public.ai_wallets(user_id) values(o.user_id) on conflict do nothing;
 select * into v from public.ai_wallets where user_id=o.user_id for update;
 debt_offset:=least(v.adjustment_debt_fen,amount_fen);
 net_credit:=amount_fen-debt_offset;

 update public.ai_wallets set
   adjustment_debt_fen=adjustment_debt_fen-debt_offset,
   available_fen=available_fen+net_credit,
   refundable_fen=refundable_fen+net_credit,
   lifetime_topup_fen=lifetime_topup_fen+amount_fen,
   balance_basis_fen=available_fen+bonus_available_fen+net_credit,
   updated_at=now()
 where user_id=o.user_id returning * into v;

 insert into public.ai_wallet_ledger(
  user_id,kind,delta_available_fen,delta_refundable_fen,delta_debt_fen,
  available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
  bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
 ) values(
  o.user_id,'topup',net_credit,net_credit,-debt_offset,
  v.available_fen,v.reserved_fen,v.refundable_fen,v.refund_hold_fen,
  v.bonus_available_fen,v.bonus_reserved_fen,v.adjustment_debt_fen,p_order_id::text,
  pg_catalog.jsonb_build_object('productId',o.product_id,'provider',o.provider,'grossFen',amount_fen,'debtOffsetFen',debt_offset)
 );

 update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;

 if amount_fen>=5000 and not exists(select 1 from public.ai_referral_rewards where order_id=p_order_id) then
   select * into ref from public.ai_referrals where referred_user_id=o.user_id;
   if found then
     reward_fen:=floor(amount_fen*0.10);
     insert into public.ai_wallets(user_id) values(ref.inviter_user_id) on conflict do nothing;
     select * into inviter from public.ai_wallets where user_id=ref.inviter_user_id for update;
     inviter_offset:=least(inviter.adjustment_debt_fen,reward_fen);
     net_reward:=reward_fen-inviter_offset;
     update public.ai_wallets set
       adjustment_debt_fen=adjustment_debt_fen-inviter_offset,
       bonus_available_fen=bonus_available_fen+net_reward,
       balance_basis_fen=available_fen+bonus_available_fen+net_reward,
       updated_at=now()
     where user_id=ref.inviter_user_id returning * into inviter;
     insert into public.ai_referral_rewards(order_id,inviter_user_id,referred_user_id,topup_fen,bonus_fen)
     values(p_order_id,ref.inviter_user_id,o.user_id,amount_fen,reward_fen);
     insert into public.ai_wallet_ledger(
      user_id,kind,delta_bonus_available_fen,delta_debt_fen,
      available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
      bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
     ) values(
      ref.inviter_user_id,'referral_bonus',net_reward,-inviter_offset,
      inviter.available_fen,inviter.reserved_fen,inviter.refundable_fen,inviter.refund_hold_fen,
      inviter.bonus_available_fen,inviter.bonus_reserved_fen,inviter.adjustment_debt_fen,p_order_id::text,
      pg_catalog.jsonb_build_object('referredUserId',o.user_id,'topupFen',amount_fen,'rate',0.10,'debtOffsetFen',inviter_offset)
     );
   end if;
 end if;

 return pg_catalog.jsonb_build_object('ok',true,'grossFen',amount_fen,'creditedFen',net_credit,'debtOffsetFen',debt_offset);
end
$function$;

CREATE OR REPLACE FUNCTION public.credit_ai_usd_topup(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
 o public.orders%rowtype;
 amount_cents bigint;
 expected_usd numeric;
 v public.ai_usd_wallets%rowtype;
begin
 select * into o from public.orders where id=p_order_id for update;
 if not found then return pg_catalog.jsonb_build_object('ok',false,'error','ORDER_NOT_FOUND'); end if;
 if coalesce(o.status,'') not in ('pending','paid') then
   return pg_catalog.jsonb_build_object('ok',false,'error','ORDER_NOT_PAYABLE');
 end if;
 if o.provider<>'paypal' then return pg_catalog.jsonb_build_object('ok',false,'error','USD_REQUIRES_PAYPAL'); end if;
 if o.product_id !~ '^ai-usd-balance-(10|20|50|100|300|500|1000|2000|10000)$' then return pg_catalog.jsonb_build_object('ok',false,'error','INVALID_USD_TOPUP'); end if;
 expected_usd:=substring(o.product_id from '([0-9]+)$')::numeric;
 amount_cents:=(expected_usd*100)::bigint;
 if o.amount_usd is null or round(o.amount_usd,2)<>round(expected_usd,2) then return pg_catalog.jsonb_build_object('ok',false,'error','AMOUNT_MISMATCH'); end if;
 if exists(select 1 from public.ai_usd_wallet_ledger where kind='topup' and reference_id=p_order_id::text) then
  update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;
  return pg_catalog.jsonb_build_object('ok',true,'alreadyPaid',true);
 end if;
 insert into public.ai_usd_wallets(user_id) values(o.user_id) on conflict do nothing;
 update public.ai_usd_wallets set
  available_cents=available_cents+amount_cents,
  refundable_cents=refundable_cents+amount_cents,
  lifetime_topup_cents=lifetime_topup_cents+amount_cents,
  updated_at=now()
 where user_id=o.user_id returning * into v;
 insert into public.ai_usd_wallet_ledger(user_id,kind,delta_cents,available_after_cents,reference_id,metadata)
 values(o.user_id,'topup',amount_cents,v.available_cents,p_order_id::text,pg_catalog.jsonb_build_object('provider','paypal','currency','USD','productId',o.product_id));
 update public.orders set status='paid',paid_at=coalesce(paid_at,now()) where id=p_order_id;
 return pg_catalog.jsonb_build_object('ok',true,'amountCents',amount_cents,'availableCents',v.available_cents);
end
$function$;

REVOKE EXECUTE ON FUNCTION public.credit_ai_topup(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_ai_usd_topup(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_ai_topup(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_ai_usd_topup(uuid) TO service_role;
