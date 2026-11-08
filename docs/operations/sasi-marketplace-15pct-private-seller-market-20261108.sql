-- SASI software marketplace schema (2026-11-08).
-- DRY RUN IN TRANSACTION BEFORE DEPLOY. Does not alter orders or historical SASI works.
-- Payment/payout feature flags remain OFF until merchant, KYC and delivery verified.
BEGIN;

CREATE TABLE IF NOT EXISTS public.sasi_market_sellers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE RESTRICT,
  display_name text NOT NULL CHECK(length(trim(display_name)) BETWEEN 2 AND 60),
  statement_accepted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending_review'
    CHECK(status IN ('pending_review','approved','suspended')),
  kyc_status text NOT NULL DEFAULT 'unverified'
    CHECK(kyc_status IN ('unverified','pending','verified','rejected')),
  payout_provider text CHECK(payout_provider IN ('wechat','alipay','bank','stripe')),
  payout_provider_account_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.sasi_market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sasi_market_sellers(user_id) ON DELETE RESTRICT,
  title text NOT NULL CHECK(length(trim(title)) BETWEEN 4 AND 120),
  description text NOT NULL DEFAULT '' CHECK(length(description)<=5000),
  category text NOT NULL DEFAULT 'software'
    CHECK(category IN ('mt5-ea','mt5-indicator','automation','desktop-app','developer-tool','software')),
  price_cny_minor bigint NOT NULL CHECK(price_cny_minor BETWEEN 100 AND 1000000000),
  price_usd_minor bigint NOT NULL CHECK(price_usd_minor BETWEEN 100 AND 1000000000),
  status text NOT NULL DEFAULT 'draft'
    CHECK(status IN ('draft','submitted','rejected','published','archived')),
  scan_status text NOT NULL DEFAULT 'unscanned'
    CHECK(scan_status IN ('unscanned','clean','infected','scan_failed')),
  quarantine_path text,
  delivery_bucket text NOT NULL DEFAULT 'sasi-market-delivery'
    CHECK(delivery_bucket='sasi-market-delivery'),
  delivery_path text,
  sha256 text CHECK(sha256 IS NULL OR sha256 ~ '^[0-9a-f]{64}$'),
  file_size_bytes bigint CHECK(file_size_bytes IS NULL OR (file_size_bytes BETWEEN 1 AND 31457280)),
  rejection_reason text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT market_verified_publication CHECK(
    status <> 'published' OR
    (scan_status='clean' AND delivery_path IS NOT NULL AND sha256 IS NOT NULL
     AND reviewed_at IS NOT NULL AND published_at IS NOT NULL)),
  CONSTRAINT market_path_guard CHECK(
    delivery_path IS NULL OR (length(delivery_path)>10 AND delivery_path NOT LIKE '/%'
      AND delivery_path NOT LIKE '%..%'))
);
CREATE INDEX IF NOT EXISTS sasi_market_listings_public_idx
  ON public.sasi_market_listings(published_at DESC) WHERE status='published' AND scan_status='clean';
CREATE INDEX IF NOT EXISTS sasi_market_listings_seller_idx ON public.sasi_market_listings(seller_id,created_at DESC);

CREATE TABLE IF NOT EXISTS public.sasi_market_sales (
  order_id uuid PRIMARY KEY REFERENCES public.orders(id) ON DELETE RESTRICT,
  listing_id uuid NOT NULL REFERENCES public.sasi_market_listings(id) ON DELETE RESTRICT,
  seller_id uuid NOT NULL REFERENCES public.sasi_market_sellers(user_id) ON DELETE RESTRICT,
  buyer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  currency text NOT NULL CHECK(currency IN ('CNY','USD')),
  gross_minor bigint NOT NULL CHECK(gross_minor>0),
  platform_fee_minor bigint NOT NULL CHECK(platform_fee_minor>=0),
  seller_net_minor bigint NOT NULL CHECK(seller_net_minor>=0),
  download_count integer NOT NULL DEFAULT 0 CHECK(download_count BETWEEN 0 AND 10),
  provider_payment_id text NOT NULL,
  status text NOT NULL DEFAULT 'held'
    CHECK(status IN ('held','available','refunded','chargeback','frozen')),
  available_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(gross_minor=platform_fee_minor+seller_net_minor),
  CHECK(platform_fee_minor=((gross_minor*1500+5000)/10000))
);
CREATE INDEX IF NOT EXISTS sasi_market_sales_seller_idx ON public.sasi_market_sales(seller_id,currency,status,available_at);

