# Independent SEO / GEO evidence capture and review — 2026-11-01

## What each data source means

- **Google Search Console** measures LINGXIFIELD's own pages: impressions, clicks, CTR and average position. It does not measure a competing vendor's rank.
- **Independent SERP** records the observed organic position of each product in the same Google or Bing result capture, for the same query, country, language, engine, method and timestamp.
- **GEO citations** records whether products are mentioned or cited in the same AI answer, using the same provider, exact model/version, prompt, locale and capture.
- **Sponsored results** are excluded from organic comparisons. A directory order, vendor claim or AI-generated estimate is never a rank.

The comparison importer makes no network requests. It only accepts a compact capture file that a researcher has actually saved and reviewed. The public ledger remains empty until real capture files and explicit reviewer decisions exist.

## Capture file format

Create one compact JSON file per query/country/language/engine/model/time group. Keep only the facts needed to reproduce the comparison: capture metadata, product IDs, observed positions or citation counts, source URLs, sample counts and whether the result was sponsored. Do not paste entire web pages, personal data or full copyrighted AI answers into the capture file.

SERP template (replace every illustrative value with an actual observation; this is a schema example, not published ranking data):

```json
{
  "source": "independent_serp",
  "captureGroupId": "google-video-sg-20261101-a",
  "observedAt": "2026-11-01T08:00:00.000Z",
  "country": "SG",
  "language": "en",
  "query": "AI video generator",
  "engine": "Google",
  "methodVersion": "SERP.manual-capture.v1",
  "results": [
    {
      "platformId": "runway",
      "position": 1,
      "sourceUrl": "https://runwayml.com",
      "sampleCount": 1,
      "sponsored": false
    },
    {
      "platformId": "kling",
      "position": 2,
      "sourceUrl": "https://klingai.com",
      "sampleCount": 1,
      "sponsored": false
    }
  ]
}
```

For GEO, use `source: "ai_answer_citation"`, provide `engine` (provider), `model`, `modelVersion`, and for each product `mentions`, `citations`, `sourceUrl`, `sampleCount`, and `sponsored: false`. All rows in one capture must refer to the same exact prompt and answer capture.

## Review and publication

Run from `lingxifield-ai-market`.

1. Compute the SHA-256 digest of the exact capture file:

   ```powershell
   node .\scripts\review-independent-seo-geo.mjs --hash .\capture.json
   ```

2. Create a review manifest with the exact capture group ID and hash, the reviewer's handle, a timestamp, and one explicit decision for every product:

   ```json
   {
     "captureGroupId": "google-video-sg-20261101-a",
     "rawCaptureSha256": "PASTE_THE_ACTUAL_64_CHARACTER_SHA256_HERE",
     "reviewer": "YOUR_REVIEWER_HANDLE",
     "reviewedAt": "2026-11-01T08:30:00.000Z",
     "decisions": [
       {
         "platformId": "runway",
         "approve": true,
         "reason": "Verified the saved Google result, organic position, country, query and publisher destination."
       },
       {
         "platformId": "kling",
         "approve": true,
         "reason": "Verified the saved Google result, organic position, country, query and publisher destination."
       }
     ]
   }
   ```

3. Validate without changing the ledger:

   ```powershell
   node .\scripts\review-independent-seo-geo.mjs .\capture.json .\review.json
   ```

4. Only after every row has been reviewed, explicitly publish:

   ```powershell
   node .\scripts\review-independent-seo-geo.mjs .\capture.json .\review.json --confirm-publish
   ```

   The CLI archives the exact raw capture under `reports/seo-geo-captures/`, writes reviewed observations to `data/seo-geo-observations.json`, and links each row to the archive using SHA-256. It refuses a mismatched capture hash, missing decision, duplicate product, unknown product, sponsored result, unsupported engine, invalid timestamp, or comparison with fewer than two approved products.

5. Before committing, run:

   ```powershell
   npm run seo:validate-ledger
   npm run validate:data
   npm run gate
   ```

   Commit the reviewed ledger and its matching `reports/seo-geo-captures/` archive together. CI rechecks record hashes, group comparability, duplicate products and capture integrity. A missing or modified archive fails the gate.

## Comparison rules

- SERP groups require the same engine, query, country, language, date, method version and raw capture. Organic position must be an integer from 1 to 100.
- GEO groups require the same provider, model, model version, query, country, language, date, method version and raw capture. Mention/citation counts must be nonnegative integers.
- Every product appears once per capture group. At least two products must be approved before a comparison is published.
- Each row stores reviewer, review time and a reason. The raw capture hash is recomputed; it is not accepted from the manifest alone.
- The public board shows only reviewed, hash-valid groups. GSC metrics are displayed separately as LINGXIFIELD's own-site analytics.

No real SERP or GEO ranking is currently asserted by this document. The current empty ledger is the truthful state until independently captured and reviewed evidence is supplied.
