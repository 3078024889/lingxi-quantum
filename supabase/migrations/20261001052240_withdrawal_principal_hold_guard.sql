-- Reserve only principal not already held; include legacy refunds in order caps.
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
  legacy_minor bigint;
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

  -- Earlier requests are still part of the same original payment limit.
  select coalesce(sum(amount_fen),0) into legacy_minor from public.ai_refund_requests
  where order_id=p_order_id and status in ('requested','approved','completed');
  if currency_code='CNY' then
    already_minor:=already_minor+legacy_minor;
    already_provider_minor:=already_provider_minor+case when provider_currency_code='CNY' then legacy_minor else round(legacy_minor::numeric*o.amount_usd/o.amount_rmb)::bigint end;
  end if;
  if already_minor+p_amount_minor>topup_minor then
    return jsonb_build_object('ok',false,'error','ORDER_REFUND_LIMIT');
  end if;
  if already_provider_minor+provider_amount_minor>provider_total_minor then
    return jsonb_build_object('ok',false,'error','PROVIDER_REFUND_LIMIT');
  end if;

  if v_wallet_kind='ai_cny' then
    select * into aiw from public.ai_wallets where user_id=p_user_id for update;
    if not found or aiw.available_fen<p_amount_minor or aiw.refundable_fen-aiw.refund_hold_fen<p_amount_minor then
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
    if not found or su.available_points<p_amount_minor or su.refundable_points-su.refund_hold_points<p_amount_minor then
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
    if not found or au.available_cents<p_amount_minor or au.refundable_cents-au.refund_hold_cents<p_amount_minor then
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
    if not found or ssu.available_cents<p_amount_minor or ssu.refundable_cents-ssu.refund_hold_cents<p_amount_minor then
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

