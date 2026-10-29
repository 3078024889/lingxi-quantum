# AI market preview release checklist

- Default: AI_MARKET_PREVIEW_ENABLED unset; /ai/market-preview renders a disabled state.
- Only preview/staging may opt in until source terms and redistribution rights are approved.
- Prices are OpenRouter routing prices per 1 million tokens, not direct vendor prices.
- Null prices remain Unknown, never free or zero.
- Page is noindex/nofollow and uses a server-side time-bounded fetch.
- Search and sorting apply only to source models with an attributed timestamp.
- Do not add a production navigation link before verification.
- Verify build, API availability, 429/error fallback, large-response rejection and mobile overflow.
- Long-term history and public leaderboards remain separate release gates.
