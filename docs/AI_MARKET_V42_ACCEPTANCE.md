# AI Market V4.2: staging deployment and acceptance

Branch: feature/ai-market-review-gate-20261029
No main merge or production deployment has been performed by this work.

## Scope
- Administrator-only GET/POST /api/ai-market/review-feedback
- Append-only review records in public.ai_market_review_records
- Admin review UI for submitting and reading version feedback
- Review gate scripts and input validation tests

## Commands (isolated branch, after installing dependencies)
```bash
node --test scripts/ai-market/audit-review-gate.test.mjs
node --test lib/ai-market-review-validation.test.mjs
pnpm exec tsc --noEmit
pnpm build
```

## Database staging migration
Review supabase/migrations/20261029_ai_market_review_records.sql first.
Apply only to a **staging** Supabase environment and confirm actor_id references auth.users.
The table revokes anon/authenticated access, enables RLS, and is read/written only through service-role on an API that checks moneyAdministrator().
Do not apply a staging schema change automatically to production.

## Permission checks
1. Anonymous GET/POST should return 403.
2. Logged-in non-admin should return 403.
3. Admin with unverified email should return 403.
4. Admin with valid session can list and create feedback for the current version.
5. Cross-origin POST should return 403.
6. Overlength payload should return 413, invalid feedback returns 400.
7. Missing schema/database error returns 503; never fall back to public writes.
8. Every record stores actor_id and timestamp; users cannot set actor_id through JSON.
9. No API path can set release approval, alter rankings, charge cards, or publish the site.

## Remaining before staging READY
- The full Next.js build has not been executed here. Run commands above.
- Wire data provenance and version checks to actual ingestion/publishing pipeline.
- Implement immutable review audit log and a separate, two-person release approval if needed.
- Test migration and rollback on a staging Supabase project.
- Cross-check existing codex preview deployment and the current production branch to prevent regressions.
