-- SASI marketplace: single verified order fulfillment for CNY and USD.
-- Does not turn on any payment provider or the SASI_MARKETPLACE_COMMERCE_READY gate.
BEGIN;
CREATE OR REPLACE FUNCTION public.sasi_market_record_verified_sale(p_order_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE
 o public.orders%ROWTYPE;
 l public.sasi_market_listings%ROWTYPE;
 prior public.sasi_market_sales%ROWTYPE;
 gross bigint; fee bigint; expected bigint;
BEGIN
 SELECT * INTO o FROM public.orders WHERE id=p_order_id FOR UPDATE;
 IF NOT FOUND OR o.provider_payment_id IS NULL OR o.status NOT IN ('pending','paid')
   OR NOT ((o.currency='CNY' AND o.provider IN ('wechat','alipay'))
        OR (o.currency='USD' AND o.provider='paypal'))
 THEN RETURN jsonb_build_object('ok',false,'error','UNSUPPORTED_VERIFIED_ORDER'); END IF;
 IF o.product_id !~ '^sasi-market:[0-9a-f-]{36}$'
 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_PRODUCT'); END IF;
 SELECT * INTO l FROM public.sasi_market_listings
 WHERE id=substring(o.product_id from 13)::uuid FOR SHARE;
 IF NOT FOUND OR l.status<>'published' OR l.scan_status<>'clean'
   OR l.delivery_path IS NULL OR l.sha256 IS NULL
 THEN RETURN jsonb_build_object('ok',false,'error','PRODUCT_UNAVAILABLE'); END IF;
 IF l.seller_id=o.user_id THEN RETURN jsonb_build_object('ok',false,'error','SELF_PURCHASE'); END IF;
 IF o.currency='CNY' THEN
  gross=round(o.amount_rmb*100)::bigint; expected=l.price_cny_minor;
 ELSE
  gross=round(o.amount_usd*100)::bigint; expected=l.price_usd_minor;
 END IF;
 IF gross<=0 OR gross IS DISTINCT FROM expected
 THEN RETURN jsonb_build_object('ok',false,'error','PRICE_OR_CURRENCY_MISMATCH'); END IF;
 fee=(gross*1500+5000)/10000;
 INSERT INTO public.sasi_market_sales
 (order_id,listing_id,seller_id,buyer_id,currency,gross_minor,platform_fee_minor,
  seller_net_minor,provider_payment_id,available_at)
 VALUES(o.id,l.id,l.seller_id,o.user_id,o.currency,gross,fee,gross-fee,
  o.provider_payment_id,now()+interval '7 days')
 ON CONFLICT(order_id) DO NOTHING;
 SELECT * INTO prior FROM public.sasi_market_sales WHERE order_id=o.id;
 IF prior.listing_id IS DISTINCT FROM l.id
   OR prior.seller_id IS DISTINCT FROM l.seller_id
   OR prior.buyer_id IS DISTINCT FROM o.user_id
   OR prior.currency IS DISTINCT FROM o.currency
   OR prior.gross_minor IS DISTINCT FROM gross
   OR prior.provider_payment_id IS DISTINCT FROM o.provider_payment_id
 THEN RETURN jsonb_build_object('ok',false,'error','SALE_IDEMPOTENCY_CONFLICT'); END IF;
 UPDATE public.orders SET status='paid',paid_at=COALESCE(paid_at,now()) WHERE id=o.id;
 RETURN jsonb_build_object('ok',true,'alreadyPaid',o.status='paid');
END $$;
REVOKE ALL ON FUNCTION public.sasi_market_record_verified_sale(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_market_record_verified_sale(uuid) TO service_role;
COMMIT;