CREATE TABLE IF NOT EXISTS public.sasi_market_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES public.sasi_market_sellers(user_id) ON DELETE RESTRICT,
  currency text NOT NULL CHECK(currency IN ('CNY','USD')),
  amount_minor bigint NOT NULL CHECK(amount_minor>0),
  idempotency_key uuid NOT NULL,
  status text NOT NULL DEFAULT 'requested'
    CHECK(status IN ('requested','processing','submitted','paid','failed','cancelled','reversed')),
  provider text NOT NULL CHECK(provider IN ('wechat','alipay','bank','stripe')),
  provider_transfer_id text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  submission_target_at timestamptz NOT NULL DEFAULT (now()+interval '15 minutes'),
  submitted_at timestamptz,
  completed_at timestamptz,
  provider_status text,
  failure_code text,
  UNIQUE(seller_id,idempotency_key)
);
CREATE INDEX IF NOT EXISTS sasi_market_payouts_seller_idx ON public.sasi_market_payouts(seller_id,currency,status);

ALTER TABLE public.sasi_market_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sasi_market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sasi_market_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sasi_market_payouts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.sasi_market_sellers,public.sasi_market_listings,
 public.sasi_market_sales,public.sasi_market_payouts FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.sasi_market_sellers,public.sasi_market_listings,
 public.sasi_market_sales,public.sasi_market_payouts TO service_role;
GRANT SELECT (user_id,display_name,status,kyc_status,payout_provider,created_at,updated_at)
 ON public.sasi_market_sellers TO authenticated;
GRANT INSERT (user_id,display_name,statement_accepted_at)
 ON public.sasi_market_sellers TO authenticated;
GRANT UPDATE (display_name,updated_at)
 ON public.sasi_market_sellers TO authenticated;

GRANT SELECT (id,seller_id,title,description,category,price_cny_minor,price_usd_minor,
 status,scan_status,published_at,created_at,updated_at)
 ON public.sasi_market_listings TO anon,authenticated;
GRANT INSERT (seller_id,title,description,category,price_cny_minor,price_usd_minor)
 ON public.sasi_market_listings TO authenticated;
GRANT UPDATE (title,description,category,price_cny_minor,price_usd_minor,status,updated_at)
 ON public.sasi_market_listings TO authenticated;
GRANT SELECT (order_id,listing_id,seller_id,currency,gross_minor,platform_fee_minor,
 seller_net_minor,status,available_at,created_at)
 ON public.sasi_market_sales TO authenticated;
GRANT SELECT (id,seller_id,currency,amount_minor,status,provider,requested_at,
 submission_target_at,submitted_at,completed_at)
 ON public.sasi_market_payouts TO authenticated;

DROP POLICY IF EXISTS sasi_market_sellers_own_select ON public.sasi_market_sellers;
CREATE POLICY sasi_market_sellers_own_select ON public.sasi_market_sellers
 FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS sasi_market_sellers_apply ON public.sasi_market_sellers;
CREATE POLICY sasi_market_sellers_apply ON public.sasi_market_sellers
 FOR INSERT TO authenticated
 WITH CHECK(user_id=(SELECT auth.uid()) AND status='pending_review'
   AND kyc_status='unverified' AND payout_provider IS NULL AND payout_provider_account_token IS NULL);
DROP POLICY IF EXISTS sasi_market_sellers_update ON public.sasi_market_sellers;
CREATE POLICY sasi_market_sellers_update ON public.sasi_market_sellers
 FOR UPDATE TO authenticated USING(user_id=(SELECT auth.uid()))
 WITH CHECK(user_id=(SELECT auth.uid()));

DROP POLICY IF EXISTS sasi_market_listings_public ON public.sasi_market_listings;
CREATE POLICY sasi_market_listings_public ON public.sasi_market_listings
 FOR SELECT TO anon,authenticated USING(status='published' AND scan_status='clean');
