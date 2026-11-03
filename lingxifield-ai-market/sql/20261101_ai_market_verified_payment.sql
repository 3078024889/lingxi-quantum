-- 2026-11-01: installed in isolated Supabase private schema; versioned for disaster recovery.
-- Not an HTTP handler. Cryptographically validate the provider payload BEFORE calling.
CREATE OR REPLACE FUNCTION ai_market_private.record_verified_payment(p_order_ref text, p_provider text, p_provider_transaction_ref text, p_provider_event_ref text, p_amount_minor bigint, p_currency text, p_payload_sha256 text, p_verified_at timestamp with time zone)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'ai_market_private'
AS $function$
declare
 order_row ai_market_private.billing_orders%rowtype;
 existing_event ai_market_private.payment_events%rowtype;
 inserted_event_id uuid;
begin
 -- Restricted to service_role after cryptographic provider verification.
 -- This function itself does not authenticate unsigned webhook requests.
 if p_verified_at is null or abs(extract(epoch from (clock_timestamp()-p_verified_at))) > 600 then
   raise exception 'INVALID_VERIFICATION_TIME' using errcode='22023';
 end if;
 if p_provider not in ('paypal','alipay','wechat') or
    p_order_ref is null or length(p_order_ref) < 8 or
    p_provider_transaction_ref is null or length(p_provider_transaction_ref) < 8 or
    p_provider_event_ref is null or length(p_provider_event_ref) < 8 or
    p_payload_sha256 !~ '^[a-f0-9]{64}$' then
   raise exception 'INVALID_PAYMENT_EVIDENCE' using errcode='22023';
 end if;
 select * into order_row from ai_market_private.billing_orders
   where merchant_order_ref=p_order_ref for update;
 if not found then raise exception 'UNKNOWN_ORDER' using errcode='22023'; end if;
 if order_row.provider is distinct from p_provider or
    order_row.currency is distinct from p_currency or
    order_row.amount_minor is distinct from p_amount_minor then
   raise exception 'ORDER_AMOUNT_CURRENCY_PROVIDER_MISMATCH' using errcode='22023';
 end if;
 if order_row.status not in ('created','pending','paid') then
   raise exception 'ORDER_NOT_SETTLEABLE' using errcode='22023';
 end if;
 insert into ai_market_private.payment_events
  (provider,external_event_id,order_id,payload_sha256,signature_verified_at)
 values (p_provider,p_provider_event_ref,order_row.id,p_payload_sha256,p_verified_at)
 on conflict (provider,external_event_id) do nothing
 returning id into inserted_event_id;
 if inserted_event_id is null then
   select * into existing_event from ai_market_private.payment_events
    where provider=p_provider and external_event_id=p_provider_event_ref;
   if existing_event.order_id is distinct from order_row.id or
      existing_event.payload_sha256 is distinct from p_payload_sha256 or
      order_row.status <> 'paid' or
      order_row.provider_payment_ref is distinct from p_provider_transaction_ref then
      raise exception 'REPLAY_EVENT_CONFLICT' using errcode='22023';
   end if;
   return 'duplicate';
 end if;
 if order_row.status='paid' then
   if order_row.provider_payment_ref is distinct from p_provider_transaction_ref then
     raise exception 'PAID_ORDER_TRANSACTION_CONFLICT' using errcode='22023';
   end if;
   update ai_market_private.payment_events
     set processed_at=clock_timestamp(),processing_result='already_paid'
     where id=inserted_event_id;
   return 'already_paid';
 end if;
 update ai_market_private.billing_orders
  set status='paid',provider_payment_ref=p_provider_transaction_ref,
      paid_verified_at=p_verified_at,updated_at=clock_timestamp()
  where id=order_row.id;
 update ai_market_private.payment_events
  set processed_at=clock_timestamp(),processing_result='captured'
  where id=inserted_event_id;
 return 'captured';
end;
$function$
;
revoke all on function ai_market_private.record_verified_payment(text,text,text,text,bigint,text,text,timestamptz) from public,anon,authenticated;
grant execute on function ai_market_private.record_verified_payment(text,text,text,text,bigint,text,text,timestamptz) to service_role;
