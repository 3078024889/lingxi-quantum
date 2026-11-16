-- Reserve a CNY Mini Program wallet top-up for standard WeChat Pay APIv3 JSAPI.
-- This function creates an order only; it never credits a wallet.
CREATE OR REPLACE FUNCTION public.reserve_mini_cny_jsapi_topup_order(
  p_order_id uuid,
  p_user_id uuid,
  p_product_id text,
  p_amount_fen bigint,
  p_out_trade_no text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_existing_id uuid;
  v_expected_fen bigint;
  v_amount_text text;
BEGIN
  IF p_order_id IS NULL OR p_user_id IS NULL
     OR p_product_id IS NULL
     OR p_amount_fen IS NULL OR p_amount_fen < 1 OR p_amount_fen > 1000000
     OR p_out_trade_no !~ '^LXJ[A-F0-9]{29}$' THEN
    RAISE EXCEPTION 'invalid mini CNY JSAPI top-up reservation';
  END IF;

  IF p_product_id ~ '^sasi-balance-(10|88|666|888)$' THEN
    v_expected_fen := (regexp_replace(p_product_id, '^sasi-balance-', '')::numeric * 100)::bigint;
  ELSIF p_product_id ~ '^sasi-balance-custom-(0|[1-9][0-9]{0,4})(\.[0-9]{1,2})?$' THEN
    v_amount_text := regexp_replace(p_product_id, '^sasi-balance-custom-', '');
    v_expected_fen := round(v_amount_text::numeric * 100)::bigint;
    IF position('.' in v_amount_text) > 0 AND v_expected_fen > 10000 THEN
      RAISE EXCEPTION 'fractional mini top-up exceeds allowed limit';
    END IF;
  ELSE
    RAISE EXCEPTION 'unsupported mini CNY top-up product';
  END IF;

  IF v_expected_fen IS DISTINCT FROM p_amount_fen THEN
    RAISE EXCEPTION 'mini CNY top-up amount does not match product';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('mini-cny-topup:' || p_user_id::text, 0));

  SELECT id INTO v_existing_id
  FROM public.orders
  WHERE user_id = p_user_id
    AND provider IN ('wechat', 'wechat_mini_virtual')
    AND product_id LIKE 'sasi-balance-%'
    AND currency = 'CNY'
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
    p_order_id, p_user_id, p_product_id, 'permanent', p_amount_fen::numeric / 100, 0,
    'CNY', 'pending', 'wechat', p_out_trade_no, 'mini-program',
    '小程序人民币余额充值 ¥' || to_char(p_amount_fen::numeric / 100, 'FM999999990.00')
  );

  RETURN jsonb_build_object('ok', true, 'orderId', p_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_mini_cny_jsapi_topup_order(uuid, uuid, text, bigint, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_mini_cny_jsapi_topup_order(uuid, uuid, text, bigint, text)
  TO service_role;

-- Retire the previous virtual-goods-only reservation RPC. Existing orders and
-- their payment events, credits, refunds and ledger rows remain untouched.
DROP FUNCTION IF EXISTS public.reserve_mini_cny_topup_order(uuid, uuid, text, numeric, text, jsonb);
 THEN
    RAISE EXCEPTION 'invalid mini CNY JSAPI top-up reservation';
  END IF;

  IF p_product_id ~ '^sasi-balance-(10|88|666|888)$' THEN
    v_expected_fen := (regexp_replace(p_product_id, '^sasi-balance-', '')::numeric * 100)::bigint;
  ELSIF p_product_id ~ '^sasi-balance-custom-(0|[1-9][0-9]{0,4})(\.[0-9]{1,2})?$' THEN
    v_amount_text := regexp_replace(p_product_id, '^sasi-balance-custom-', '');
    v_expected_fen := round(v_amount_text::numeric * 100)::bigint;
    IF position('.' in v_amount_text) > 0 AND v_expected_fen > 10000 THEN
      RAISE EXCEPTION 'fractional mini top-up exceeds allowed limit';
    END IF;
  ELSE
    RAISE EXCEPTION 'unsupported mini CNY top-up product';
  END IF;

  IF v_expected_fen IS DISTINCT FROM p_amount_fen THEN
    RAISE EXCEPTION 'mini CNY top-up amount does not match product';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('mini-cny-topup:' || p_user_id::text, 0));

  SELECT id INTO v_existing_id
  FROM public.orders
  WHERE user_id = p_user_id
    AND provider IN ('wechat', 'wechat_mini_virtual')
    AND product_id LIKE 'sasi-balance-%'
    AND currency = 'CNY'
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
    p_order_id, p_user_id, p_product_id, 'permanent', p_amount_fen::numeric / 100, 0,
    'CNY', 'pending', 'wechat', p_out_trade_no, 'mini-program',
    '小程序人民币余额充值 ¥' || to_char(p_amount_fen::numeric / 100, 'FM999999990.00')
  );

  RETURN jsonb_build_object('ok', true, 'orderId', p_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_mini_cny_jsapi_topup_order(uuid, uuid, text, bigint, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_mini_cny_jsapi_topup_order(uuid, uuid, text, bigint, text)
  TO service_role;

-- Retire the previous virtual-goods-only reservation RPC. Existing orders and
-- their payment events, credits, refunds and ledger rows remain untouched.
DROP FUNCTION IF EXISTS public.reserve_mini_cny_topup_order(uuid, uuid, text, numeric, text, jsonb);
