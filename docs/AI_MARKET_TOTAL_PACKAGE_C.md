# LINGXIFIELD global AI question search — package C

Status: first source components committed, NOT COMPLETE. Production unchanged.

Implemented: explainable Chinese/English and selected multilingual task identification; matching only manually verified tool capabilities and evidence; safe HTTPS official links; pricing displayed as unverified when the exact offer has not been checked. Test file covers unverified products and invented prices.

Primary official source references reviewed 2026-10-29:

- Hugging Face official Hub API: https://huggingface.co/docs/hub/api
- Hugging Face Spaces endpoints: https://huggingface.co/docs/hub/spaces-api-endpoints
- Google Gemini official API pricing: https://ai.google.dev/gemini-api/docs/pricing
- OpenAI official API pricing: https://developers.openai.com/api/docs/pricing

These URLs do not license copying entire pricing catalogs; API pricing is not equivalent to user-facing product subscription pricing. Exact rates and limits vary by model, date, country and tier. No fabricated prices or availability.

Test: `node --test lib/ai-market/intent-engine.test.mjs`

Outstanding: connect real reviewed entities/evidence, isolated staging data, verified offers schema, API routes, mobile-friendly search UI, translation review, performance and full CI. Do not promote a repository candidate to a consumer product without checking the actual official usage link.
