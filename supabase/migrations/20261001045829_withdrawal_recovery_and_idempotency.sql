-- Fix verified variable/column collisions; no balances are changed by this migration.
-- Preserve every existing ledger kind and add the three withdrawal events.
ALTER TABLE public.ai_wallet_ledger DROP CONSTRAINT ai_wallet_ledger_kind_check;
ALTER TABLE public.ai_wallet_ledger ADD CONSTRAINT ai_wallet_ledger_kind_check CHECK(kind IN ('topup','reserve','settle','release','referral_bonus','refund_hold','refund_release','refund_complete','topup_reversal','referral_reversal','debt_offset','withdrawal_hold','withdrawal_release','withdrawal_complete'));
ALTER TABLE public.sasi_credit_ledger DROP CONSTRAINT sasi_credit_ledger_kind_check;
ALTER TABLE public.sasi_credit_ledger ADD CONSTRAINT sasi_credit_ledger_kind_check CHECK(kind IN ('topup','reserve','settle','release','refund','adjustment','withdrawal_hold','withdrawal_release','withdrawal_complete'));
CREATE OR REPLACE FUNCTION public.request_balance_withdrawal(p_user_id uuid, p_order_id uuid, p_amount_minor bigint, p_note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  o public.orders%rowtype;
  v_wallet_kind text;
  currency_code text;
  provider_currency_code text;
  provider_amount_minor bigint;
  topup_minor bigint;
  already_minor bigint;
  already_provider_minor bigint;
  provider_total_minor bigint;
  wid uuid:=gen_random_uuid();
  aiw public.ai_wallets%rowtype;
  su public.sasi_wallets%rowtype;
  au public.ai_usd_wallets%rowtype;
  ssu public.sasi_usd_wallets%rowtype;
begin
  if p_amount_minor<=0 then return jsonb_build_object('ok',false,'error','INVALID_AMOUNT'); end if;

  select * into o from public.orders
  where id=p_order_id and user_id=p_user_id
  for update;
  if not found or o.status<>'paid' then
    return jsonb_build_object('ok',false,'error','ORDER_NOT_REFUNDABLE');
  end if;

  if o.product_id like 'ai-balance-%' then
    v_wallet_kind:='ai_cny'; currency_code:='CNY';
    select greatest(0,delta_available_fen) into topup_minor
    from public.ai_wallet_ledger
    where user_id=p_user_id and kind='topup' and reference_id=p_order_id::text
    order by created_at asc limit 1;
  elsif o.product_id like 'sasi-balance-%' or o.product_id like 'sasi-credit-%' then
    v_wallet_kind:='sasi_cny'; currency_code:='CNY';
    select greatest(0,delta_available) into topup_minor
    from public.sasi_credit_ledger
    where user_id=p_user_id and kind='topup' and reference_id=p_order_id::text
    order by created_at asc limit 1;
  elsif o.product_id like 'ai-usd-balance-%' then
    v_wallet_kind:='ai_usd'; currency_code:='USD';
    select greatest(0,delta_cents) into topup_minor
    from public.ai_usd_wallet_ledger
    where user_id=p_user_id and kind='topup' and reference_id=p_order_id::text
    order by created_at asc limit 1;
  elsif o.product_id like 'sasi-usd-balance-%' then
    v_wallet_kind:='sasi_usd'; currency_code:='USD';
    select greatest(0,delta_available_cents) into topup_minor
    from public.sasi_usd_wallet_ledger
    where user_id=p_user_id and kind='topup' and reference_id=p_order_id::text
    order by created_at asc limit 1;
  else
    return jsonb_build_object('ok',false,'error','NOT_BALANCE_TOPUP');
  end if;

  if topup_minor is null or topup_minor<=0 then
    return jsonb_build_object('ok',false,'error','TOPUP_LEDGER_NOT_FOUND');
  end if;

  if currency_code='USD' then
    if o.provider<>'paypal' then
      return jsonb_build_object('ok',false,'error','USD_PROVIDER_UNSUPPORTED');
    end if;
    provider_currency_code:='USD';
    provider_amount_minor:=p_amount_minor;
    provider_total_minor:=round(coalesce(o.amount_usd,0)*100)::bigint;
  else
    if o.provider in ('wechat','alipay') then
      provider_currency_code:='CNY';
      provider_amount_minor:=p_amount_minor;
      provider_total_minor:=round(coalesce(o.amount_rmb,0)*100)::bigint;
    elsif o.provider='paypal' then
      if coalesce(o.amount_usd,0)<=0 or coalesce(o.amount_rmb,0)<=0 then
        return jsonb_build_object('ok',false,'error','PAYPAL_REFUND_RATE_MISSING');
      end if;
      provider_currency_code:='USD';
      provider_amount_minor:=round(p_amount_minor::numeric * o.amount_usd / o.amount_rmb)::bigint;
      provider_total_minor:=round(o.amount_usd*100)::bigint;
    else
      return jsonb_build_object('ok',false,'error','CNY_PROVIDER_UNSUPPORTED');
    end if;
  end if;

  if provider_amount_minor<=0 or provider_total_minor<=0 then
    return jsonb_build_object('ok',false,'error','INVALID_PROVIDER_REFUND_AMOUNT');
  end if;

  select coalesce(sum(amount_minor),0),
         coalesce(sum(balance_withdrawals.provider_amount_minor),0)
  into already_minor,already_provider_minor
  from public.balance_withdrawals
  where order_id=p_order_id and status in ('requested','processing','completed');

  if already_minor+p_amount_minor>topup_minor then
    return jsonb_build_object('ok',false,'error','ORDER_REFUND_LIMIT');
  end if;
  if already_provider_minor+provider_amount_minor>provider_total_minor then
    return jsonb_build_object('ok',false,'error','PROVIDER_REFUND_LIMIT');
  end if;

  if v_wallet_kind='ai_cny' then
    select * into aiw from public.ai_wallets where user_id=p_user_id for update;
    if not found or aiw.available_fen<p_amount_minor or aiw.refundable_fen<p_amount_minor then
      return jsonb_build_object('ok',false,'error','INSUFFICIENT_UNUSED_PRINCIPAL');
    end if;
    update public.ai_wallets
    set available_fen=available_fen-p_amount_minor,
        refund_hold_fen=refund_hold_fen+p_amount_minor,
        updated_at=now()
    where user_id=p_user_id returning * into aiw;
    insert into public.ai_wallet_ledger(
      user_id,kind,delta_available_fen,delta_refund_hold_fen,
      available_after_fen,reserved_after_fen,refundable_after_fen,refund_hold_after_fen,
      bonus_available_after_fen,bonus_reserved_after_fen,debt_after_fen,reference_id,metadata
    ) values(
      p_user_id,'withdrawal_hold',-p_amount_minor,p_amount_minor,
      aiw.available_fen,aiw.reserved_fen,aiw.refundable_fen,aiw.refund_hold_fen,
      aiw.bonus_available_fen,aiw.bonus_reserved_fen,aiw.adjustment_debt_fen,wid::text,
      jsonb_build_object('orderId',p_order_id,'currency','CNY','providerCurrency',provider_currency_code,'providerAmountMinor',provider_amount_minor)
    );
  elsif v_wallet_kind='sasi_cny' then
    select * into su from public.sasi_wallets where user_id=p_user_id for update;
    if not found or su.available_points<p_amount_minor or su.refundable_points<p_amount_minor then
      return jsonb_build_object('ok',false,'error','INSUFFICIENT_UNUSED_PRINCIPAL');
    end if;
    update public.sasi_wallets
    set available_points=available_points-p_amount_minor,
        refund_hold_points=refund_hold_points+p_amount_minor,
        updated_at=now()
    where user_id=p_user_id returning * into su;
    insert into public.sasi_credit_ledger(
      user_id,kind,delta_available,delta_reserved,delta_refundable,delta_refund_hold,
      available_after,reserved_after,refundable_after,refund_hold_after,reference_id,metadata
    ) values(
      p_user_id,'withdrawal_hold',-p_amount_minor,0,0,p_amount_minor,
      su.available_points,su.reserved_points,su.refundable_points,su.refund_hold_points,wid::text,
      jsonb_build_object('orderId',p_order_id,'currency','CNY','providerCurrency',provider_currency_code,'providerAmountMinor',provider_amount_minor)
    );
  elsif v_wallet_kind='ai_usd' then
    select * into au from public.ai_usd_wallets where user_id=p_user_id for update;
    if not found or au.available_cents<p_amount_minor or au.refundable_cents<p_amount_minor then
      return jsonb_build_object('ok',false,'error','INSUFFICIENT_UNUSED_PRINCIPAL');
    end if;
    update public.ai_usd_wallets
    set available_cents=available_cents-p_amount_minor,
        refund_hold_cents=refund_hold_cents+p_amount_minor,
        updated_at=now()
    where user_id=p_user_id returning * into au;
    insert into public.ai_usd_wallet_ledger(
      user_id,kind,delta_cents,delta_refundable_cents,delta_refund_hold_cents,
      available_after_cents,refundable_after_cents,refund_hold_after_cents,reference_id,metadata
    ) values(
      p_user_id,'withdrawal_hold',-p_amount_minor,0,p_amount_minor,
      au.available_cents,au.refundable_cents,au.refund_hold_cents,wid::text,
      jsonb_build_object('orderId',p_order_id,'currency','USD','providerCurrency','USD','providerAmountMinor',provider_amount_minor)
    );
  elsif v_wallet_kind='sasi_usd' then
    select * into ssu from public.sasi_usd_wallets where user_id=p_user_id for update;
    if not found or ssu.available_cents<p_amount_minor or ssu.refundable_cents<p_amount_minor then
      return jsonb_build_object('ok',false,'error','INSUFFICIENT_UNUSED_PRINCIPAL');
    end if;
    update public.sasi_usd_wallets
    set available_cents=available_cents-p_amount_minor,
        refund_hold_cents=refund_hold_cents+p_amount_minor,
        updated_at=now()
    where user_id=p_user_id returning * into ssu;
    insert into public.sasi_usd_wallet_ledger(
      user_id,kind,delta_available_cents,delta_reserved_cents,delta_refundable_cents,delta_refund_hold_cents,
      available_after_cents,reserved_after_cents,refundable_after_cents,refund_hold_after_cents,reference_id,metadata
    ) values(
      p_user_id,'withdrawal_hold',-p_amount_minor,0,0,p_amount_minor,
      ssu.available_cents,ssu.reserved_cents,ssu.refundable_cents,ssu.refund_hold_cents,wid::text,
      jsonb_build_object('orderId',p_order_id,'currency','USD','providerCurrency','USD','providerAmountMinor',provider_amount_minor)
    );
  end if;

  insert into public.balance_withdrawals(
    id,user_id,order_id,wallet_kind,provider,currency,provider_currency,
    amount_minor,provider_amount_minor,status,note
  ) values(
    wid,p_user_id,p_order_id,v_wallet_kind,o.provider,currency_code,provider_currency_code,
    p_amount_minor,provider_amount_minor,'requested',left(coalesce(p_note,''),500)
  );

  return jsonb_build_object(
    'ok',true,'withdrawalId',wid,'walletKind',v_wallet_kind,'provider',o.provider,
    'currency',currency_code,'amountMinor',p_amount_minor,
    'providerCurrency',provider_currency_code,'providerAmountMinor',provider_amount_minor
  );
exception when unique_violation then
  return jsonb_build_object('ok',false,'error','ACTIVE_REQUEST_EXISTS');
end $function$;

REVOKE ALL ON FUNCTION public.request_balance_withdrawal(uuid,uuid,bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.request_balance_withdrawal(uuid,uuid,bigint,text) TO service_role;

ALTER TABLE public.balance_withdrawals ADD COLUMN IF NOT EXISTS client_request_id uuid;
ALTER TABLE public.balance_withdrawals ADD COLUMN IF NOT EXISTS legacy_refund_id uuid REFERENCES public.ai_refund_requests(id);
CREATE UNIQUE INDEX IF NOT EXISTS balance_withdrawals_client_request_unique ON public.balance_withdrawals(user_id,client_request_id) WHERE client_request_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS balance_withdrawals_legacy_unique ON public.balance_withdrawals(legacy_refund_id) WHERE legacy_refund_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.request_balance_withdrawal_v2(p_user_id uuid,p_order_id uuid,p_amount_minor bigint,p_request_id uuid,p_note text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE previous public.balance_withdrawals%rowtype; result jsonb;
BEGIN
 IF p_user_id IS NULL OR p_request_id IS NULL OR p_amount_minor IS NULL OR p_amount_minor<=0 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_AMOUNT'); END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text||':'||p_request_id::text,0));
 SELECT * INTO previous FROM public.balance_withdrawals WHERE user_id=p_user_id AND client_request_id=p_request_id;
 IF FOUND THEN
  IF previous.order_id<>p_order_id OR previous.amount_minor<>p_amount_minor THEN RETURN jsonb_build_object('ok',false,'error','REQUEST_CONFLICT');END IF;
  RETURN jsonb_build_object('ok',true,'withdrawalId',previous.id,'status',previous.status,'replayed',true,'providerCurrency',previous.provider_currency,'providerAmountMinor',previous.provider_amount_minor);
 END IF;
 result:=public.request_balance_withdrawal(p_user_id,p_order_id,p_amount_minor,p_note);
 IF (result->>'ok')::boolean THEN UPDATE public.balance_withdrawals SET client_request_id=p_request_id WHERE id=(result->>'withdrawalId')::uuid; END IF;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.request_balance_withdrawal_v2(uuid,uuid,bigint,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.request_balance_withdrawal_v2(uuid,uuid,bigint,uuid,text) TO service_role;

-- Release old hold and reserve the new request in ONE transaction. A failed
-- migration rolls both operations back, preserving the old application.
CREATE OR REPLACE FUNCTION public.migrate_balance_refund_v2(p_user_id uuid,p_legacy_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE old public.ai_refund_requests%rowtype; previous public.balance_withdrawals%rowtype; released jsonb; result jsonb;
BEGIN
 SELECT * INTO old FROM public.ai_refund_requests WHERE id=p_legacy_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','REQUEST_NOT_FOUND');END IF;
 SELECT * INTO previous FROM public.balance_withdrawals WHERE legacy_refund_id=p_legacy_id AND user_id=p_user_id;
 IF FOUND THEN RETURN jsonb_build_object('ok',true,'withdrawalId',previous.id,'status',previous.status,'replayed',true,'providerCurrency',previous.provider_currency,'providerAmountMinor',previous.provider_amount_minor); END IF;
 IF old.status NOT IN ('requested','approved') THEN RETURN jsonb_build_object('ok',false,'error','REQUEST_ALREADY_FINAL');END IF;
 released:=public.resolve_ai_refund(p_legacy_id,'rejected',NULL,'Transferred to original-payment refund');
 IF coalesce((released->>'ok')::boolean,false) IS NOT TRUE THEN RAISE EXCEPTION 'LEGACY_RELEASE_FAILED';END IF;
 result:=public.request_balance_withdrawal_v2(p_user_id,old.order_id,old.amount_fen,p_legacy_id,'Migrated legacy refund');
 IF coalesce((result->>'ok')::boolean,false) IS NOT TRUE THEN RAISE EXCEPTION 'MIGRATION_REQUEST_FAILED: %',result->>'error';END IF;
 UPDATE public.balance_withdrawals SET legacy_refund_id=p_legacy_id WHERE id=(result->>'withdrawalId')::uuid;
 RETURN result;
EXCEPTION WHEN OTHERS THEN
 RETURN jsonb_build_object('ok',false,'error','LEGACY_MIGRATION_UNAVAILABLE');
END $$;
REVOKE ALL ON FUNCTION public.migrate_balance_refund_v2(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_balance_refund_v2(uuid,uuid) TO service_role;
