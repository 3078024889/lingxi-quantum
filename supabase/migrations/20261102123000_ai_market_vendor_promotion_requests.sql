-- Draft promotion requests are owned by the verified LINGXIFIELD user.
-- NO checkout, payment capture, sponsored ranking or entitlement issuance here.
CREATE TABLE IF NOT EXISTS public.ai_market_vendor_promotion_requests(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 claim_id uuid NOT NULL REFERENCES public.ai_market_vendor_claims(id) ON DELETE RESTRICT,
 product_id text NOT NULL,
 plan_id text NOT NULL CHECK(plan_id IN ('sponsored','category','brand')),
 currency text NOT NULL CHECK(currency IN ('CNY','USD')),
 provider text NOT NULL CHECK(provider IN ('alipay','wechat','paypal')),
 amount_minor integer GENERATED ALWAYS AS (
   CASE plan_id WHEN 'sponsored' THEN 4900 WHEN 'category' THEN 14900 WHEN 'brand' THEN 29900 ELSE NULL END
 ) STORED,
 status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','merchant_linked','cancelled')),
 idempotency_key uuid NOT NULL,
 merchant_order_id uuid UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 linked_at timestamptz,
 CONSTRAINT market_promotion_provider_currency CHECK(
    (currency='USD' AND provider='paypal') OR
    (currency='CNY' AND provider IN ('alipay','wechat'))
 ),
 CONSTRAINT market_promotion_link_state CHECK(
   (status='merchant_linked' AND merchant_order_id IS NOT NULL AND linked_at IS NOT NULL)
   OR (status IN ('requested','cancelled') AND merchant_order_id IS NULL AND linked_at IS NULL)
 ),
 UNIQUE(user_id,idempotency_key)
);
-- Only one outstanding quote per claim and placement category; protects repeat clicks.
CREATE UNIQUE INDEX IF NOT EXISTS ai_market_pending_promotion_unique
 ON public.ai_market_vendor_promotion_requests(claim_id,plan_id) WHERE status='requested';
CREATE INDEX IF NOT EXISTS ai_market_promotion_owner_created
 ON public.ai_market_vendor_promotion_requests(user_id,created_at DESC);
ALTER TABLE public.ai_market_vendor_promotion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_vendor_promotion_requests FROM PUBLIC,anon,authenticated;
GRANT SELECT(id,user_id,claim_id,product_id,plan_id,currency,provider,amount_minor,status,idempotency_key,merchant_order_id,created_at,linked_at)
 ON public.ai_market_vendor_promotion_requests TO authenticated;
GRANT INSERT(user_id,claim_id,product_id,plan_id,currency,provider,idempotency_key)
 ON public.ai_market_vendor_promotion_requests TO authenticated;
GRANT SELECT,INSERT,UPDATE ON public.ai_market_vendor_promotion_requests TO service_role;
DROP POLICY IF EXISTS ai_market_promotion_owner_read ON public.ai_market_vendor_promotion_requests;
CREATE POLICY ai_market_promotion_owner_read ON public.ai_market_vendor_promotion_requests
 FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS ai_market_promotion_approved_vendor_submit ON public.ai_market_vendor_promotion_requests;
CREATE POLICY ai_market_promotion_approved_vendor_submit ON public.ai_market_vendor_promotion_requests
 FOR INSERT TO authenticated WITH CHECK(
  user_id=(SELECT auth.uid()) AND status='requested' AND merchant_order_id IS NULL AND
  EXISTS(SELECT 1 FROM public.ai_market_vendor_claims c
    WHERE c.id=claim_id AND c.user_id=(SELECT auth.uid())
      AND c.product_id=public.ai_market_vendor_promotion_requests.product_id AND c.status='approved')
 );

