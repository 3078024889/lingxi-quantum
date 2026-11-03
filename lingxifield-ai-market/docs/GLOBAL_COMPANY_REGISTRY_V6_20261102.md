# Global AI publisher registry V6 — code integration (2026-11-02)

Current curated scope: **32 published product records**, not 32 distinct incorporated companies. Stable publisher IDs come from the existing publisher evidence mapping. The graph merges ChatGPT, Whisper and OpenAI Python SDK into **OpenAI**; Claude and Anthropic Python SDK into **Anthropic**. Maintainer/open-source repositories remain separate project or library identities rather than fictitious incorporated companies.

## New endpoints
- `GET /api/v1/companies`: bounded query, type filter (`company|open_source_project|software_library`), cursor/limit and dated publisher source links.
- `GET /api/v1/companies/{publisherId}`: one entity with its curated products and source-backed price offers. 404 for unknown companies, including staging candidates.
- `GET /api/v1/model-offers`: source-backed token rate, video rate and metered API-unit records with product, company, billing unit, region, currency and checked date, not guessed prices.
- `/{lang}/companies`: nine-language public directory cards; grouped by legal company, open-source project and software library, with real product links and publisher-source URLs.

## Scale and ingestion policy
The repository's `data/company-intake/batch-001.json` remains **private, paused and unapproved**; none of its products enter this graph or API. Do not infer a subsidiary by matching website domains; use verified publisher association before publication. Each newly accepted provider gets a stable publisher ID distinct from its product IDs; brands can have multiple products and each product multiple regional model rate offers. Prefer normalized persistent company/product/offer relations as the eventual storage backend; the small current read-only in-memory graph is limited intentionally to the curated 32. For 100K+ products, use external indexed storage and paginated queries rather than allocating all into per-request RAM.

The new public API cannot authorize ownership, change sponsor rankings, or trigger payment. Company year, funding and listed-parent facts are null when undocumented; project start date is not treated as company incorporation.
