-- Least-privilege intake. Public can request review ONLY via this bounded function.
-- Data tables remain private; callers cannot approve claims or edit profiles.
CREATE OR REPLACE FUNCTION public.ai_market_submit_vendor_submission(p_document jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 v_type text; v_product text; v_project text; v_site text; v_email text;
 v_name text; v_source text; v_description text; v_links jsonb;
 v_existing integer;
BEGIN
 IF jsonb_typeof(p_document) IS DISTINCT FROM 'object' OR octet_length(p_document::text)>6500
 THEN RAISE EXCEPTION 'INVALID_SUBMISSION'; END IF;
 v_type:=p_document->>'request_type'; v_product:=trim(p_document->>'product_name');
 v_project:=trim(p_document->>'project_id'); v_site:=trim(p_document->>'official_site');
 v_email:=lower(trim(p_document->>'work_email'));v_name:=trim(p_document->>'submitter_name');
 v_source:=trim(p_document->>'evidence_url');v_description:=coalesce(p_document->>'description','');
 v_links:=coalesce(p_document->'proposed_data','{}'::jsonb);
 IF v_type NOT IN ('claim','update','list') OR v_product IS NULL OR length(v_product) NOT BETWEEN 1 AND 160
 OR v_project IS NULL OR length(v_project) NOT BETWEEN 1 AND 120
 OR v_site IS NULL OR v_site !~ '^https://[A-Za-z0-9][A-Za-z0-9.-]+(/|$)'
 OR length(v_site)>512 OR v_source IS NULL OR v_source !~ '^https://[A-Za-z0-9][A-Za-z0-9.-]+(/|$)'
 OR length(v_source)>512 OR v_email IS NULL OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[A-Za-z]{2,}$'
 OR length(v_email)>254 OR v_name IS NULL OR length(v_name) NOT BETWEEN 1 AND 120
 OR length(v_description)>1200 OR jsonb_typeof(v_links)<>'object'
 THEN RAISE EXCEPTION 'INVALID_SUBMISSION'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_each_text(v_links) AS l(k,v)
  WHERE l.k NOT IN ('x','windows','mac','ios','android','team','funding')
    OR l.v !~ '^https://[A-Za-z0-9][A-Za-z0-9.-]+(/|$)' OR length(l.v)>512)
 THEN RAISE EXCEPTION 'INVALID_LINK'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(v_email,0));
 SELECT count(*) INTO v_existing FROM public.ai_market_vendor_submissions
  WHERE work_email=v_email AND created_at>now()-interval '1 day';
 IF v_existing>=3 THEN RAISE EXCEPTION 'RATE_LIMITED'; END IF;
 INSERT INTO public.ai_market_vendor_submissions
 (project_id,request_type,product_name,official_site,work_email,submitter_name,
 description,proposed_data,evidence_url,status,verified_domain)
 VALUES(v_project,v_type,v_product,v_site,v_email,v_name,v_description,v_links,v_source,'pending_identity_check',false)
 ON CONFLICT DO NOTHING;
 RETURN jsonb_build_object('accepted',true,'reviewRequired',true);
END $$;
REVOKE ALL ON FUNCTION public.ai_market_submit_vendor_submission(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_market_submit_vendor_submission(jsonb) TO anon,authenticated,service_role;
