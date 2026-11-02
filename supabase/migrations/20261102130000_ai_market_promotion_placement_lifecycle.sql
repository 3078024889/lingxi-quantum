-- Private-by-default evidence ledger for marketplace placement and refunds.
-- ONLY a provider-verifying server adapter may write evidence after signature,
-- order lookup, currency/amount verification and replay checks.
-- This migration does not create a payment endpoint or grant public placement.
CREATE TABLE IF NOT EXISTS public.ai_market_promotion_settlement_evidence(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 merchant_order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
 provider text NOT NULL CHECK(provider IN ('paypal','alipay','wechat')),
 provider_event_ref text NOT NULL CHECK(length(provider_event_ref) BETWEEN 8 AND 150),
 provider_transaction_ref text NOT NULL CHECK(length(provider_transaction_ref) BETWEEN 8 AND 150),
 payload_sha256 text NOT NULL CHECK(payload_sha256 ~ '^[a-f0-9]{64}$'),
 amount_minor integer NOT NULL CHECK(amount_minor>0),
 currency text NOT NULL CHECK(currency IN ('CNY','USD')),
 signature_verified_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(provider,provider_event_ref),
 UNIQUE(provider,provider_transaction_ref)
);
ALTER TABLE public.ai_market_promotion_settlement_evidence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_promotion_settlement_evidence FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.ai_market_promotion_settlement_evidence TO service_role;

CREATE TABLE IF NOT EXISTS public.ai_market_promotion_entitlements(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 promotion_request_id uuid NOT NULL UNIQUE
  REFERENCES public.ai_market_vendor_promotion_requests(id) ON DELETE RESTRICT,
 merchant_order_id uuid NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE RESTRICT,
 settlement_evidence_id uuid NOT NULL UNIQUE
  REFERENCES public.ai_market_promotion_settlement_evidence(id) ON DELETE RESTRICT,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 product_id text NOT NULL,
 plan_id text NOT NULL CHECK(plan_id IN ('sponsored','category','brand')),
 status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','revoked','expired')),
 starts_at timestamptz NOT NULL,
 ends_at timestamptz NOT NULL,
 revoked_at timestamptz,
 revocation_reason text CHECK(revocation_reason IN ('provider_refund','vendor_claim_revoked','operator_review','chargeback')),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(ends_at>starts_at AND ends_at<=starts_at+interval '366 days'),
 CHECK(
  (status='active' AND revoked_at IS NULL AND revocation_reason IS NULL) OR
  (status='expired' AND revoked_at IS NULL AND revocation_reason IS NULL) OR
  (status='revoked' AND revoked_at IS NOT NULL AND revocation_reason IS NOT NULL)
 )
);
CREATE INDEX IF NOT EXISTS ai_market_active_placements
 ON public.ai_market_promotion_entitlements(product_id,plan_id,ends_at)
 WHERE status='active';
CREATE INDEX IF NOT EXISTS ai_market_entitlements_owner
 ON public.ai_market_promotion_entitlements(user_id,created_at DESC);
ALTER TABLE public.ai_market_promotion_entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_promotion_entitlements FROM PUBLIC,anon,authenticated;
GRANT SELECT(id,promotion_request_id,merchant_order_id,user_id,product_id,plan_id,status,starts_at,ends_at,revoked_at,revocation_reason)
 ON public.ai_market_promotion_entitlements TO authenticated;
GRANT SELECT,INSERT,UPDATE ON public.ai_market_promotion_entitlements TO service_role;
DROP POLICY IF EXISTS ai_market_entitlement_owner_read ON public.ai_market_promotion_entitlements;
CREATE POLICY ai_market_entitlement_owner_read ON public.ai_market_promotion_entitlements
 FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));

