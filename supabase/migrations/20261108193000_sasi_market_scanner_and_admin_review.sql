-- Private software marketplace: verified scan evidence + atomic human review.
-- No live payment flags, orders, seller payouts, or historical rights are modified.
BEGIN;
-- Once a seller submits a package, freeze its price, title and description.
-- Only the server-side submission endpoint may transition draft to submitted.
DROP POLICY IF EXISTS sasi_market_listings_draft_update ON public.sasi_market_listings;
CREATE POLICY sasi_market_listings_draft_update ON public.sasi_market_listings
 FOR UPDATE TO authenticated
 USING(seller_id=(SELECT auth.uid()) AND status='draft')
 WITH CHECK(seller_id=(SELECT auth.uid()) AND status='draft'
  AND scan_status='unscanned' AND delivery_path IS NULL AND published_at IS NULL);
CREATE TABLE IF NOT EXISTS public.sasi_market_scan_reports (
  listing_id uuid PRIMARY KEY REFERENCES public.sasi_market_listings(id) ON DELETE RESTRICT,
  quarantine_path text NOT NULL,
  approved_path text,
  sha256 text CHECK (sha256 IS NULL OR sha256 ~ '^[0-9a-f]{64}$'),
  scan_status text NOT NULL CHECK(scan_status IN ('clean','infected','scan_failed')),
  scanner_version text NOT NULL CHECK(length(scanner_version) BETWEEN 4 AND 100),
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clean_requires_approved_object CHECK (
    scan_status <> 'clean' OR (approved_path IS NOT NULL AND sha256 IS NOT NULL)
  )
);
CREATE TABLE IF NOT EXISTS public.sasi_market_review_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 subject_type text NOT NULL CHECK(subject_type IN ('seller','listing','media')),
 subject_id uuid NOT NULL,
 action text NOT NULL CHECK(length(action) BETWEEN 4 AND 40),
 reason text NOT NULL DEFAULT '' CHECK(length(reason) <= 500),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sasi_market_review_events_subject_idx
 ON public.sasi_market_review_events(subject_type,subject_id,created_at DESC);
ALTER TABLE public.sasi_market_scan_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sasi_market_review_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sasi_market_scan_reports,public.sasi_market_review_events FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.sasi_market_scan_reports TO service_role;
GRANT SELECT,INSERT ON public.sasi_market_review_events TO service_role;

