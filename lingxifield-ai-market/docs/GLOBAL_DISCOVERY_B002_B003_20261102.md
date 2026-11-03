# Global AI discovery — B002/B003, 2026-11-02

## Review scope and counts
The public published corpus remains 32 curated **products**, not 32 incorporated companies. The previous internal B001 holds ten products and 70 seven-field observations. This research round adds **B002 ten + B003 ten = twenty candidates**, all private/staged, none authorized to publish. Each of the 20 has the official homepage/pricing/help source, tasks, SEO search phrases, stable product ID, a distinct publisher-group ID, and seven fact statuses, missing fields explicitly marked as missing. This is **57 new source-attributed public-page observations**; no live subscription or task execution is asserted.

- B002: GitHub Copilot, Devin Desktop (formerly Windsurf), Tabnine, Le Chat/Mistral, Microsoft Copilot, Poe, Adobe Firefly, Recraft, Freepik AI, Synthesia.
- B003: HeyGen, Elicit, Consensus, Scite, Replicate, fal, Together AI, Fireworks AI, GroqCloud, OpenRouter.

## Key original publisher findings
- Windsurf's **current official name is Devin Desktop** (source: https://devin.ai/desktop), so `windsurf` remains a lookup alias, never an extra incorporated company.
- Tabnine's first-party site states it was **acquired by Tricentis** (https://www.tabnine.com/platform/); preserve parent group and product brand separately.
- Microsoft Copilot has Singapore SG-dollar consumer pricing and USD corporate plans on one page (https://www.microsoft.com/en-sg/copilot). The resulting data preserves region, currency, billing period, and is **not** displayed as one global price.
- GitHub Copilot's standalone individual product tiers are separate from Microsoft Copilot even when the corporate parent group is Microsoft: https://github.com/features/copilot/plans.
- Recraft Free creations have substantially different copyright and commercial terms from paid creations (https://www.recraft.ai/pricing?tab=plans); do not equate free generation with commercial license.
- API aggregators fal, Replicate, OpenRouter, Together and Fireworks are not the same as their hosted model publishers. Their products/services and usage-based pricing must be represented as third-party infrastructure, not falsely counted as proprietary underlying models.

## Release policy
`npm run validate:global-intake` checks curated-product duplicate IDs, duplicate names/aliases across batches, a bounded 10-products per batch, immutable candidate-only publication flags, seven explicit fact statuses, original-site URL provenance and dated observations. `npm run validate:official-intake` checks all 3 source packs. All checks run on each market CI build.

**Not production published.** Unknown country matrices, legal entities, licences, payment methods and customer-generated outcomes stay missing. There is no inference from catalog counts to global AI company counts. Only after independent editorial review, product use testing and launch gates may new products graduate to a separate review-approved release cohort.
