-- Harden SASI marketplace Data API: RLS row restrictions AND column-level grants.
-- Avoid exposing private ZIP object paths, moderation hashes, payout tokens and
-- gateway payment identifiers even on otherwise public/readable listing rows.
REVOKE SELECT, INSERT ON TABLE public.sasi_market_sellers,
  public.sasi_market_listings,public.sasi_market_media,
  public.sasi_market_sales,public.sasi_market_payouts FROM anon,authenticated;

GRANT SELECT (id,seller_id,title,description,category,price_cny_minor,
  price_usd_minor,status,scan_status,published_at,created_at,updated_at)
  ON public.sasi_market_listings TO anon,authenticated;
GRANT INSERT (seller_id,title,description,category,price_cny_minor,price_usd_minor)
  ON public.sasi_market_listings TO authenticated;

GRANT SELECT (id,listing_id,kind,object_key,status,created_at)
  ON public.sasi_market_media TO anon,authenticated;

GRANT SELECT (user_id,display_name,status,kyc_status,payout_provider,created_at,updated_at)
  ON public.sasi_market_sellers TO authenticated;
GRANT INSERT (user_id,display_name,statement_accepted_at)
  ON public.sasi_market_sellers TO authenticated;

GRANT SELECT (order_id,listing_id,seller_id,buyer_id,currency,gross_minor,
  platform_fee_minor,seller_net_minor,status,available_at,created_at)
  ON public.sasi_market_sales TO authenticated;
GRANT SELECT (id,seller_id,currency,amount_minor,status,provider,requested_at,
  submission_target_at,submitted_at,completed_at)
  ON public.sasi_market_payouts TO authenticated;

DO $verify_market_columns$
BEGIN
 IF has_column_privilege('anon','public.sasi_market_listings','delivery_path','SELECT')
  OR has_column_privilege('anon','public.sasi_market_listings','quarantine_path','SELECT')
  OR has_column_privilege('anon','public.sasi_market_listings','sha256','SELECT')
  OR has_column_privilege('authenticated','public.sasi_market_sellers','payout_provider_account_token','SELECT')
  OR has_column_privilege('authenticated','public.sasi_market_sales','provider_payment_id','SELECT')
  OR has_table_privilege('authenticated','public.sasi_market_sales','INSERT')
  OR has_table_privilege('authenticated','public.sasi_market_listings','UPDATE') THEN
    RAISE EXCEPTION 'SASI_MARKET_SENSITIVE_COLUMN_GRANT_STILL_OPEN';
 END IF;
END
$verify_market_columns$;
