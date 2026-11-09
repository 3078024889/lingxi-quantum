-- SASI public cards: bound response size independently of seller long-form descriptions.
-- SECURITY INVOKER preserves underlying RLS; only approved, scanned publications are visible.
-- Seller drafts, installation archives, secrets and personal order data are excluded.
CREATE OR REPLACE VIEW public.sasi_market_public_cards
WITH (security_invoker = true, security_barrier = true)
AS
SELECT
  id, seller_id, title,
  left(coalesce(description, ''), 800)::text AS description,
  category, price_cny_minor, price_usd_minor,
  status, scan_status, published_at, created_at
FROM public.sasi_market_listings
WHERE status = 'published'
  AND scan_status = 'clean';

REVOKE ALL ON public.sasi_market_public_cards FROM PUBLIC;
GRANT SELECT ON public.sasi_market_public_cards TO anon, authenticated;
COMMENT ON VIEW public.sasi_market_public_cards IS
  'Public-only 800-character previews; full 100,000-character product descriptions remain in the secure detail endpoint.';
