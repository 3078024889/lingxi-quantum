# Zero-additional-cloud-cost validation plan

Never create a paid Supabase branch. Never apply experimental migrations to the connected production database.

Use an isolated local PostgreSQL 17 instance (Docker or an existing free local Postgres install), then execute AI Market migrations in dependency order. For migrations referencing auth.users, use a locally initialized Supabase stack (supabase start) rather than plain Postgres without auth schema. Stop on first failure, preserve logs and reset disposable local data only. Never connect the local migration command to a remote production project.

Free verification:
1. node --test scripts/ai-market/total-package-preflight.test.mjs
2. node scripts/ai-market/total-package-preflight.mjs
3. pnpm exec tsc --noEmit && pnpm build (requires local package dependencies)
4. Playwright local Chromium browser and mobile viewport, nine localized routes with assertions for translated UI and Arabic dir=rtl. Never claim this proves all pages until their scopes are included.
5. Docker memory constraint 2 GiB on the Next.js runtime; record real peak RSS and failed requests.
6. Official Hugging Face public API within terms/rate limits. Candidate records are unverified until reviewed.
7. Provider webhooks must be verified against official sandbox credentials before activating an order. Unit tests of mock webhooks do not constitute a captured/refunded payment.

No actual local execution or browser validation is asserted by this document; run commands on an isolated local runner or accessible CI with explicit logs.
