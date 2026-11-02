# Global SIAI · Company evidence audit (2026-11-02)

Scope: **32 curated products / SDKs / open-source tools**, not 32 separately incorporated companies. Multiple products share a corporate parent. Corporate formation years and open-source project dates are different fields.

## Confirmed changes in this revision

- Default list order is **company founded year, oldest first**. A reversed order is available. Search API sorts **before pagination**. Alphabetic name, free-first and short-film options remain selectable.
- Corporate formation dates now explicitly sourced for Runway (2018, [publisher's own announcement](https://runway.com/news/runway-raises-50-series-c)), Lovable (2023, [publisher's origin history](https://lovable.dev/gpt-engineer)), and Ollama (2023, [company-managed profile](https://www.linkedin.com/company/ollama/)). Ollama's company headquarters is supported by that same profile.
- For source completeness, **Midjourney** company founding is now sourced to 2021 based on [Forbes' 2026 company profile](https://tollbit.forbes.com/companies/midjourney/), independently supported by the company's December 2024 court admission. **LlamaIndex** was added as 2023 based on its [company-issued 2025 Series A press release](https://www.prnewswire.com/news-releases/llamaindex-secures-19-million-series-a-to-power-enterprise-grade-knowledge-agents-302390936.html). All 22 corporate publishers now have a cited founded year; project start years remain separate.
- Six documented non-company open-source projects/libraries are in their own group, ordered by documented repository/project start dates. These are **not** corporate formation dates.
- 'Listed parent' is only used when a documented stock-exchange listing applies. The absence of a listing citation never proves a company is private or unlisted.

## Open data gaps (do not infer values)

1. **Company identity:** all 22 corporate publishers have a cited founding year; several company headquarters still lack direct primary-source evidence; funding amounts are incomplete for multiple companies, and a missing funding amount does not mean zero.
2. **Products and developer APIs:** subscription, usage-based API billing, free quotas, regional support, model versions, taxes, usage caps and commercial licensing change on independent cycles. All 32 require **field-level source dates** and periodic revalidation; no subscription implies free API calls. User experience summaries are not synthetic reviews.
3. **Comparability:** product task performance, independent model benchmark scores, actual end-to-end short-film cost and per-region checkout performance are **not independently measured** simply because publisher claims are present.
4. **SEO/GEO:** `data/seo-geo-observations.json` remains `[]`. There are no independent verified rankings, Google Search Console measurements or AI citation samples for this new site in the checked source tree. A search-ready page is not a measured search rank.
5. **Payments:** `checkoutImplemented=false` in the merchant readiness gate. No independently verified live Alipay, WeChat Pay or PayPal create/capture/refund/fulfillment path has been activated. Never treat price display or credential presence as live merchant acceptance.

## Production gating

The project remains isolated in PR #90. Do not alter main-site functionality, live payment configuration, credentials, DNS, ICP, GSC verification or production robots until domain ownership/verification, merchant permissions, callback signature verification and relevant smoke tests are confirmed. Preview remains noindex.

## Reproduction

Run `node --test tests/market-founding-order.test.mjs` and `node scripts/audit-company-founding.mjs` from the `lingxifield-ai-market` directory. API smoke: `/api/v1/search?sort=founded&limit=50` and `/api/v1/search?sort=foundedDesc&limit=50`; assert 32 curated records and correct tier/year order, including second page if querying with a smaller limit.

## Additional official facts confirmed on 2026-11-02

- Midjourney: founded in 2021, [Forbes company profile](https://tollbit.forbes.com/companies/midjourney/); [company headquarters profile](https://www.linkedin.com/company/midjourney) reports San Francisco. Location is a company-profile attribution.
- Kuaishou: [investor FAQ](https://ir.kuaishou.com/zh-hans/investor-resources/investor-faqs) establishes Beijing, Haidian HQ.
- Runway: [SEC Form D](https://www.sec.gov/Archives/edgar/data/1957455/000123191922000071/xslFormDX01/primary_doc.xml) gives a **historical 2022** New York principal business address (not necessarily its current global HQ); [Series E company announcement](https://runway.com/news/runway-series-e-funding) confirms US$315M in February 2026 (single round).
- ElevenLabs: [London office announcement](https://elevenlabs.io/blog/london-office-opening) names London its **European** HQ and global operations center, not worldwide registered HQ; [2026 Series D](https://elevenlabs.io/blog/series-d) confirms US$500M, announced cumulative US$781M.
- Suno: [company careers](https://suno.com/careers) expressly states Cambridge, Massachusetts HQ.
- Perplexity: [legal contact](https://www.perplexity.ai/zh/hub/legal/terms-of-service) confirms a San Francisco service address; **not equated with legal company HQ**.
- Hugging Face: [IBM investor announcement](https://newsroom.ibm.com/2023-08-24-IBM-to-Participate-in-235M-Series-D-Funding-Round-of-Hugging-Face) confirms US$235M Series D in August 2023, not cumulative capital.
- Corporate data remains distinct from product rankings, editorial recommendations, company valuation, and model technical benchmarks. No funding amount is interpreted as current company worth or stock market capitalization.