-- No browser can INSERT this table. The service-role backend must first commit
-- a provider-signed and server-matched payment event for a linked order.
CREATE OR REPLACE FUNCTION public.ai_market_protect_placement()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $placement$
DECLARE q record; c record; o record; proof record;
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.status<>'active' OR NEW.revoked_at IS NOT NULL OR NEW.revocation_reason IS NOT NULL
   THEN RAISE EXCEPTION 'INITIAL_ENTITLEMENT_NOT_ACTIVE' USING ERRCODE='23514'; END IF;
  SELECT id,user_id,claim_id,product_id,plan_id,currency,provider,amount_minor,status,merchant_order_id
    INTO q FROM public.ai_market_vendor_promotion_requests WHERE id=NEW.promotion_request_id;
  IF NOT FOUND OR q.status<>'merchant_linked' OR q.merchant_order_id IS DISTINCT FROM NEW.merchant_order_id
    OR q.user_id IS DISTINCT FROM NEW.user_id OR q.product_id IS DISTINCT FROM NEW.product_id
    OR q.plan_id IS DISTINCT FROM NEW.plan_id
    THEN RAISE EXCEPTION 'UNLINKED_OR_CHANGED_PROMOTION' USING ERRCODE='23514'; END IF;
  SELECT user_id,product_id,status INTO c FROM public.ai_market_vendor_claims WHERE id=q.claim_id;
  IF NOT FOUND OR c.user_id IS DISTINCT FROM NEW.user_id OR c.product_id IS DISTINCT FROM NEW.product_id
    OR c.status<>'approved'
    THEN RAISE EXCEPTION 'APPROVED_VENDOR_REQUIRED' USING ERRCODE='23514'; END IF;
  SELECT user_id,product_id,provider,currency,amount_rmb,amount_usd,status INTO o
    FROM public.orders WHERE id=NEW.merchant_order_id;
  IF NOT FOUND OR o.user_id IS DISTINCT FROM NEW.user_id
    OR o.product_id IS DISTINCT FROM ('ai-market:'||NEW.plan_id)
    OR o.provider IS DISTINCT FROM q.provider OR o.currency IS DISTINCT FROM q.currency
    OR (CASE q.currency WHEN 'USD' THEN o.amount_usd ELSE o.amount_rmb END)*100
       IS DISTINCT FROM q.amount_minor OR o.status<>'paid'
    THEN RAISE EXCEPTION 'PAID_ORDER_NOT_VERIFIED' USING ERRCODE='23514'; END IF;
  SELECT merchant_order_id,provider,amount_minor,currency,signature_verified_at
    INTO proof FROM public.ai_market_promotion_settlement_evidence WHERE id=NEW.settlement_evidence_id;
  IF NOT FOUND OR proof.merchant_order_id IS DISTINCT FROM NEW.merchant_order_id
    OR proof.provider IS DISTINCT FROM q.provider OR proof.amount_minor IS DISTINCT FROM q.amount_minor
    OR proof.currency IS DISTINCT FROM q.currency
    OR proof.signature_verified_at IS NULL OR proof.signature_verified_at>clock_timestamp()+interval '5 minutes'
    OR NEW.starts_at<proof.signature_verified_at
    THEN RAISE EXCEPTION 'SIGNED_SETTLEMENT_PROOF_REQUIRED' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 END IF;
 -- Frozen identity, paid order and window; only a controlled revocation/expiry changes status.
 IF ROW(NEW.promotion_request_id,NEW.merchant_order_id,NEW.settlement_evidence_id,
        NEW.user_id,NEW.product_id,NEW.plan_id,NEW.starts_at,NEW.ends_at)
    IS DISTINCT FROM
    ROW(OLD.promotion_request_id,OLD.merchant_order_id,OLD.settlement_evidence_id,
        OLD.user_id,OLD.product_id,OLD.plan_id,OLD.starts_at,OLD.ends_at)
   THEN RAISE EXCEPTION 'ENTITLEMENT_IMMUTABLE' USING ERRCODE='23514'; END IF;
 IF OLD.status='active' AND NEW.status='revoked' AND NEW.revoked_at IS NOT NULL
   AND NEW.revocation_reason IS NOT NULL THEN RETURN NEW; END IF;
 IF OLD.status='active' AND NEW.status='expired' AND NEW.revoked_at IS NULL THEN
  IF clock_timestamp()<OLD.ends_at THEN RAISE EXCEPTION 'NOT_YET_EXPIRED' USING ERRCODE='23514'; END IF;
  RETURN NEW;
 END IF;
 RAISE EXCEPTION 'ILLEGAL_ENTITLEMENT_TRANSITION' USING ERRCODE='23514';
END
$placement$;
REVOKE ALL ON FUNCTION public.ai_market_protect_placement() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS ai_market_placement_guard ON public.ai_market_promotion_entitlements;
CREATE TRIGGER ai_market_placement_guard BEFORE INSERT OR UPDATE
 ON public.ai_market_promotion_entitlements FOR EACH ROW
 EXECUTE FUNCTION public.ai_market_protect_placement();

