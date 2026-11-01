-- Atomic, idempotent refund settlement for the isolated AI-market ledger.
-- Provider signature verification happens in the trusted Node.js adapter first.
-- This RPC is service_role-only and never grants client-side refund authority.

CREATE INDEX IF NOT EXISTS payment_refunds_order_status
  ON ai_market_private.payment_refunds(order_id, status)
  WHERE status='refunded';

CREATE OR REPLACE FUNCTION ai_market_private.record_verified_refund(
  p_order_ref text,
  p_provider text,
  p_provider_refund_ref text,
  p_provider_event_ref text,
  p_amount_minor bigint,
  p_currency text,
  p_payload_sha256 text,
  p_verified_at timestamptz
) RETURNS text
LANGUAGE plpgsql
SET search_path TO 'pg_catalog', 'ai_market_private'
AS $function$
DECLARE
  v_order ai_market_private.billing_orders%rowtype;
  v_event ai_market_private.payment_events%rowtype;
  v_existing_refund ai_market_private.payment_refunds%rowtype;
  v_event_id uuid;
  v_refund_id uuid;
  v_refunded_before bigint;
  v_refunded_after bigint;
BEGIN
  IF current_setting('request.jwt.claim.role', true) IS DISTINCT FROM 'service_role' THEN
    RAISE EXCEPTION 'SERVICE_ROLE_REQUIRED' USING ERRCODE='42501';
  END IF;

  IF p_verified_at IS NULL
     OR abs(extract(epoch FROM (clock_timestamp()-p_verified_at))) > 600 THEN
    RAISE EXCEPTION 'INVALID_VERIFICATION_TIME' USING ERRCODE='22023';
  END IF;

  IF p_provider NOT IN ('paypal','alipay','wechat')
     OR p_order_ref IS NULL OR length(p_order_ref) NOT BETWEEN 8 AND 120
     OR p_provider_refund_ref IS NULL OR length(p_provider_refund_ref) NOT BETWEEN 8 AND 200
     OR p_provider_event_ref IS NULL OR length(p_provider_event_ref) NOT BETWEEN 8 AND 200
     OR p_amount_minor IS NULL OR p_amount_minor <= 0
     OR p_currency NOT IN ('CNY','USD')
     OR p_payload_sha256 IS NULL OR p_payload_sha256 !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'INVALID_REFUND_EVIDENCE' USING ERRCODE='22023';
  END IF;

  -- Serialize every refund for this order. This prevents two concurrent
  -- partial refunds from each observing the same remaining refundable balance.
  SELECT * INTO v_order
  FROM ai_market_private.billing_orders
  WHERE merchant_order_ref=p_order_ref
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'UNKNOWN_ORDER' USING ERRCODE='22023';
  END IF;

  IF v_order.provider IS DISTINCT FROM p_provider
     OR v_order.currency IS DISTINCT FROM p_currency THEN
    RAISE EXCEPTION 'ORDER_PROVIDER_CURRENCY_MISMATCH' USING ERRCODE='22023';
  END IF;

  IF v_order.status NOT IN ('paid','partially_refunded')
     OR v_order.paid_verified_at IS NULL
     OR v_order.provider_payment_ref IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_REFUNDABLE' USING ERRCODE='22023';
  END IF;

  INSERT INTO ai_market_private.payment_events
    (provider,external_event_id,order_id,payload_sha256,signature_verified_at)
  VALUES
    (p_provider,p_provider_event_ref,v_order.id,p_payload_sha256,p_verified_at)
  ON CONFLICT (provider,external_event_id) DO NOTHING
  RETURNING id INTO v_event_id;

  IF v_event_id IS NULL THEN
    SELECT * INTO v_event
    FROM ai_market_private.payment_events
    WHERE provider=p_provider AND external_event_id=p_provider_event_ref;

    SELECT * INTO v_existing_refund
    FROM ai_market_private.payment_refunds
    WHERE provider=p_provider AND provider_refund_ref=p_provider_refund_ref;

    IF v_event.order_id IS DISTINCT FROM v_order.id
       OR v_event.payload_sha256 IS DISTINCT FROM p_payload_sha256
       OR v_event.processing_result IS DISTINCT FROM 'refund_captured'
       OR v_existing_refund.id IS NULL
       OR v_existing_refund.order_id IS DISTINCT FROM v_order.id
       OR v_existing_refund.refund_amount_minor IS DISTINCT FROM p_amount_minor
       OR v_existing_refund.status IS DISTINCT FROM 'refunded' THEN
      RAISE EXCEPTION 'REPLAY_EVENT_CONFLICT' USING ERRCODE='22023';
    END IF;

    RETURN 'duplicate';
  END IF;

  SELECT coalesce(sum(refund_amount_minor),0)
  INTO v_refunded_before
  FROM ai_market_private.payment_refunds
  WHERE order_id=v_order.id AND status='refunded';

  IF v_refunded_before + p_amount_minor > v_order.amount_minor THEN
    RAISE EXCEPTION 'REFUND_EXCEEDS_PAID_AMOUNT' USING ERRCODE='22023';
  END IF;

  INSERT INTO ai_market_private.payment_refunds
    (order_id,provider,provider_refund_ref,refund_amount_minor,status,refunded_verified_at)
  VALUES
    (v_order.id,p_provider,p_provider_refund_ref,p_amount_minor,'refunded',p_verified_at)
  ON CONFLICT (provider,provider_refund_ref) DO NOTHING
  RETURNING id INTO v_refund_id;

  IF v_refund_id IS NULL THEN
    RAISE EXCEPTION 'DUPLICATE_REFUND_REFERENCE' USING ERRCODE='22023';
  END IF;

  v_refunded_after := v_refunded_before + p_amount_minor;

  UPDATE ai_market_private.payment_events
  SET processed_at=clock_timestamp(),processing_result='refund_captured'
  WHERE id=v_event_id;

  UPDATE ai_market_private.billing_orders
  SET status=CASE
      WHEN v_refunded_after = amount_minor THEN 'refunded'
      ELSE 'partially_refunded'
    END,
    updated_at=clock_timestamp()
  WHERE id=v_order.id;

  IF v_refunded_after = v_order.amount_minor THEN
    RETURN 'refunded';
  END IF;
  RETURN 'partially_refunded';
END;
$function$;

REVOKE ALL ON FUNCTION ai_market_private.record_verified_refund(
  text,text,text,text,bigint,text,text,timestamptz
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION ai_market_private.record_verified_refund(
  text,text,text,text,bigint,text,text,timestamptz
) TO service_role;

COMMENT ON FUNCTION ai_market_private.record_verified_refund(
  text,text,text,text,bigint,text,text,timestamptz
) IS 'Service-role-only atomic refund settlement after external cryptographic verification; idempotent by provider event ID and refund reference, with per-order remaining-balance enforcement.';
