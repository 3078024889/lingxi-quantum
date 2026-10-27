# AI model workload comparison: release gates

This is an opt-in, noindex model cost calculator. It uses the live OpenRouter catalog adapter already implemented in the AI discovery branch. It is NOT a price guarantee, a vendor-direct quotation or a global quality ranking.

- Same input/output token counts and request volume are applied to all selected models.
- Missing rates are unknown, never zero. Zero is only zero when the source explicitly reports zero.
- Estimated cost = requests × (input tokens × input USD/million + output tokens × output USD/million) / 1,000,000.
- Excludes caching, multimodal billing, minimum charges, taxes, discounts and provider-specific fees.
- Limit to four models; reject or ignore unknown IDs rather than fabricating matches.
- Source attribution, observation timestamp, noindex and feature flag are required.
- Before enabling in production: verify source redistribution rights, browser flows, mobile layout, internationalization, provider outage, and compare estimates against source examples.
- This implementation does not solve long-term history, authenticated vendor onboarding, traffic analytics, reviews or payment integration.
