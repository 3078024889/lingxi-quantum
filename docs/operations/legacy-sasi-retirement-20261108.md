# Legacy SASI retirement — staged, not deployed

This branch preserves the new software marketplace, seller APIs, downloads, account data and historical paid deliveries. It removes 22 retired field components/media/archive files plus the unreferenced video assembler and BYOK image studio. Twelve obsolete creation pages redirect to `/sasi`; the generation-submit and old radar endpoints return HTTP 410 without invoking providers. The radar schedule is removed from Vercel configuration. Cloudflare's asset allowlist no longer serves the retired entrance movie.

Remaining work: retire other legacy creation APIs and their shared implementation only after checking dependencies on tools and historical orders; run the full production gate; publish the new build; inspect and remove dedicated obsolete cloud deployments and R2 media. Do not delete the shared Cloudflare Worker or Vercel project. Removing files from this branch does not delete Git history or previously deployed artifacts.

The first deletion attempt was blocked by automatic approval review. After the user renewed the request, the 22 field-related files were inspected individually for local modifications, runtime references and path ownership, then removed using non-force `git rm` in `D:\30780\lingxi-quantum`. Its manifests and root cleanup log were updated; pre-existing edits remain untouched. The two legacy SASI components were deleted only in this newer cleanup checkout because the user's older checkout still has their consumers.

Validation: all 13 tests in the Cloudflare asset handler, new marketplace commission and marketplace security suites pass. The full production build has not run. The Vercel project was inspected and remains `live: false`; its deployments contain the whole site rather than a standalone old SASI project. No cloud deletion was performed; preserve the latest fallback deployment until a replacement passes release checks.

## Cloud verification and deletion — 2026-11-08 05:39 UTC

The earlier pending-build statement above is superseded: run 42451183491 passed the full software marketplace production build and TypeScript checks at commit 1c1e1e748172bd667e8f81c6dcf38f1da132bfb8. Subsequent ops-script and inventory changes have separate syntax/local checks; this is not a claim of a production deployment.

Read-only inventory run 42451474155 established that the static gateway has a LEGACY_BACKEND service binding to `lingxifield-com-full-canary-20261107`. That shared backend is still required. Inspected Workers had no scheduled triggers. Vercel remains paused with the shared fallback site intact.

Cleanup run 42451569654 successfully deleted exactly:

- `lingxifield-com-cn-anon-proxy-canary`
- `lingxifield-com-tools-bluegreen-20261107`

Immediately before deletion the job checked all Worker settings for references, the zone's routes, account custom domains and target schedules. It used non-force deletion. Immediately afterwards both names were absent, route metadata was unchanged, and `/tools`, `/sasi`, `/api/account/money-admin/access` returned HTTP 200.

Remaining: publish replacement shared backend/static output containing the complete retired-code changes, remove superseded deployed artifacts and retired R2 field media after replacement, and verify ECS's actual current/staged release before removing server directories. The existing bed36092c854 ECS package predates these retirement changes. No ECS directory or Vercel deployment has been deleted by this cleanup.
