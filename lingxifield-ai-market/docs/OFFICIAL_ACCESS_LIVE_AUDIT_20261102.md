# Global SIAI — 32 official website/repository entrypoints HTTP reachability (2026-11-02)

Run: [AI Market standalone release gate #41378541846](https://github.com/3078024889/lingxi-quantum/actions/runs/41378541846), source commit `1f68acd264519b428bdda52c684492ad29a18945`.
Observed at: `2026-11-02T02:36:50.264Z`.

| Class | Number | Meaning |
|---|---:|---|
| HTTP 2xx | 23 | Public HEAD endpoint accepted the request; no login or task was performed |
| HTTP 3xx redirect | 4 | Redirect target requires manual inspection, not a broken-link claim |
| HTTP 403 challenge / access gate | 4 | GitHub Actions runner blocked or challenged; not proof consumers cannot access |
| Request/network unsuccessful | 1 | Retry via real browser and another network |
| HTTP 404/410 | 0 | None in this run |

**Entries requiring manual attention:** chatgpt (access_control_or_bot_challenge 403); claude (access_control_or_bot_challenge 403); gemini (network_unavailable); doubao (redirect_needs_review 302 → www.doubao.com); kling (redirect_needs_review 302 → app.klingai.com); runway (redirect_needs_review 308 → runway.com); midjourney (access_control_or_bot_challenge 403); lovable (access_control_or_bot_challenge 403); comfyui (redirect_needs_review 301 → comfy.org).

**Action taken:** Runway's entrypoint was subsequently updated from the legacy `runwayml.com` redirect to `runway.com`. A separate direct Runway creative-app link to `app.runwayml.com` was added. This report **predates** that fix and is deliberately preserved as observed, not overwritten.

Method: single unauthenticated HTTPS HEAD, 4 concurrent requests, 7 s timeout each, redirects not followed, no login, downloads, purchases or generation. Do not interpret this report as a product's real-world functional QA, SEO/GEO ranking or vendor availability for all countries. For reproducibility run `node scripts/probe-official-use.mjs --live`; snapshots are not a live feed. 
