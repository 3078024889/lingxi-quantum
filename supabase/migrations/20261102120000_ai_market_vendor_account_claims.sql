-- Global SIAI vendor claims: use LINGXIFIELD's existing auth.users identities.
-- No guest claim, auto ownership, paid ranking, checkout, or client-side approval.
CREATE TABLE IF NOT EXISTS public.ai_market_vendor_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL CHECK(product_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  company_name text NOT NULL CHECK(char_length(company_name) BETWEEN 2 AND 120),
  official_site text NOT NULL CHECK(official_site ~ '^https://'),
  evidence_url text NOT NULL CHECK(evidence_url ~ '^https://'),
  work_email text NOT NULL CHECK(char_length(work_email) BETWEEN 5 AND 254),
  status text NOT NULL DEFAULT 'pending_review'
    CHECK(status IN ('pending_review','identity_verified','approved','rejected','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_id uuid REFERENCES auth.users(id),
  review_note text CHECK(review_note IS NULL OR char_length(review_note) BETWEEN 12 AND 1000),
  UNIQUE(user_id,product_id)
);
CREATE INDEX IF NOT EXISTS ai_market_vendor_claims_user_time
  ON public.ai_market_vendor_claims(user_id,created_at DESC);
ALTER TABLE public.ai_market_vendor_claims ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_vendor_claims FROM PUBLIC,anon,authenticated;
GRANT SELECT(id,user_id,product_id,company_name,official_site,status,created_at,reviewed_at)
 ON public.ai_market_vendor_claims TO authenticated;
GRANT INSERT(user_id,product_id,company_name,official_site,evidence_url,work_email)
 ON public.ai_market_vendor_claims TO authenticated;
DROP POLICY IF EXISTS ai_market_vendor_claims_owner_read ON public.ai_market_vendor_claims;
CREATE POLICY ai_market_vendor_claims_owner_read ON public.ai_market_vendor_claims
 FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
DROP POLICY IF EXISTS ai_market_vendor_claims_owner_submit ON public.ai_market_vendor_claims;
CREATE POLICY ai_market_vendor_claims_owner_submit ON public.ai_market_vendor_claims
 FOR INSERT TO authenticated WITH CHECK(user_id=(SELECT auth.uid()) AND status='pending_review');
-- Serialization prevents two simultaneous requests bypassing the 3-free-claims ceiling.
CREATE OR REPLACE FUNCTION public.ai_market_limit_vendor_claims()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF NEW.user_id IS DISTINCT FROM (SELECT auth.uid()) THEN
  RAISE EXCEPTION 'VENDOR_IDENTITY_MISMATCH' USING ERRCODE='42501';
 END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(NEW.user_id::text,1002));
 IF (SELECT count(*) FROM public.ai_market_vendor_claims WHERE user_id=NEW.user_id)>=3 THEN
  RAISE EXCEPTION 'CLAIM_LIMIT_THREE' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END
$$;
REVOKE ALL ON FUNCTION public.ai_market_limit_vendor_claims() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS ai_market_limit_vendor_claims_before_insert ON public.ai_market_vendor_claims;
CREATE TRIGGER ai_market_limit_vendor_claims_before_insert BEFORE INSERT
 ON public.ai_market_vendor_claims FOR EACH ROW EXECUTE FUNCTION public.ai_market_limit_vendor_claims();
-- No authenticated UPDATE/DELETE; review decisions only through protected operator/service role.
-- Claims and sponsored rankings remain separate financial and editorial states.

-- On approval, one product must have one verified representative company.
-- Competing submissions can remain pending for independent dispute resolution.
CREATE UNIQUE INDEX IF NOT EXISTS ai_market_only_one_verified_owner
 ON public.ai_market_vendor_claims(product_id)
 WHERE status IN ('identity_verified','approved');

-- Server-side reviewer access is service_role ONLY. The ordinary logged-in
-- user is not granted read of competing claims, review notes or audit events.
GRANT SELECT,UPDATE ON public.ai_market_vendor_claims TO service_role;
CREATE TABLE IF NOT EXISTS public.ai_market_vendor_review_events(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 claim_id uuid NOT NULL REFERENCES public.ai_market_vendor_claims(id) ON DELETE CASCADE,
 reviewer_id uuid NOT NULL REFERENCES auth.users(id),
 from_status text NOT NULL,
 to_status text NOT NULL,
 reason text NOT NULL CHECK(char_length(reason) BETWEEN 12 AND 1000),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX IF NOT EXISTS ai_market_vendor_review_events_claim_time
 ON public.ai_market_vendor_review_events(claim_id,created_at DESC);
ALTER TABLE public.ai_market_vendor_review_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_vendor_review_events FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON public.ai_market_vendor_review_events TO service_role;

-- Atomic audit event: any service-role status change without a named reviewer,
-- timestamp and substantive written reason fails in the SAME transaction.
CREATE OR REPLACE FUNCTION public.ai_market_record_vendor_claim_review()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $record$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status THEN
  IF NEW.reviewer_id IS NULL OR NEW.reviewed_at IS NULL OR
     NEW.review_note IS NULL OR char_length(pg_catalog.btrim(NEW.review_note))<12 THEN
    RAISE EXCEPTION 'REVIEW_PROOF_REQUIRED' USING ERRCODE='23514';
  END IF;
  IF NOT (
    (OLD.status='pending_review' AND NEW.status IN ('identity_verified','approved','rejected'))
    OR (OLD.status='identity_verified' AND NEW.status IN ('approved','rejected'))
    OR (OLD.status='approved' AND NEW.status='revoked')
  ) THEN
   RAISE EXCEPTION 'INVALID_REVIEW_TRANSITION' USING ERRCODE='23514';
  END IF;
  INSERT INTO public.ai_market_vendor_review_events(claim_id,reviewer_id,from_status,to_status,reason)
  VALUES(NEW.id,NEW.reviewer_id,OLD.status,NEW.status,NEW.review_note);
 END IF;
 RETURN NEW;
END
$record$;
REVOKE ALL ON FUNCTION public.ai_market_record_vendor_claim_review() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS ai_market_vendor_review_audit_trigger ON public.ai_market_vendor_claims;
CREATE TRIGGER ai_market_vendor_review_audit_trigger
 AFTER UPDATE OF status ON public.ai_market_vendor_claims
 FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM NEW.status)
 EXECUTE FUNCTION public.ai_market_record_vendor_claim_review();
