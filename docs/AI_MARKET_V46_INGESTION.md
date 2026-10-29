# V4.6 Candidate ingestion: GitHub staging handoff

## Added

- `lib/ai-market-candidate-ingest.mjs`: validate the upstream evidence and map it to database rows.
- `scripts/ai-market/supabase-candidate-import.mjs`: dry-run-first Supabase import.
- `supabase/migrations/20261029_ai_market_candidates.sql`: restricted candidate table.
- `app/api/ai-market/candidates/route.ts`: authenticated, paginated admin browsing.
- `components/ai-market/AiMarketCandidates.tsx`: admin list/search/status UI.

This is **not** an automatic job and does not deploy to production.

## Review / test

```powershell
Set-Location "D:\30780\lingxi-ai-market-preview-v4"
node --test scripts/ai-market/*.test.mjs lib/ai-market-*.test.mjs
corepack.cmd pnpm exec tsc --noEmit
corepack.cmd pnpm build
```

The worktree must first be updated to the latest reviewed branch commit. Do not force-reset if local edits exist.

## Database staging only

Apply `supabase/migrations/20261029_ai_market_candidates.sql` on a disposable staging Supabase project first.
The table enables RLS and disallows anonymous and authenticated direct table access. Server-side access uses a service-role key.
Always keep this key in server environment variables and never commit it.

## Ingestion preview

Discover (this calls the official Hugging Face API):

```powershell
node scripts/ai-market/import-huggingface.mjs models 25 data/ai-market/hf-models.json
node scripts/ai-market/import-huggingface.mjs spaces 25 data/ai-market/hf-spaces.json
```

Dry-run the database import (credentials supplied by approved server environment):

```powershell
node scripts/ai-market/supabase-candidate-import.mjs data/ai-market/hf-models.json
```

Only after the staging migration and audit: add `--commit` for a bounded batch of at most 100 candidates. No candidate will become verified or appear in organic rankings automatically.

The existing file importer merges by candidate ID and can hold more than 100 records cumulatively; the Supabase importer intentionally rejects oversized *per-run* batches. Use explicit bounded batches, not arbitrary truncation.

## Required acceptance before production rollout

1. Run automated test suite and full Next build on the new commit.
2. Check empty database, insert, repeated import, updated candidate, and already verified/rejected rows.
3. Test concurrent imports and non-admin endpoints.
4. Confirm upstream terms, licenses and rate limits, and preserve per-record evidence.
5. Implement durable source snapshot/history tables and review decisions before allowing publishing.
6. Verify user-facing SEO/GEO scores are sourced from measurable validated data, never synthetic values.
7. No production migration, main merge, paid cloud-resource provisioning or payment changes without separate user approval.
