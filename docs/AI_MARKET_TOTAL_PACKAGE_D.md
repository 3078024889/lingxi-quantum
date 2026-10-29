# Total Package D — SEO/GEO Measurement and Search Visibility

**Current gate: CORE SOURCE COMMITTED; NOT PRODUCTION-READY**

The SEO side supports normalized, verified Google Search Console and Bing Webmaster report observations. The GEO side supports separately sampled citation probes tied to model version, prompt hash, method version, region, language, sample size and evidence. **SEO impressions, Bing Chat traffic and third-party AI citations are not interchangeable.** Google Search Console does not expose isolated Google AI Overview organic citation counts through the ordinary Search Analytics rows. No global GEO rank can be asserted based on a few prompts.

Official references checked:
- https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- https://support.google.com/webmasters/answer/7042828?hl=en
- https://www.bing.com/webmasters/help/search-performance-c680da36
- https://learn.microsoft.com/en-us/bingwebmaster/

New source/test: lib/ai-market/visibility-engine.mjs, visibility-engine.test.mjs
New isolated schema: supabase/migrations/20261029_ai_market_visibility_d.sql

Run `node --test lib/ai-market/visibility-engine.test.mjs`.

Acceptance gates not yet passed: OAuth site-ownership integration, API pagination and quotas, consent to measure third-party sites, production query auth, actual multi-day observations, representative prompt sampling, collision-free evidence, SQL staging migration/rollback, real API/page visualization, nine-language review and browser security tests. No live private Search Console data was collected.