CREATE OR REPLACE FUNCTION public.sasi_market_record_scan(
 p_listing_id uuid,p_quarantine_path text,p_status text,
 p_sha256 text,p_approved_path text,p_report jsonb,p_scanner_version text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE rec public.sasi_market_listings%ROWTYPE; path_prefix text;
BEGIN
 IF p_status NOT IN ('clean','infected','scan_failed')
  OR length(coalesce(p_scanner_version,'')) NOT BETWEEN 4 AND 100
  OR jsonb_typeof(p_report) IS DISTINCT FROM 'object'
  OR pg_column_size(p_report)>8192
 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_SCAN_REPORT'); END IF;
 SELECT * INTO rec FROM public.sasi_market_listings WHERE id=p_listing_id FOR UPDATE;
 IF NOT FOUND OR rec.status <> 'submitted' OR rec.quarantine_path IS DISTINCT FROM p_quarantine_path
 THEN RETURN jsonb_build_object('ok',false,'error','SUBMISSION_NOT_READY'); END IF;
 IF rec.scan_status <> 'unscanned' THEN
  IF rec.scan_status=p_status AND EXISTS(
   SELECT 1 FROM public.sasi_market_scan_reports sr
   WHERE sr.listing_id=p_listing_id AND sr.sha256 IS NOT DISTINCT FROM p_sha256
     AND sr.approved_path IS NOT DISTINCT FROM p_approved_path)
  THEN RETURN jsonb_build_object('ok',true,'alreadyRecorded',true); END IF;
  RETURN jsonb_build_object('ok',false,'error','SCAN_ALREADY_FINAL');
 END IF;
 path_prefix='sasi/'||rec.seller_id::text||'/market/'||rec.id::text||'/approved/';
 IF p_status='clean' THEN
  IF p_sha256 !~ '^[0-9a-f]{64}$'
     OR p_approved_path IS NULL OR left(p_approved_path,length(path_prefix))<>path_prefix
     OR p_approved_path !~ '\.zip$' OR position('..' in p_approved_path)>0
  THEN RETURN jsonb_build_object('ok',false,'error','INVALID_APPROVED_ARTIFACT'); END IF;
 ELSE
  IF p_approved_path IS NOT NULL OR p_sha256 IS NOT NULL
  THEN RETURN jsonb_build_object('ok',false,'error','FAILED_SCAN_MUST_NOT_APPROVE'); END IF;
 END IF;
 INSERT INTO public.sasi_market_scan_reports
  (listing_id,quarantine_path,approved_path,sha256,scan_status,report,scanner_version)
 VALUES(p_listing_id,p_quarantine_path,p_approved_path,p_sha256,p_status,p_report,p_scanner_version)
 ON CONFLICT(listing_id) DO NOTHING;
 UPDATE public.sasi_market_listings
 SET scan_status=p_status,sha256=CASE WHEN p_status='clean' THEN p_sha256 ELSE NULL END,
 delivery_path=CASE WHEN p_status='clean' THEN p_approved_path ELSE NULL END,
 updated_at=now()
 WHERE id=p_listing_id AND status='submitted' AND scan_status='unscanned';
 IF NOT FOUND THEN RAISE EXCEPTION 'SCAN_RACE'; END IF;
 RETURN jsonb_build_object('ok',true,'status',p_status);
END;$$;
REVOKE ALL ON FUNCTION public.sasi_market_record_scan(uuid,text,text,text,text,jsonb,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_market_record_scan(uuid,text,text,text,text,jsonb,text) TO service_role;

CREATE OR REPLACE FUNCTION public.sasi_market_review_seller(
 p_seller_id uuid,p_actor_id uuid,p_action text,p_reason text DEFAULT ''
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE s public.sasi_market_sellers%ROWTYPE;
BEGIN
 IF p_actor_id IS NULL OR length(coalesce(p_reason,''))>500 OR
 p_action NOT IN ('approve','suspend')
 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_REVIEW'); END IF;
 SELECT * INTO s FROM public.sasi_market_sellers WHERE user_id=p_seller_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','SELLER_NOT_FOUND'); END IF;
 IF p_action='approve' AND s.status NOT IN ('pending_review','suspended') THEN
  RETURN jsonb_build_object('ok',false,'error','SELLER_ALREADY_REVIEWED'); END IF;
 IF p_action='suspend' AND (s.status<>'approved' OR length(trim(coalesce(p_reason,'')))<8) THEN
  RETURN jsonb_build_object('ok',false,'error','SUSPENSION_REASON_REQUIRED'); END IF;
 UPDATE public.sasi_market_sellers SET status=CASE WHEN p_action='approve' THEN 'approved' ELSE 'suspended' END,
 updated_at=now() WHERE user_id=p_seller_id;
 INSERT INTO public.sasi_market_review_events(actor_id,subject_type,subject_id,action,reason)
 VALUES(p_actor_id,'seller',p_seller_id,p_action,coalesce(p_reason,''));
 RETURN jsonb_build_object('ok',true,'status',CASE WHEN p_action='approve' THEN 'approved' ELSE 'suspended' END);
END;$$;
REVOKE ALL ON FUNCTION public.sasi_market_review_seller(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_market_review_seller(uuid,uuid,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.sasi_market_review_media(
 p_media_id uuid,p_actor_id uuid,p_action text,p_reason text DEFAULT ''
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE m public.sasi_market_media%ROWTYPE; l public.sasi_market_listings%ROWTYPE;
BEGIN
 IF p_actor_id IS NULL OR p_action NOT IN ('approve','reject') OR length(coalesce(p_reason,''))>500
 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_REVIEW'); END IF;
 SELECT * INTO m FROM public.sasi_market_media WHERE id=p_media_id FOR UPDATE;
 IF NOT FOUND OR m.status <> 'awaiting_review' OR m.verified_size IS NULL
 THEN RETURN jsonb_build_object('ok',false,'error','MEDIA_NOT_READY'); END IF;
 SELECT * INTO l FROM public.sasi_market_listings WHERE id=m.listing_id;
 IF NOT FOUND OR l.status NOT IN ('draft','submitted')
 THEN RETURN jsonb_build_object('ok',false,'error','LISTING_NOT_EDITABLE'); END IF;
 IF p_action='reject' AND length(trim(coalesce(p_reason,'')))<8
 THEN RETURN jsonb_build_object('ok',false,'error','REJECTION_REASON_REQUIRED'); END IF;
 UPDATE public.sasi_market_media SET status=CASE WHEN p_action='approve' THEN 'approved' ELSE 'rejected' END,
 reviewed_at=now() WHERE id=p_media_id;
 INSERT INTO public.sasi_market_review_events(actor_id,subject_type,subject_id,action,reason)
 VALUES(p_actor_id,'media',p_media_id,p_action,coalesce(p_reason,''));
 RETURN jsonb_build_object('ok',true,'status',CASE WHEN p_action='approve' THEN 'approved' ELSE 'rejected' END);
END;$$;
REVOKE ALL ON FUNCTION public.sasi_market_review_media(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_market_review_media(uuid,uuid,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.sasi_market_review_listing(
 p_listing_id uuid,p_actor_id uuid,p_action text,p_reason text DEFAULT ''
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE l public.sasi_market_listings%ROWTYPE; approved_count bigint;
BEGIN
 IF p_actor_id IS NULL OR p_action NOT IN ('publish','reject') OR length(coalesce(p_reason,''))>500
 THEN RETURN jsonb_build_object('ok',false,'error','INVALID_REVIEW'); END IF;
 SELECT * INTO l FROM public.sasi_market_listings WHERE id=p_listing_id FOR UPDATE;
 IF NOT FOUND OR l.status<>'submitted'
 THEN RETURN jsonb_build_object('ok',false,'error','LISTING_NOT_SUBMITTED'); END IF;
 IF p_action='reject' THEN
  IF length(trim(coalesce(p_reason,'')))<8
  THEN RETURN jsonb_build_object('ok',false,'error','REJECTION_REASON_REQUIRED'); END IF;
  UPDATE public.sasi_market_listings SET status='rejected',rejection_reason=p_reason,
    reviewed_at=now(),updated_at=now() WHERE id=p_listing_id;
 ELSE
  IF NOT EXISTS(SELECT 1 FROM public.sasi_market_sellers s WHERE s.user_id=l.seller_id AND s.status='approved')
    OR l.scan_status<>'clean' OR l.sha256 !~ '^[0-9a-f]{64}$'
    OR l.delivery_path IS NULL
    OR NOT EXISTS(SELECT 1 FROM public.sasi_market_scan_reports r
      WHERE r.listing_id=l.id AND r.scan_status='clean' AND r.sha256=l.sha256
        AND r.approved_path=l.delivery_path AND r.quarantine_path=l.quarantine_path)
  THEN RETURN jsonb_build_object('ok',false,'error','SECURITY_SCAN_OR_SELLER_NOT_APPROVED'); END IF;
  SELECT count(*) INTO approved_count FROM public.sasi_market_media
   WHERE listing_id=l.id AND status='approved' AND kind='cover';
  IF approved_count<1 OR EXISTS(
    SELECT 1 FROM public.sasi_market_media WHERE listing_id=l.id AND status IN ('pending','awaiting_review')
  ) THEN RETURN jsonb_build_object('ok',false,'error','COVER_OR_MEDIA_REVIEW_PENDING'); END IF;
  UPDATE public.sasi_market_listings SET status='published',reviewed_at=now(),
    published_at=now(),rejection_reason=NULL,updated_at=now()
  WHERE id=p_listing_id;
 END IF;
 INSERT INTO public.sasi_market_review_events(actor_id,subject_type,subject_id,action,reason)
 VALUES(p_actor_id,'listing',p_listing_id,p_action,coalesce(p_reason,''));
 RETURN jsonb_build_object('ok',true,'status',CASE WHEN p_action='publish' THEN 'published' ELSE 'rejected' END);
END;$$;
REVOKE ALL ON FUNCTION public.sasi_market_review_listing(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sasi_market_review_listing(uuid,uuid,text,text) TO service_role;
COMMIT;
