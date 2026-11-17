-- Standard WeChat merchant JSAPI reservation for Mini Program CNY wallet top-ups.
-- Additive only: legacy virtual-goods orders and their reconciliation/refund history remain intact.
CREATE OR REPLACE FUNCTION public.reserve_mini_cny_jsapi_topup_order(
  p_order_id uuid,
  p_user_id uuid,
  p_product_id text,
  p_amount_rmb numeric,
  p_out_trade_no text,
  p_snapshot jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_existing_id uuid;
  v_expected_amount numeric;
BEGIN
  IF p_order_id IS NULL OR p_user_id IS NULL
     OR p_product_id !~ '^sasi-balance-(10|88|666|888|custom-(0|[1-9][0-9]{0,4})(\\.[0-9]{1,2})?)$'
     OR p_amount_rmb IS NULL OR p_amount_rmb <= 0 OR p_amount_rmb > 10000
     OR p_amount_rmb * 100 <> trunc(p_amount_rmb * 100)
     OR p_out_trade_no !~ '^LXM[A-F0-9]{29}$'
     OR COALESCE(jsonb_typeof(p_snapshot) <> 'object', true)
     OR p_snapshot->>'kind' IS DISTINCT FROM 'mini_jsapi_topup'
     OR p_snapshot->>'productId' IS DISTINCT FROM p_product_id
     OR p_snapshot->>'orderId' IS DISTINCT FROM p_order_id::text
     OR NULLIF(p_snapshot->>'openid', '') IS NULL
     OR length(p_snapshot->>'openid') > 128
     OR p_snapshot->>'appId' IS DISTINCT FROM 'wxbf4ae90406e7e26b'
     OR COALESCE(p_snapshot->>'requestId' !~ '^[0-9a-fA-F]{32}$', true)
     OR p_snapshot->>'outTradeNo' IS DISTINCT FROM p_out_trade_no
     OR p_snapshot->>'amountFen' IS DISTINCT FROM (p_amount_rmb * 100)::bigint::text THEN
    RAISE EXCEPTION 'invalid Mini Program JSAPI CNY top-up reservation';
  END IF;

  v_expected_amount := CASE p_product_id
    WHEN 'sasi-balance-10' THEN 10
    WHEN 'sasi-balance-88' THEN 88
    WHEN 'sasi-balance-666' THEN 666
    WHEN 'sasi-balance-888' THEN 888
    ELSE substring(p_product_id from '^sasi-balance-custom-(.*)$')::numeric
  END;
  IF p_amount_rmb <> v_expected_amount THEN
    RAISE EXCEPTION 'Mini Program top-up amount does not match product';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('mini-cny-topup:' || p_user_id::text, 0));

  SELECT id INTO v_existing_id
  FROM public.orders
  WHERE user_id = p_user_id
    AND product_id LIKE 'sasi-balance-%'
    AND status = 'pending'
    AND provider IN ('wechat', 'wechat_mini_virtual')
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'code', 'PENDING_EXISTS', 'orderId', v_existing_id);
  END IF;

  INSERT INTO public.orders (
    id, user_id, product_id, product_type, amount_rmb, amount_usd,
    currency, status, provider, provider_payment_id, channel, submission_name
  ) VALUES (
    p_order_id, p_user_id, p_product_id, 'permanent', p_amount_rmb, 0,
    'CNY', 'pending', 'wechat', p_out_trade_no, 'mini-program',
    '余额充值 ¥' || p_amount_rmb::text
  );

  INSERT INTO public.wechat_mini_payment_events (
    event_type, out_trade_no, order_id, transaction_id, payload, handled
  ) VALUES (
    'mini_jsapi_topup_order_created', p_out_trade_no, p_order_id, 'created', p_snapshot, true
  );

  RETURN jsonb_build_object('ok', true, 'orderId', p_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_mini_cny_jsapi_topup_order(uuid, uuid, text, numeric, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_mini_cny_jsapi_topup_order(uuid, uuid, text, numeric, text, jsonb)
  TO service_role;
