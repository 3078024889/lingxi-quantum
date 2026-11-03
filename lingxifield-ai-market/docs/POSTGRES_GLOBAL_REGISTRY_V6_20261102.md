# Global publisher registry — normalized PostgreSQL storage (not yet live)
Added staged migration `supabase/migrations/20261102140000_ai_market_global_registry_staging.sql`.
Tables are purposefully named `_v1` and are NOT automatically populated, exposed by a remote API or linked to the 32-product in-memory graph until migration + backfill + authorization are separately approved.

- `ai_market_publishers_v1`: one stable publisher ID, legal company / open-source project / library kind, source-linked verified publication.
- `ai_market_products_v1`: many products per publisher, foreign key, independent release status.
- `ai_market_product_facts_v1`: seven required source/date/reviewer facts for publishing; explicit `not_applicable` reason rather than fake prices.
- `ai_market_model_rate_offers_v1`: model service channel, currency, rate unit and region-specific pricing, only publisher-reviewed rates visible.
- `ai_market_intake_batches_v1`: isolated ingestion queue, default 10 per batch, never anonymous.
All tables have RLS and restricted grants, and publishing a product under an unapproved company or missing facts is rejected. Retiring a company hides its products and offers via RLS immediately without deleting their history.

### Deployment boundary
This is an **isolated schema** design and test, not a production migration; no live data changed. Future production API must use indexed paginated SQL queries rather than importing all 100K+ records into Next.js runtime, and implement versioned, backfilled reconciliation against the current canonical catalog before activation. Do not expose candidate rows or client writes.
