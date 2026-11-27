-- Query-path indexes and equivalent RLS policy consolidation for the SASI marketplace.
-- No rows, balances, orders, entitlements, payment flags or payout states are changed.
BEGIN;

-- Evaluate auth.uid() once per statement rather than once per row.
ALTER POLICY sasi_v5_route_owner_read ON public.sasi_v5_route_decisions
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY sasi_v5_signal_owner_read ON public.sasi_v5_outcome_signals
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY sasi_v5_dna_owner_read ON public.sasi_v5_project_dna
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY sasi_v5_assets_owner_read ON public.sasi_v5_approved_assets
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY sasi_v5_validation_owner_read ON public.sasi_v5_visual_validations
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY sasi_v5_assignment_owner_read ON public.sasi_v5_experiment_assignments
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY sasi_intelligence_runs_select_own ON public.sasi_intelligence_runs
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY nutrition_history_own_select ON public.nutrition_meal_history
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY nutrition_history_own_insert ON public.nutrition_meal_history
  WITH CHECK ((SELECT auth.uid()) = user_id);
ALTER POLICY "own sasi tasks read" ON public.sasi_tasks
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "own sasi task nodes read" ON public.sasi_task_nodes
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "own sasi task events read" ON public.sasi_task_events
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "own sasi artifacts read" ON public.sasi_artifacts
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY "own sasi capability runs read" ON public.sasi_capability_runs
  USING ((SELECT auth.uid()) = user_id);
ALTER POLICY sasi_native_runs_owner_read ON public.sasi_native_runs
  USING ((SELECT auth.uid()) = user_id);

-- Collapse the two equivalent-permission SELECT paths into one policy per table.
-- Seller-owned drafts remain visible to their owner; public rows remain published+clean only.
DROP POLICY IF EXISTS sasi_market_listings_own_select ON public.sasi_market_listings;
DROP POLICY IF EXISTS sasi_market_listings_public ON public.sasi_market_listings;
CREATE POLICY sasi_market_listings_visible_read ON public.sasi_market_listings
  FOR SELECT TO anon, authenticated
  USING (
    (status = 'published' AND scan_status = 'clean')
    OR seller_id = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS sasi_market_media_own_select ON public.sasi_market_media;
DROP POLICY IF EXISTS sasi_market_media_published ON public.sasi_market_media;
CREATE POLICY sasi_market_media_visible_read ON public.sasi_market_media
  FOR SELECT TO anon, authenticated
  USING (
    seller_id = (SELECT auth.uid())
    OR (
      status = 'approved'
      AND EXISTS (
        SELECT 1
        FROM public.sasi_market_listings l
        WHERE l.id = sasi_market_media.listing_id
          AND l.status = 'published'
          AND l.scan_status = 'clean'
      )
    )
  );

-- Cover the observed buyer/seller history, listing join, media owner and audit queries.
-- The leading FK columns are indexed for referential checks as well.
CREATE INDEX IF NOT EXISTS sasi_market_sales_buyer_created_idx
  ON public.sasi_market_sales (buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sasi_market_sales_listing_created_idx
  ON public.sasi_market_sales (listing_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sasi_market_sales_seller_created_idx
  ON public.sasi_market_sales (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sasi_market_media_seller_created_idx
  ON public.sasi_market_media (seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sasi_market_review_events_actor_created_idx
  ON public.sasi_market_review_events (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS sasi_market_payouts_seller_requested_idx
  ON public.sasi_market_payouts (seller_id, requested_at DESC);

COMMIT;
