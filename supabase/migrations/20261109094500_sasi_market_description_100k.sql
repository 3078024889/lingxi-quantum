-- SASI software descriptions may contain up to 100,000 Unicode characters.
-- Preserves all existing seller records, review results, images, sales, and orders.
-- A single ALTER statement changes the constraint atomically.
ALTER TABLE public.sasi_market_listings
  DROP CONSTRAINT IF EXISTS sasi_market_listings_description_check,
  ADD CONSTRAINT sasi_market_listings_description_check
    CHECK (char_length(description) <= 100000);
