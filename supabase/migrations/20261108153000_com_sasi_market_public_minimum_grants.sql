-- Public SASI software marketplace: grant only the minimum Data API table privileges.
-- Existing row-level security policies remain authoritative for ownership/review.
-- Buyer entitlement, seller approval, moderation, settlement and payout remain service-side.
DO $assert_market_rls$
DECLARE missing text;
BEGIN
  SELECT string_agg(t.table_name, ',') INTO missing
  FROM (VALUES ('sasi_market_sellers'),('sasi_market_listings'),
               ('sasi_market_media'),('sasi_market_sales'),('sasi_market_payouts')) t(table_name)
  LEFT JOIN pg_class c ON c.oid=to_regclass('public.'||t.table_name)
  WHERE c.oid IS NULL OR NOT c.relrowsecurity;
  IF missing IS NOT NULL THEN RAISE EXCEPTION 'MARKET_RLS_MISSING: %',missing; END IF;
END
$assert_market_rls$;

GRANT SELECT ON TABLE public.sasi_market_listings, public.sasi_market_media
  TO anon, authenticated;
GRANT SELECT ON TABLE public.sasi_market_sellers, public.sasi_market_sales,
  public.sasi_market_payouts TO authenticated;
GRANT INSERT ON TABLE public.sasi_market_sellers, public.sasi_market_listings
  TO authenticated;

-- Explicitly deny client-side privilege escalation or direct financial writes.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.sasi_market_sellers FROM anon;
REVOKE UPDATE, DELETE ON TABLE public.sasi_market_sellers FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.sasi_market_sales, public.sasi_market_payouts FROM anon, authenticated;
REVOKE UPDATE, DELETE ON TABLE public.sasi_market_listings, public.sasi_market_media FROM anon, authenticated;
REVOKE INSERT ON TABLE public.sasi_market_media FROM anon, authenticated;
