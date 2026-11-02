-- Global SIAI normalized publisher / product / verified facts / model rate storage.
-- Schema only: no import, no production write, no automatic publication.
-- Primary keys are stable editorial slugs. One publisher may own many products.
CREATE TABLE IF NOT EXISTS public.ai_market_publishers_v1(
 publisher_key text PRIMARY KEY CHECK(publisher_key ~ '^[a-z][a-z0-9-]{1,79}$'),
 name text NOT NULL CHECK(char_length(btrim(name)) BETWEEN 2 AND 160),
 kind text NOT NULL CHECK(kind IN ('company','open_source_project','software_library')),
 official_source text NOT NULL CHECK(official_source ~ '^https://'),
 country_code text CHECK(country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
 founded_year smallint CHECK(founded_year IS NULL OR founded_year BETWEEN 1800 AND 2100),
 publication_state text NOT NULL DEFAULT 'candidate'
   CHECK(publication_state IN ('candidate','published','retired')),
 review_source text CHECK(review_source IS NULL OR review_source ~ '^https://'),
 reviewed_by uuid REFERENCES auth.users(id),
 reviewed_at timestamptz,
 published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(publication_state <> 'published' OR (
  review_source IS NOT NULL AND reviewed_by IS NOT NULL
  AND reviewed_at IS NOT NULL AND published_at IS NOT NULL
 )),
 CHECK(publication_state <> 'candidate' OR published_at IS NULL)
);
CREATE INDEX IF NOT EXISTS ai_market_publishers_v1_visibility
 ON public.ai_market_publishers_v1(publication_state,publisher_key);
ALTER TABLE public.ai_market_publishers_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_publishers_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.ai_market_publishers_v1 TO anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.ai_market_publishers_v1 TO service_role;
CREATE POLICY ai_market_publishers_v1_public ON public.ai_market_publishers_v1
 FOR SELECT TO anon,authenticated USING(publication_state='published');

CREATE TABLE IF NOT EXISTS public.ai_market_products_v1(
 product_key text PRIMARY KEY CHECK(product_key ~ '^[a-z][a-z0-9-]{1,79}$'),
 publisher_key text NOT NULL REFERENCES public.ai_market_publishers_v1(publisher_key) ON DELETE RESTRICT,
 name text NOT NULL CHECK(char_length(btrim(name)) BETWEEN 2 AND 160),
 category text NOT NULL CHECK(char_length(btrim(category)) BETWEEN 2 AND 80),
 official_url text NOT NULL CHECK(official_url ~ '^https://'),
 publication_state text NOT NULL DEFAULT 'candidate'
   CHECK(publication_state IN ('candidate','published','retired')),
 reviewed_by uuid REFERENCES auth.users(id),
 reviewed_at timestamptz,
 published_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(publication_state <> 'published' OR
  (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL AND published_at IS NOT NULL)),
 CHECK(publication_state <> 'candidate' OR published_at IS NULL)
);
CREATE INDEX IF NOT EXISTS ai_market_products_v1_publisher
 ON public.ai_market_products_v1(publisher_key,publication_state);
CREATE INDEX IF NOT EXISTS ai_market_products_v1_visibility
 ON public.ai_market_products_v1(publication_state,product_key);
ALTER TABLE public.ai_market_products_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_products_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.ai_market_products_v1 TO anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.ai_market_products_v1 TO service_role;
CREATE POLICY ai_market_products_v1_public ON public.ai_market_products_v1
 FOR SELECT TO anon,authenticated USING(publication_state='published'
 AND EXISTS(SELECT 1 FROM public.ai_market_publishers_v1 c
  WHERE c.publisher_key=ai_market_products_v1.publisher_key AND c.publication_state='published'));

CREATE TABLE IF NOT EXISTS public.ai_market_product_facts_v1(
 product_key text NOT NULL REFERENCES public.ai_market_products_v1(product_key) ON DELETE RESTRICT,
 fact_key text NOT NULL CHECK(fact_key IN ('price','free','models','regions','commercial','payment','company')),
 evidence_status text NOT NULL CHECK(evidence_status IN ('verified','not_applicable')),
 fact_text text,
 exclusion_reason text,
 source_url text NOT NULL CHECK(source_url ~ '^https://'),
 checked_at date NOT NULL,
 reviewed_by uuid NOT NULL REFERENCES auth.users(id),
 PRIMARY KEY(product_key,fact_key),
 CHECK(
  (evidence_status='verified' AND char_length(btrim(coalesce(fact_text,'')))>=6 AND exclusion_reason IS NULL)
  OR (evidence_status='not_applicable' AND fact_text IS NULL
    AND char_length(btrim(coalesce(exclusion_reason,'')))>=15)
 )
);
CREATE INDEX IF NOT EXISTS ai_market_product_facts_v1_check_date
 ON public.ai_market_product_facts_v1(checked_at);
ALTER TABLE public.ai_market_product_facts_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_product_facts_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.ai_market_product_facts_v1 TO anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.ai_market_product_facts_v1 TO service_role;
CREATE POLICY ai_market_product_facts_v1_public ON public.ai_market_product_facts_v1
 FOR SELECT TO anon,authenticated USING(
  EXISTS(SELECT 1 FROM public.ai_market_products_v1 p
   JOIN public.ai_market_publishers_v1 c ON c.publisher_key=p.publisher_key
   WHERE p.product_key=ai_market_product_facts_v1.product_key AND p.publication_state='published'
    AND c.publication_state='published'));

-- A publication cannot proceed with six/seven facts, nor under an unreviewed publisher.
-- An editor can later unpublish; all child rows immediately stop being publicly visible.
CREATE OR REPLACE FUNCTION public.ai_market_gate_product_publication_v1()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $gate$
BEGIN
 IF NEW.publication_state='published' AND (TG_OP='INSERT' OR OLD.publication_state<>'published') THEN
  IF NOT EXISTS(SELECT 1 FROM public.ai_market_publishers_v1 c
      WHERE c.publisher_key=NEW.publisher_key AND c.publication_state='published')
  THEN RAISE EXCEPTION 'PUBLISHER_NOT_APPROVED' USING ERRCODE='23514'; END IF;
  IF (SELECT count(DISTINCT fact_key) FROM public.ai_market_product_facts_v1
      WHERE product_key=NEW.product_key)<>7
  THEN RAISE EXCEPTION 'PRODUCT_FACTS_NOT_COMPLETE' USING ERRCODE='23514'; END IF;
 END IF;
 RETURN NEW;
END
$gate$;
REVOKE ALL ON FUNCTION public.ai_market_gate_product_publication_v1() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS ai_market_gate_product_publication_v1 ON public.ai_market_products_v1;
CREATE TRIGGER ai_market_gate_product_publication_v1 BEFORE INSERT OR UPDATE OF publication_state
 ON public.ai_market_products_v1 FOR EACH ROW EXECUTE FUNCTION public.ai_market_gate_product_publication_v1();

CREATE TABLE IF NOT EXISTS public.ai_market_model_rate_offers_v1(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 product_key text NOT NULL REFERENCES public.ai_market_products_v1(product_key) ON DELETE RESTRICT,
 rate_key text NOT NULL CHECK(rate_key ~ '^[a-z0-9][a-z0-9-]{1,120}$'),
 model_name text NOT NULL CHECK(char_length(btrim(model_name)) BETWEEN 2 AND 200),
 service_channel text NOT NULL CHECK(service_channel IN ('token_api','video','api_unit')),
 billing_unit text NOT NULL CHECK(char_length(btrim(billing_unit)) BETWEEN 2 AND 80),
 currency text NOT NULL CHECK(currency IN ('CNY','USD')),
 unit_price numeric(18,8) CHECK(unit_price IS NULL OR unit_price>=0),
 region text CHECK(region IS NULL OR char_length(region)<=100),
 source_url text NOT NULL CHECK(source_url ~ '^https://'),
 checked_at date NOT NULL,
 review_state text NOT NULL DEFAULT 'candidate' CHECK(review_state IN ('candidate','verified','retired')),
 reviewed_by uuid REFERENCES auth.users(id),
 reviewed_at timestamptz,
 UNIQUE(product_key,rate_key),
 CHECK(review_state<>'verified' OR (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ai_market_model_rate_offers_v1_product
 ON public.ai_market_model_rate_offers_v1(product_key,review_state);
CREATE INDEX IF NOT EXISTS ai_market_model_rate_offers_v1_visibility
 ON public.ai_market_model_rate_offers_v1(review_state,checked_at DESC);
ALTER TABLE public.ai_market_model_rate_offers_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_model_rate_offers_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.ai_market_model_rate_offers_v1 TO anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.ai_market_model_rate_offers_v1 TO service_role;
CREATE POLICY ai_market_model_rate_offers_v1_public ON public.ai_market_model_rate_offers_v1
 FOR SELECT TO anon,authenticated USING(review_state='verified'
 AND EXISTS(SELECT 1 FROM public.ai_market_products_v1 p
  JOIN public.ai_market_publishers_v1 c ON c.publisher_key=p.publisher_key
  WHERE p.product_key=ai_market_model_rate_offers_v1.product_key
    AND p.publication_state='published' AND c.publication_state='published'));

-- Intake batches live outside public access; staging is never published automatically.
CREATE TABLE IF NOT EXISTS public.ai_market_intake_batches_v1(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 batch_code text NOT NULL UNIQUE CHECK(batch_code ~ '^B[0-9]{3,}$'),
 planned_products smallint NOT NULL DEFAULT 10 CHECK(planned_products BETWEEN 1 AND 10),
 status text NOT NULL DEFAULT 'staged' CHECK(status IN ('staged','under_review','approved','rejected')),
 reviewer_id uuid REFERENCES auth.users(id),
 reviewed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(status NOT IN ('approved','rejected') OR (reviewer_id IS NOT NULL AND reviewed_at IS NOT NULL))
);
ALTER TABLE public.ai_market_intake_batches_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_intake_batches_v1 FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.ai_market_intake_batches_v1 TO service_role;
-- No public policies: candidate identities and unpublished data are protected.