CREATE TABLE IF NOT EXISTS public.ai_market_promotion_refund_evidence(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 merchant_order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
 provider text NOT NULL CHECK(provider IN ('paypal','alipay','wechat')),
 provider_event_ref text NOT NULL CHECK(length(provider_event_ref) BETWEEN 8 AND 150),
 refund_reference text NOT NULL CHECK(length(refund_reference) BETWEEN 8 AND 150),
 amount_minor integer NOT NULL CHECK(amount_minor>0),
 currency text NOT NULL CHECK(currency IN ('CNY','USD')),
 payload_sha256 text NOT NULL CHECK(payload_sha256 ~ '^[a-f0-9]{64}$'),
 signature_verified_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 UNIQUE(provider,provider_event_ref),
 UNIQUE(provider,refund_reference)
);
ALTER TABLE public.ai_market_promotion_refund_evidence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_promotion_refund_evidence FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.ai_market_promotion_refund_evidence TO service_role;

-- A partial refund suspends placement as conservatively as a full refund.
-- All conditions and entitlement revocation are in the same DB transaction.
CREATE OR REPLACE FUNCTION public.ai_market_apply_verified_refund()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $refund$
DECLARE proof record; total_refunded bigint; e record;
BEGIN
 SELECT provider,currency,amount_minor INTO proof FROM public.ai_market_promotion_settlement_evidence
  WHERE merchant_order_id=NEW.merchant_order_id;
 IF NOT FOUND OR NEW.provider IS DISTINCT FROM proof.provider
  OR NEW.currency IS DISTINCT FROM proof.currency
  OR NEW.signature_verified_at>clock_timestamp()+interval '5 minutes'
 THEN RAISE EXCEPTION 'REFUND_PROVIDER_PROOF_MISMATCH' USING ERRCODE='23514'; END IF;
 SELECT coalesce(sum(amount_minor),0) INTO total_refunded
   FROM public.ai_market_promotion_refund_evidence WHERE merchant_order_id=NEW.merchant_order_id;
 IF total_refunded+NEW.amount_minor>proof.amount_minor
 THEN RAISE EXCEPTION 'REFUND_EXCEEDS_PAID_AMOUNT' USING ERRCODE='23514'; END IF;
 SELECT id,status INTO e FROM public.ai_market_promotion_entitlements
  WHERE merchant_order_id=NEW.merchant_order_id FOR UPDATE;
 IF FOUND AND e.status='active' THEN
  UPDATE public.ai_market_promotion_entitlements SET status='revoked',
    revoked_at=clock_timestamp(),revocation_reason='provider_refund' WHERE id=e.id;
 END IF;
 RETURN NEW;
END
$refund$;
REVOKE ALL ON FUNCTION public.ai_market_apply_verified_refund() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS ai_market_refund_revoke_placement ON public.ai_market_promotion_refund_evidence;
CREATE TRIGGER ai_market_refund_revoke_placement BEFORE INSERT
 ON public.ai_market_promotion_refund_evidence FOR EACH ROW
 EXECUTE FUNCTION public.ai_market_apply_verified_refund();

-- Revoking verified vendor authority immediately revokes current placements.
CREATE OR REPLACE FUNCTION public.ai_market_revoke_placement_after_vendor_review()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $vendorrevoked$
BEGIN
 IF NEW.status='revoked' AND OLD.status='approved' THEN
  UPDATE public.ai_market_promotion_entitlements SET status='revoked',
   revoked_at=clock_timestamp(),revocation_reason='vendor_claim_revoked'
   WHERE user_id=NEW.user_id AND product_id=NEW.product_id AND status='active';
 END IF;
 RETURN NEW;
END
$vendorrevoked$;
REVOKE ALL ON FUNCTION public.ai_market_revoke_placement_after_vendor_review() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS ai_market_vendor_review_revokes_placement ON public.ai_market_vendor_claims;
CREATE TRIGGER ai_market_vendor_review_revokes_placement AFTER UPDATE OF status
 ON public.ai_market_vendor_claims FOR EACH ROW
 EXECUTE FUNCTION public.ai_market_revoke_placement_after_vendor_review();

-- Public market advertisement views must still be explicitly bridged and
-- must filter active, approved, paid AND starts_at <= now < ends_at.
-- This table grants NO anonymous SELECT.
