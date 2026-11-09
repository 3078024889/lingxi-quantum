-- Restore the requested five-thousand-character seller description limit.
-- No listings, payments, orders or media records are modified.
-- This migration fails atomically rather than truncating existing descriptions.
DO $guard$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.sasi_market_listings
    WHERE char_length(description) > 5000
  ) THEN
    RAISE EXCEPTION 'SASI_DESCRIPTION_OVER_5000: resolve existing listings before tightening constraint';
  END IF;
END
$guard$;

ALTER TABLE public.sasi_market_listings
  DROP CONSTRAINT IF EXISTS sasi_market_listings_description_check,
  ADD CONSTRAINT sasi_market_listings_description_check
    CHECK (char_length(description) <= 5000);
