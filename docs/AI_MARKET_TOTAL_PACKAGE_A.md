# LINGXIFIELD — Total Package A: Global AI Data Center

Branch: feature/ai-market-review-gate-20261029
Status: SOURCE DELIVERED / INTEGRATION AND STAGING ACCEPTANCE PENDING
No automatic production migration or public deployment.

## Architecture

Data entities: company, product, model, version. Stable IDs contain entity class, approved source namespace and upstream ID. 
Import status: candidate only. Manual review is a separate capability and must never be inferred from import success.
Evidence: official source URL, capture timestamp, SHA-256 digest and raw captured payload.
Public search: verified entities only. A Hub repository is not automatically a standalone company, and OpenAlex institutions are not automatically commercial AI vendors.

## New files

- lib/ai-market-data-center.mjs + d.mts + tests
- scripts/ai-market/data-center-source-adapters.mjs + tests
- scripts/ai-market/data-center-batch.mjs + tests
- supabase/migrations/20261029_ai_market_data_center_a.sql
- CI adds all three suites

Existing branch modules provide candidate management UI, review feedback, bounded PostgREST queries and an isolated legacy candidate importer. Do not claim the new source-aware SQL schema is wired into those legacy routes yet: it is not.

## Commands

Run from a worktree synchronized to the new commit:

```powershell
node --test lib/ai-market-data-center.test.mjs scripts/ai-market/data-center-source-adapters.test.mjs scripts/ai-market/data-center-batch.test.mjs
corepack.cmd pnpm exec tsc --noEmit
corepack.cmd pnpm build
```

Actual candidate collection (network + provider rate limits apply):

```powershell
node scripts/ai-market/data-center-batch.mjs huggingface-models data/ai-market/models-a.json 20
node scripts/ai-market/data-center-batch.mjs huggingface-spaces data/ai-market/spaces-a.json 20
node scripts/ai-market/data-center-batch.mjs openalex-institutions data/ai-market/research-a.json 20
```

The commands capture data to isolated local JSON files; there is no production database write. OpenAlex rate limits and key requirements must be respected. Review source licenses and data-retention terms.

## Gate A before sign-off

- Run all tests and Next.js production build on the branch; capture logs with commit SHA.
- Apply migration only to isolated staging, then test constraints, row-level security, service-role isolation, rollback and indexes.
- Connect data-center schema to a server-only transactional import with source run logging and per-record evidence.
- Add authenticated, paginated queries against the new tables and an operator review UI with real data.
- Test large batch performance and query plans on representative non-public synthetic fixtures; no fake results on public rankings.
- Measure the cost and limits of each provider. Do not spin up paid resources or schedule unattended large crawls without authorization.
- Validate source and link accuracy; distinguish metric timestamps, regional reach and comparable units before rankings.
- Resolve package overlap with earlier ai_market_candidates and ai_market_entities staging tables before production migrations.
- Confirm nine-language routing, source labels and SEO noindex policies for unverified profiles.

## References

Hugging Face official Hub API: https://huggingface.co/docs/hub/api
OpenAlex official API: https://help.openalex.org/api/
OpenAlex paging: https://help.openalex.org/api/paging/
OpenAlex authentication/rates: https://help.openalex.org/api/authentication/

## Remaining B-H packages

B. Actual trend metrics + history + comparable rankings
C. Human-question-to-tool intent search + task cost model
D. SEO/GEO measurable ranking methodology
E. Product/company detail, provenance, reviews
F. Claiming, sponsored placement, CNY/USD billing and audited payment reconciliation
G. Nine-language SEO, RTL, mobile UX and translation QA
H. End-to-end security/performance, migrations, preview, rollback and production readiness

A complete platform requires the evidence-based data supply, payment and full-system gates, not merely the existence of eight source folders.
