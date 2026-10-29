# Global open-source implementation research — safe integration list

No source code has been copied from third-party repositories. Sources are references for behavior, official API usage and QA patterns only. License and service usage must be checked at the exact pinned commit before any code is imported.

* Hugging Face official Hub client: model repository identity, metadata, provenance and API pagination (not an adoption leaderboard).
* Hugging Face Datasets: bounded streaming for batch ingestion; avoid installing heavy dependencies in a 2GB production web server.
* Tolgee: translation key coverage and screenshot-based localization QA, without requiring a paid cloud account.
* PayIntLab payments-sandbox and proxynth/payment-sandbox: local failure injection, webhook dedupe and refund-state testing; simulations do not prove real provider integration.
* PayPal official simulator: synthetic events can test listener behavior but do not prove live sandbox captures or refunds.

Operational integration acceptance: local Postgres migration with auth schema, authorized source capture and review, 9 language browser matrix, real provider sandbox signing and reconciliation, RAM-limited runtime and rollback logs. All remain outstanding unless execution logs are attached.

See data/ai-market/open-source-candidates.json for per-source rights and usage limits. Zero extra paid cloud resources, no main merge or production database changes.
