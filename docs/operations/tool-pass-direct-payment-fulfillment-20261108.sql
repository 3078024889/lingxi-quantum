-- Direct WeChat/Alipay/PayPal paid tool passes; preserves wallet purchases and all legacy orders.
-- Trusted service_role ONLY. Caller MUST verify provider signature and amount BEFORE invoking.
BEGIN;
CREATE OR REPLACE FUNCTION public.lingxi_fulfill_paid_tool_pass(p_order_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $func$
DECLARE
 o public.orders%ROWTYPE;
 previous public.lingxi_tool_passes%ROWTYPE;
 v_days integer;
 v_price_minor bigint;
 v_start timestamptz;
 v_expires timestamptz;
 v_now timestamptz:=now();
BEGIN
 IF p_order_id IS NULL THEN RETURN jsonb_build_object('ok',false,'error','INVALID_ORDER'); END IF;
 SELECT * INTO o FROM public.orders WHERE id=p_order_id FOR UPDATE;
 IF NOT FOUND OR o.user_id IS NULL OR o.provider_payment_id IS NULL OR o.provider NOT IN ('wechat','alipay','paypal')
    OR o.status NOT IN ('pending','paid') OR o.currency NOT IN ('CNY','USD')
 THEN RETURN jsonb_build_object('ok',false,'error','UNVERIFIED_ORDER'); END IF;
 CASE o.product_id
   WHEN 'tool_pass_7d' THEN v_days:=7;v_price_minor:=2900;
   WHEN 'tool_pass_30d' THEN v_days:=30;v_price_minor:=9900;
   WHEN 'tool_pass_90d' THEN v_days:=90;v_price_minor:=26900;
   WHEN 'tool_pass_365d' THEN v_days:=365;v_price_minor:=89900;
   ELSE RETURN jsonb_build_object('ok',false,'error','INVALID_TOOL_PASS_SKU');
 END CASE;
 IF o.product_type IS DISTINCT FROM 'subscription'
    OR (o.currency='CNY' AND (o.amount_rmb IS NULL OR round(o.amount_rmb*100)::bigint<>v_price_minor))
    OR (o.currency='USD' AND (o.amount_usd IS NULL OR round(o.amount_usd*100)::bigint<>v_price_minor))
 THEN RETURN jsonb_build_object('ok',false,'error','ORDER_PRICE_MISMATCH'); END IF;
 IF (o.provider IN ('wechat','alipay') AND o.currency<>'CNY')
     OR (o.provider='paypal' AND o.currency<>'USD')
 THEN RETURN jsonb_build_object('ok',false,'error','PROVIDER_CURRENCY_MISMATCH'); END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('lingxi-pass:'||o.user_id::text,0));
 SELECT * INTO previous FROM public.lingxi_tool_passes WHERE order_id=p_order_id FOR UPDATE;
 IF FOUND THEN
   IF previous.user_id<>o.user_id OR previous.sku<>o.product_id OR previous.currency<>o.currency
   THEN RETURN jsonb_build_object('ok',false,'error','IDEMPOTENCY_CONFLICT'); END IF;
   IF previous.revoked_at IS NOT NULL THEN RETURN jsonb_build_object('ok',false,'error','PASS_REVOKED'); END IF;
   RETURN jsonb_build_object('ok',true,'alreadyPurchased',true,'expiresAt',previous.expires_at,'orderId',o.id);
 END IF;
 SELECT greatest(v_now,coalesce(max(expires_at),v_now)) INTO v_start
 FROM public.lingxi_tool_passes WHERE user_id=o.user_id AND revoked_at IS NULL AND expires_at>v_now;
 v_expires:=v_start+pg_catalog.make_interval(days=>v_days);
 INSERT INTO public.lingxi_tool_passes(user_id,sku,currency,price_minor,purchase_request_id,order_id,starts_at,expires_at)
 VALUES(o.user_id,o.product_id,o.currency,v_price_minor,p_order_id,p_order_id,v_start,v_expires);
 UPDATE public.orders SET status='paid',paid_at=coalesce(paid_at,v_now) WHERE id=p_order_id;
 RETURN jsonb_build_object('ok',true,'alreadyPurchased',false,'orderId',o.id,'expiresAt',v_expires,
                           'startsAt',v_start,'currency',o.currency,'priceMinor',v_price_minor);
END $func$;
REVOKE ALL ON FUNCTION public.lingxi_fulfill_paid_tool_pass(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.lingxi_fulfill_paid_tool_pass(uuid) TO service_role;
COMMIT;
