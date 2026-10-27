# Internal AI model market CSV export

Endpoint: GET /ai/market-preview/export?q=...&sort=name|prompt-low|completion-low|context-high

Default 404 until AI_MARKET_PREVIEW_ENABLED=true. Uses the same source-attributed live catalog as the model preview; returns 503 if unavailable. Export is limited to 100 models, uses no-store and noindex headers, and prefixes formula-like spreadsheet cells to prevent CSV injection. Missing fields are Unknown. Prices are OpenRouter routing prices per million tokens and not provider-direct quotes.

Security note: this is a preview-only export, not an authorization mechanism. Do not enable publicly until third-party redistribution rights, abuse limits and source terms have been approved. No live export or browser download has been validated yet.
