-- AI Market independent payment settlement: staging until audited merchant activation.
-- Requires 20261029_ai_market_vendor_f.sql and 20261029_ai_market_payment_ledger_h.sql.
-- Checkout is NOT activated by applying this migration.
-- Only a trusted server that has independently verified the provider's signed callback
-- and authoritative order query may call these functions using the service_role.
-- Do not expose these functions to anon/authenticated users.
create or replace function public.ai_market_record_verified_payment(
 p_order_id uuid,p_provider text,p_event_id text,p_transaction_id text,
 p_currency text,p_amount_minor bigint,p_signature_verified_at timestamptz,p_settled_at timestamptz
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_order public.ai_market_sponsored_orders%rowtype;v_prior public.ai_market_payment_events%rowtype;
begin
 if p_provider not in ('alipay','wechat','paypal') or
    p_order_id is null or p_event_id is null or length(p_event_id) not between 6 and 200 or
    p_transaction_id is null or length(p_transaction_id) not between 6 and 200 or
    p_currency not in ('USD','CNY') or p_amount_minor is null or p_amount_minor<=0 or
    p_signature_verified_at is null or p_signature_verified_at>now()+interval '5 minutes' or
    p_settled_at is null or p_settled_at>now()+interval '5 minutes' then
  raise exception 'INVALID_SETTLEMENT' using errcode='22023';
 end if;
 if (p_provider='paypal' and p_currency<>'USD') or (p_provider in ('alipay','wechat') and p_currency<>'CNY') then
  raise exception 'PROVIDER_CURRENCY_MISMATCH' using errcode='22023';
 end if;
 select * into v_order from public.ai_market_sponsored_orders where id=p_order_id for update;
 if not found then raise exception 'ORDER_NOT_FOUND' using errcode='P0002';end if;
 if v_order.provider is distinct from p_provider or v_order.currency<>p_currency or
    (v_order.nominal_amount*100)::bigint<>p_amount_minor then
  raise exception 'ORDER_PROVIDER_OR_AMOUNT_MISMATCH' using errcode='22023';
 end if;
 select * into v_prior from public.ai_market_payment_events
 where provider=p_provider and provider_event_id=p_event_id;
 if found then
  if v_prior.order_id=p_order_id and v_prior.provider_transaction_id=p_transaction_id
      and v_prior.currency=p_currency and v_prior.amount_minor=p_amount_minor then
   return jsonb_build_object('ok',true,'duplicate',true,'orderId',p_order_id);
  end if;
  raise exception 'PAYMENT_EVENT_COLLISION' using errcode='23505';
 end if;
 if v_order.status<>'pending_payment' then raise exception 'ORDER_NOT_PAYABLE' using errcode='22023';end if;
 insert into public.ai_market_payment_events
 (provider,provider_event_id,provider_transaction_id,order_id,currency,amount_minor,signature_verified_at,settled_at)
 values(p_provider,p_event_id,p_transaction_id,p_order_id,p_currency,p_amount_minor,p_signature_verified_at,p_settled_at);
 update public.ai_market_sponsored_orders set status='paid',paid_at=p_settled_at
 where id=p_order_id and status='pending_payment';
 -- No automatic promotion activation: publisher identity, content review, and disclosure are separate.
 return jsonb_build_object('ok',true,'duplicate',false,'orderId',p_order_id,'status','paid_pending_review');
end;$$;

create or replace function public.ai_market_record_verified_refund(
 p_payment_event_id bigint,p_provider_refund_id text,p_currency text,p_amount_minor bigint,p_verified_at timestamptz
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare v_event public.ai_market_payment_events%rowtype;v_order public.ai_market_sponsored_orders%rowtype;
 v_refunded bigint;v_prior public.ai_market_payment_refunds%rowtype;
begin
 if p_payment_event_id is null or p_provider_refund_id is null or length(p_provider_refund_id) not between 6 and 200 or
    p_currency not in ('USD','CNY') or p_amount_minor is null or p_amount_minor<=0 or
    p_verified_at is null or p_verified_at>now()+interval '5 minutes' then
  raise exception 'INVALID_REFUND' using errcode='22023';
 end if;
 select * into v_event from public.ai_market_payment_events where id=p_payment_event_id;
 if not found then raise exception 'PAYMENT_NOT_FOUND' using errcode='P0002';end if;
 select * into v_order from public.ai_market_sponsored_orders where id=v_event.order_id for update;
 if not found or v_event.currency<>p_currency then raise exception 'REFUND_CURRENCY_MISMATCH' using errcode='22023';end if;
 select * into v_prior from public.ai_market_payment_refunds
 where payment_event_id=p_payment_event_id and provider_refund_id=p_provider_refund_id;
 if found then
  if v_prior.amount_minor=p_amount_minor and v_prior.currency=p_currency then
   return jsonb_build_object('ok',true,'duplicate',true,'orderId',v_order.id);
  end if;
  raise exception 'REFUND_REFERENCE_COLLISION' using errcode='23505';
 end if;
 select coalesce(sum(amount_minor),0) into v_refunded from public.ai_market_payment_refunds where payment_event_id=p_payment_event_id;
 if v_refunded+p_amount_minor>v_event.amount_minor then
  raise exception 'REFUND_EXCEEDS_CAPTURE' using errcode='22023';
 end if;
 insert into public.ai_market_payment_refunds(payment_event_id,provider_refund_id,currency,amount_minor,verified_at)
 values(p_payment_event_id,p_provider_refund_id,p_currency,p_amount_minor,p_verified_at);
 if v_refunded+p_amount_minor=v_event.amount_minor then
  update public.ai_market_sponsored_orders set status='refunded' where id=v_order.id and status in ('paid','active','expired');
  -- Staff must also reconcile/withdraw any sponsored disclosure in the affected time window.
 end if;
 return jsonb_build_object('ok',true,'duplicate',false,'orderId',v_order.id,'fullRefund',v_refunded+p_amount_minor=v_event.amount_minor);
end;$$;

revoke all on function public.ai_market_record_verified_payment(uuid,text,text,text,text,bigint,timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function public.ai_market_record_verified_refund(bigint,text,text,bigint,timestamptz) from public,anon,authenticated;
grant execute on function public.ai_market_record_verified_payment(uuid,text,text,text,text,bigint,timestamptz,timestamptz) to service_role;
grant execute on function public.ai_market_record_verified_refund(bigint,text,text,bigint,timestamptz) to service_role;
