# SIAI market SQL source

These SQL files are **reviewable migration source**, not deployment commands. The Next.js build, Vercel deploy and Netlify deploy do not execute them. No production Supabase database is changed by this directory or by CI.

## Feedback migration order

For the isolated PostgreSQL 17 CI and any future approved database rollout, apply the feedback migrations in this order:

1. `20261030180000_ai_market_public_feedback.sql` — isolated feedback table and signed public submission RPC.
2. `20261030195000_ai_market_feedback_moderation.sql` — verified moderator identity and private audit trail.
3. `20261101_ai_market_feedback_key_provisioning.sql` — server-role-only signing-key provisioning.
4. `20261101_ai_market_feedback_constant_time_hmac.sql` — fixed-iteration signature comparison.
5. `20261030214500_ai_market_auto_publish.sql` — conservative classifier and auto-publication for new safe submissions; preserves the constant-time HMAC check.

The final step must remain after the constant-time migration: it replaces the public submission function and therefore must preserve the final security implementation.

## Other staged SQL

- `20261030_ai_market_sponsored_disclosure.sql` is an independent sponsored-placement disclosure table. Sponsored placements must never change organic rankings.
- `20261031081500_ai_market_aggregate_coverage.sql` depends on the upstream candidate/source tables. Do not apply it until those prerequisite migrations have been reviewed and applied in the same database.

## Release controls

- CI uses a disposable PostgreSQL 17 service and test-only secrets.
- Production rollout requires a separate reviewed migration plan, current database backup, explicit approval, and post-migration verification.
- Never copy service-role credentials or the feedback HMAC key into browser code, GitHub source, logs, or preview build variables.