DROP POLICY IF EXISTS sasi_market_listings_own_select ON public.sasi_market_listings;
CREATE POLICY sasi_market_listings_own_select ON public.sasi_market_listings
 FOR SELECT TO authenticated USING(seller_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS sasi_market_listings_draft_insert ON public.sasi_market_listings;
CREATE POLICY sasi_market_listings_draft_insert ON public.sasi_market_listings
 FOR INSERT TO authenticated
 WITH CHECK(seller_id=(SELECT auth.uid()) AND status='draft' AND scan_status='unscanned'
  AND quarantine_path IS NULL AND delivery_path IS NULL
  AND EXISTS (SELECT 1 FROM public.sasi_market_sellers s
    WHERE s.user_id=(SELECT auth.uid()) AND s.status IN ('pending_review','approved')));
DROP POLICY IF EXISTS sasi_market_listings_draft_update ON public.sasi_market_listings;
CREATE POLICY sasi_market_listings_draft_update ON public.sasi_market_listings
 FOR UPDATE TO authenticated USING(seller_id=(SELECT auth.uid()) AND status IN ('draft','submitted'))
 WITH CHECK(seller_id=(SELECT auth.uid()) AND status IN ('draft','submitted')
  AND scan_status='unscanned' AND delivery_path IS NULL AND published_at IS NULL);
DROP POLICY IF EXISTS sasi_market_sales_own_select ON public.sasi_market_sales;
CREATE POLICY sasi_market_sales_own_select ON public.sasi_market_sales
 FOR SELECT TO authenticated USING(seller_id=(SELECT auth.uid()) OR buyer_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS sasi_market_payouts_own_select ON public.sasi_market_payouts;
CREATE POLICY sasi_market_payouts_own_select ON public.sasi_market_payouts
 FOR SELECT TO authenticated USING(seller_id=(SELECT auth.uid()));

-- File buckets remain PRIVATE. Upload URLs are issued by authenticated server
-- endpoints with strict prefix/rate limits; no public upload or download policy.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES
 ('sasi-market-quarantine','sasi-market-quarantine',false,31457280,ARRAY['application/zip','application/x-zip-compressed','application/octet-stream']),
 ('sasi-market-delivery','sasi-market-delivery',false,31457280,ARRAY['application/zip','application/x-zip-compressed','application/octet-stream'])
ON CONFLICT(id) DO NOTHING;
DO $$
BEGIN
 IF EXISTS(SELECT 1 FROM storage.buckets WHERE id IN ('sasi-market-quarantine','sasi-market-delivery') AND public=true)
 THEN RAISE EXCEPTION 'SASI_MARKET_PRIVATE_BUCKET_REQUIRED'; END IF;
END $$;

-- Only a verified merchant callback uses this function through a service_role
-- endpoint. All order amount, product version and state checks are server-side.
CREATE OR REPLACE FUNCTION public.sasi_market_record_verified_sale(p_order_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE o public.orders%ROWTYPE; l public.sasi_market_listings%ROWTYPE;
 g bigint; fee bigint; previous public.sasi_market_sales%ROWTYPE;
BEGIN
 SELECT * INTO o FROM public.orders WHERE id=p_order_id FOR UPDATE;
 IF NOT FOUND OR o.provider NOT IN ('wechat','alipay') OR o.provider_payment_id IS NULL
   OR o.status NOT IN ('pending','paid') OR o.currency IS DISTINCT FROM 'CNY'
 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_ORDER'); END IF;
 IF o.product_id !~ '^sasi-market:[0-9a-f-]{36}$'
 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_PRODUCT'); END IF;
 SELECT * INTO l FROM public.sasi_market_listings
   WHERE id=substring(o.product_id from 13)::uuid FOR SHARE;
 IF NOT FOUND OR l.status<>'published' OR l.scan_status<>'clean'
  OR l.delivery_path IS NULL OR l.sha256 IS NULL
 THEN RETURN jsonb_build_object('ok',false,'error','PRODUCT_UNAVAILABLE'); END IF;
 IF l.seller_id=o.user_id THEN RETURN jsonb_build_object('ok',false,'error','SELF_PURCHASE'); END IF;
 g=round(o.amount_rmb*100)::bigint;
 IF g<=0 OR g<>l.price_cny_minor
 THEN RETURN jsonb_build_object('ok',false,'error','PRICE_MISMATCH'); END IF;
 fee=(g*1500+5000)/10000;
 INSERT INTO public.sasi_market_sales
   (order_id,listing_id,seller_id,buyer_id,currency,gross_minor,platform_fee_minor,seller_net_minor,provider_payment_id,available_at)
 VALUES(o.id,l.id,l.seller_id,o.user_id,'CNY',g,fee,g-fee,o.provider_payment_id,now()+interval '7 days')
 ON CONFLICT(order_id) DO NOTHING;
 SELECT * INTO previous FROM public.sasi_market_sales WHERE order_id=o.id;
 IF previous.listing_id IS DISTINCT FROM l.id OR previous.gross_minor IS DISTINCT FROM g
 THEN RETURN jsonb_build_object('ok',false,'error','SALE_CONFLICT'); END IF;
 UPDATE public.orders SET status='paid',paid_at=COALESCE(paid_at,now()) WHERE id=o.id;
 RETURN jsonb_build_object('ok',true,'alreadyPaid',o.status='paid');
END $$;
REVOKE ALL ON FUNCTION public.sasi_market_record_verified_sale(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_market_record_verified_sale(uuid) TO service_role;

-- Release matured sales only after 7 days and after refund/reversal review.
CREATE OR REPLACE FUNCTION public.sasi_market_release_due_sales()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE n integer;
BEGIN
 UPDATE public.sasi_market_sales SET status='available',updated_at=now()
 WHERE status='held' AND available_at<=now()
 AND EXISTS (SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.status='paid');
 GET DIAGNOSTICS n=ROW_COUNT;
 RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.sasi_market_release_due_sales() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_market_release_due_sales() TO service_role;

-- Buyer-only download access. Never grants a seller access to other buyers' files.
CREATE OR REPLACE FUNCTION public.sasi_market_claim_download(p_order_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $
DECLARE uid uuid; sale public.sasi_market_sales%ROWTYPE; current_order_status text;
BEGIN
 uid=auth.uid();
 IF uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','LOGIN_REQUIRED'); END IF;
 SELECT * INTO sale FROM public.sasi_market_sales WHERE order_id=p_order_id AND buyer_id=uid FOR UPDATE;
 IF NOT FOUND OR sale.status NOT IN ('held','available') THEN
   RETURN jsonb_build_object('ok',false,'error','NOT_ENTITLED'); END IF;
 SELECT status INTO current_order_status FROM public.orders WHERE id=p_order_id AND user_id=uid;
 IF current_order_status IS DISTINCT FROM 'paid' THEN
   RETURN jsonb_build_object('ok',false,'error','PAYMENT_UNVERIFIED'); END IF;
 IF sale.download_count>=10 THEN
   RETURN jsonb_build_object('ok',false,'error','DOWNLOAD_LIMIT_REACHED'); END IF;
 UPDATE public.sasi_market_sales SET download_count=download_count+1 WHERE order_id=p_order_id;
 RETURN jsonb_build_object('ok',true,'remaining',9-sale.download_count);
END $;
REVOKE ALL ON FUNCTION public.sasi_market_claim_download(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sasi_market_claim_download(uuid) TO authenticated,service_role;

-- Seller may REQUEST a payout only after identity/provider verification.
-- Does not initiate a payment: adapter must separately reconcile provider outcome.
CREATE OR REPLACE FUNCTION public.sasi_market_request_payout(p_amount_minor bigint,p_currency text,p_request_key uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE uid uuid; profile public.sasi_market_sellers%ROWTYPE; paid bigint; held bigint;
 exist public.sasi_market_payouts%ROWTYPE; new_id uuid;
BEGIN
 uid=auth.uid();
 IF uid IS NULL THEN RETURN jsonb_build_object('ok',false,'error','LOGIN_REQUIRED'); END IF;
 IF p_currency NOT IN ('CNY','USD') OR p_amount_minor IS NULL OR p_amount_minor<=0 OR p_request_key IS NULL
 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_PAYOUT_REQUEST'); END IF;
 SELECT * INTO profile FROM public.sasi_market_sellers WHERE user_id=uid FOR UPDATE;
 IF NOT FOUND OR profile.status<>'approved' OR profile.kyc_status<>'verified'
    OR profile.payout_provider IS NULL OR profile.payout_provider_account_token IS NULL
 THEN RETURN jsonb_build_object('ok',false,'error','SELLER_PAYOUT_NOT_VERIFIED'); END IF;
 SELECT * INTO exist FROM public.sasi_market_payouts WHERE seller_id=uid AND idempotency_key=p_request_key;
 IF FOUND THEN RETURN jsonb_build_object('ok',true,'id',exist.id,'status',exist.status,'alreadyRequested',true); END IF;
 IF (SELECT count(*) FROM public.sasi_market_payouts WHERE seller_id=uid AND requested_at>now()-interval '1 day')>=6
 THEN RETURN jsonb_build_object('ok',false,'error','PAYOUT_RATE_LIMITED'); END IF;
 SELECT COALESCE(sum(seller_net_minor),0)::bigint INTO paid
 FROM public.sasi_market_sales s JOIN public.orders o ON o.id=s.order_id
 WHERE s.seller_id=uid AND s.currency=p_currency
 AND s.status='available' AND s.available_at<=now() AND o.status='paid';
 SELECT COALESCE(sum(amount_minor),0)::bigint INTO held
 FROM public.sasi_market_payouts WHERE seller_id=uid AND currency=p_currency
 AND status IN ('requested','processing','submitted','paid');
 IF p_amount_minor>(paid-held) THEN RETURN jsonb_build_object('ok',false,'error','INSUFFICIENT_SETTLED_BALANCE'); END IF;
 INSERT INTO public.sasi_market_payouts
 (seller_id,currency,amount_minor,idempotency_key,provider)
 VALUES(uid,p_currency,p_amount_minor,p_request_key,profile.payout_provider)
 RETURNING id INTO new_id;
 RETURN jsonb_build_object('ok',true,'id',new_id,'status','requested','submissionTargetMinutes',15);
END $$;
REVOKE ALL ON FUNCTION public.sasi_market_request_payout(bigint,text,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.sasi_market_request_payout(bigint,text,uuid) TO authenticated,service_role;

COMMIT;
