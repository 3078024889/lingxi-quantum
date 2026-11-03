-- Sponsored visibility is independent of organic market ranks.
-- Payments are not accepted or declared successful by any client request.
CREATE TABLE IF NOT EXISTS public.ai_market_sponsored_disclosure(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 project_id text NOT NULL CHECK(length(project_id) BETWEEN 1 AND 120),
 label text NOT NULL CHECK(length(label) BETWEEN 1 AND 100),
 target_url text NOT NULL CHECK(target_url ~ '^https://'),
 placement text NOT NULL CHECK(placement IN ('home_feature','category_feature','search_feature')),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','active','ended','rejected')),
 provider text CHECK(provider IN ('paypal','alipay','wechat')),
 payment_reference text,
 paid_verified_at timestamptz,
 reviewer uuid REFERENCES auth.users(id),
 reviewed_at timestamptz,
 starts_at timestamptz,
 ends_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(ends_at IS NULL OR starts_at IS NOT NULL AND ends_at>starts_at),
 CHECK(status<>'active' OR (
  reviewer IS NOT NULL AND reviewed_at IS NOT NULL
  AND provider IS NOT NULL AND length(payment_reference)>2
  AND paid_verified_at IS NOT NULL AND starts_at IS NOT NULL AND ends_at IS NOT NULL
 ))
);
CREATE INDEX IF NOT EXISTS ai_market_sponsored_active_slots ON public.ai_market_sponsored_disclosure(placement,status,starts_at,ends_at);
ALTER TABLE public.ai_market_sponsored_disclosure ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.ai_market_sponsored_disclosure FROM PUBLIC,anon,authenticated;
GRANT SELECT(project_id,label,target_url,placement,ends_at) ON public.ai_market_sponsored_disclosure TO anon,authenticated;
DROP POLICY IF EXISTS ai_market_sponsored_public_active ON public.ai_market_sponsored_disclosure;
CREATE POLICY ai_market_sponsored_public_active ON public.ai_market_sponsored_disclosure FOR SELECT
 TO anon,authenticated
 USING(status='active' AND paid_verified_at IS NOT NULL AND reviewed_at IS NOT NULL
  AND now()>=starts_at AND now()<ends_at);
-- No public INSERT/UPDATE/DELETE and no RPC to mark payment as successful.
-- Organic search and price score engines never read this table.
