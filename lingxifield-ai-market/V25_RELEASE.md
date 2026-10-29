# LINGXIFIELD V2.5 — Total package

Adds immutable evidence-compatible catalog ingestion (not fabricated records), nine indexable-language route **frameworks** with translated headings, catalog API with cursor pagination, and a separate normalized catalog file. Nine-language deep content translation is **not complete**.

Current catalog intentionally contains **0 independently verified records**. Old ten sample platform entries remain in the visual demo and are not described as live rankings.

## Test
`npm.cmd run test:contracts`
`npm.cmd run test:catalog`
`npm.cmd run validate:catalog`
`npm.cmd run build`

## Ingest
`node scripts/import-catalog.mjs ./incoming/checked-products.json`
Only submit legally obtained, reviewed source records, with accurate fields. The import program updates `data/catalog.json` atomically. Redeploy/rebuild required for visibility; no write endpoint is exposed publicly.

## Endpoints
`GET /api/v1/catalog?q=video&limit=24&cursor=0`
`GET /en/ai`, `/zh/ai`, etc.

Production deployment, payment settlement, million-scale indexing, source collection and load testing are NOT included.
