# Current product cleanup and BYOK video acceptance

Base: `9bdef24ad497c05c6cd5c95d3e6f4e600302cf0f`.

## Implemented

- Completed the existing working-tree retirement cleanup: removed unused legacy pages, components, report knowledge, artwork and obsolete report audit commands. Active tools, account records and current SASI products remain. Retired URLs return HTTP 410 through middleware.
- Removed both Canvas-recorded geometric video studios. The drama page and project video panel use the existing Seedance BYOK API: project selection, quote, explicit supplier-budget confirmation, task lookup and real result playback.
- Disabled new platform-funded video quotes/jobs and native paid-video submissions. Historical job listing remains available. Credentials are still managed by the existing encrypted per-user connection vault; the UI does not take a platform API key.
- Marked all nine request-dependent routes named in the supplied deployment failure as `force-dynamic`. Middleware trims public configuration so whitespace-only values do not crash public page requests.
- Food image classification suggestions are visible before payment. Removed the loop that silently matched lower-ranked Food-101 labels to nutrition entries. Users enter confirmed ingredients and weights through name mode before paying for calculation. Null nutrition values no longer display as zero.

## Executed verification

- Full Next.js production build: passed, including build with public/admin Supabase configuration absent (whitespace values used to override local dotenv).
- TypeScript no-emit: passed after removal of unused report helpers.
- `node scripts/test-retirement-byok.mjs`: passed.
- `scripts/test-byok-browser.cjs` using Playwright/Edge, 390px mobile: passed. Test intercepts BYOK APIs; quote alone does not submit generation; explicit confirmation does. No page errors or horizontal overflow. Also checks legacy video POST returns 410, six retired URLs return 410 and food image mode no longer asks for payment to reveal guesses.
- Mobile screenshot inspected. Screenshot contains test fixtures, not a real model result.
- Existing lint warnings remain; no new lint/build errors observed.

## Not verified / not enabled by this change

- No billable model call, supplier payment or live video generation was performed.
- BYOK still requires valid Supabase/auth, encryption configuration, the BYOK migration, user model permission, a current operator-reviewed `SASI_BYOK_SEEDANCE_PROFILE` and `SASI_BYOK_VIDEO_ENABLED=true`. Missing readiness remains blocked; no price or completion is invented.
- The connected Vercel tool returned no teams. Production environment configuration and deployment success could not be verified through that connection. Build success does not establish production service readiness.
- The previously tested small CPU language model and SD image model run on the owner's local computer. This change does not expose that computer publicly or claim GPT-level intelligence, production book Q&A, or image-generation acceptance.
- Production database records, migration history, research/training corpora and Git history were not erased. Historical migration/retirement checks may still name retired products; they are not active products or navigation entries.