-- Cross-check claims and approved company at insert time; link only immutable,
-- server-owned orders with an exact marketplace SKU and the *same* user/payment.
CREATE OR REPLACE FUNCTION public.ai_market_protect_vendor_promotion()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $promotion$
DECLARE c record; o record;
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.status IS DISTINCT FROM 'requested' OR NEW.merchant_order_id IS NOT NULL THEN
   RAISE EXCEPTION 'PAYMENT_CANNOT_BE_CLIENT_GRANTED' USING ERRCODE='23514'; END IF;
  SELECT user_id,product_id,status INTO c FROM public.ai_market_vendor_claims WHERE id=NEW.claim_id;
  IF NOT FOUND OR c.user_id IS DISTINCT FROM NEW.user_id
   OR c.product_id IS DISTINCT FROM NEW.product_id OR c.status IS DISTINCT FROM 'approved'
  THEN RAISE EXCEPTION 'APPROVED_VENDOR_REQUIRED' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 END IF;
 IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.claim_id IS DISTINCT FROM OLD.claim_id
    OR NEW.product_id IS DISTINCT FROM OLD.product_id OR NEW.plan_id IS DISTINCT FROM OLD.plan_id
    OR NEW.currency IS DISTINCT FROM OLD.currency OR NEW.provider IS DISTINCT FROM OLD.provider
    OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key THEN
   RAISE EXCEPTION 'PROMOTION_QUOTE_IMMUTABLE' USING ERRCODE='23514';
 END IF;
 IF OLD.status='requested' AND NEW.status='cancelled'
   AND NEW.merchant_order_id IS NULL AND NEW.linked_at IS NULL THEN RETURN NEW; END IF;
 IF OLD.status IS DISTINCT FROM 'requested' OR NEW.status IS DISTINCT FROM 'merchant_linked'
   OR NEW.merchant_order_id IS NULL OR NEW.linked_at IS NULL THEN
   RAISE EXCEPTION 'INVALID_PROMOTION_ORDER_TRANSITION' USING ERRCODE='23514'; END IF;
 SELECT user_id,product_id,status INTO c FROM public.ai_market_vendor_claims WHERE id=NEW.claim_id;
 IF NOT FOUND OR c.user_id IS DISTINCT FROM NEW.user_id OR c.status IS DISTINCT FROM 'approved'
   OR c.product_id IS DISTINCT FROM NEW.product_id THEN
   RAISE EXCEPTION 'APPROVED_VENDOR_REQUIRED' USING ERRCODE='23514'; END IF;
 SELECT id,user_id,product_id,provider,currency,status,amount_rmb,amount_usd
 INTO o FROM public.orders WHERE id=NEW.merchant_order_id;
 IF NOT FOUND OR o.user_id IS DISTINCT FROM NEW.user_id
   OR o.product_id IS DISTINCT FROM ('ai-market:'||NEW.plan_id)
   OR o.provider IS DISTINCT FROM NEW.provider OR o.currency IS DISTINCT FROM NEW.currency
   OR o.status IS DISTINCT FROM 'pending'
   -- Generated STORED values are assigned AFTER BEFORE triggers; use the immutable plan price here.
   OR (CASE NEW.currency WHEN 'USD' THEN o.amount_usd ELSE o.amount_rmb END)*100
      IS DISTINCT FROM (CASE NEW.plan_id WHEN 'sponsored' THEN 4900 WHEN 'category' THEN 14900 WHEN 'brand' THEN 29900 END) THEN
   RAISE EXCEPTION 'MAIN_SITE_ORDER_NOT_VERIFIED' USING ERRCODE='23514'; END IF;
 RETURN NEW;
END
$promotion$;
REVOKE ALL ON FUNCTION public.ai_market_protect_vendor_promotion() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS ai_market_vendor_promotion_protect_trigger ON public.ai_market_vendor_promotion_requests;
CREATE TRIGGER ai_market_vendor_promotion_protect_trigger
 BEFORE INSERT OR UPDATE ON public.ai_market_vendor_promotion_requests
 FOR EACH ROW EXECUTE FUNCTION public.ai_market_protect_vendor_promotion();
-- No authenticated UPDATE/DELETE or buyer payment transition. The main-site
-- merchant adapter must later create the matching 'ai-market:<plan>' SKU and
-- provider-signed order before a reviewed service-role association is possible.
