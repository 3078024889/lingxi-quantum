-- Atomically reserve at most one unpaid Mini Program CNY balance top-up per account.
-- Provider reconciliation remains the authority for paid/closed state; this function never credits a wallet.
CREATE OR REPLACE FUNCTION public.reserve_mini_cny_topup_order(
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
BEGIN
  IF p_order_id IS NULL OR p_user_id IS NULL
     OR p_product_id !~ '^sasi-balance-(10|88|666|888|custom-(0|[1-9][0-9]{0,4})(\.[0-9]{1,2})?)$'
     OR p_amount_rmb IS NULL OR p_amount_rmb <= 0 OR p_amount_rmb > 10000
     OR p_out_trade_no !~ '^LXR[A-F0-9]{29}$'
     OR COALESCE(jsonb_typeof(p_snapshot) <> 'object', true)
     OR p_snapshot->>'kind' IS DISTINCT FROM 'topup'
     OR p_snapshot->>'productId' IS DISTINCT FROM p_product_id
     OR p_snapshot->>'orderId' IS DISTINCT FROM p_order_id::text
     OR p_snapshot->>'openid' IS NULL
     OR p_snapshot->>'env' IS DISTINCT FROM '0' THEN
    RAISE EXCEPTION 'invalid mini CNY top-up reservation';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('mini-cny-topup:' || p_user_id::text, 0));

  SELECT id INTO v_existing_id
  FROM public.orders
  WHERE user_id = p_user_id
    AND provider = 'wechat_mini_virtual'
    AND product_id LIKE 'sasi-balance-%'
    AND status = 'pending'
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
    'CNY', 'pending', 'wechat_mini_virtual', p_out_trade_no,
    'mini-program', '余额充值 ¥' || p_amount_rmb::text
  );

  INSERT INTO public.wechat_mini_payment_events (
    event_type, out_trade_no, order_id, transaction_id, payload, handled
  ) VALUES (
    'virtual_topup_order_created', p_out_trade_no, p_order_id, 'created', p_snapshot, true
  );

  RETURN jsonb_build_object('ok', true, 'orderId', p_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_mini_cny_topup_order(uuid, uuid, text, numeric, text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_mini_cny_topup_order(uuid, uuid, text, numeric, text, jsonb)
  TO service_role;
