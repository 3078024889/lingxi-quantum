# Global code and data source review — 2026-10-27

New reference source: LiteLLM model catalog, documentation https://api.litellm.ai/docs, endpoint https://models.litellm.ai/model_catalog. The catalog advertises provider-specific pricing, context windows and capability flags. Registered as a **discovery-only** source, not a production feed or license approval.

Advantages to implement: preserve provider+model identity; normalize token-vs-character-vs-minute pricing; show explicit price source, currency and observedAt; expose unknown values; separate OpenRouter routed quotes from vendor-direct pricing. No ranking by fabricated usage or revenue.

Other design references: https://selfhostmap.com/ (hardware, license, activity filters), https://opentoolatlas.com/ (repository discovery). These are product references, not code copied into the repository. Review license, terms, provenance and security before ingestion.

Release blockers: live sponsorship checkout integration, transactional settlement storage, authorized operations UI, refunds/disputes, source redistribution review, Supabase migrations, full browser CI, preview rollout. None is claimed production-ready.
