# R76 media import verification — 2026-10-12

## Confirmed against current main

`app/api/tools/media-import/route.ts` validates DNS answers but then downloads with global `fetch`, which can resolve a different address. Its local IPv6 filter misses IPv4-mapped forms. It reads full media with `arrayBuffer()` and full HTML with `text()` before enforcing actual-byte bounds. These are confirmed source defects; this audit found no evidence of exploitation.

Candidate archive: `D:/LINGXIFIELD_R76_MEDIA_IMPORT_OFFLINE_20261012.zip`, 18,903 bytes, SHA256 `9C4B04D429446ABF93C32EBCEAC7BFCF36AB74C2E064A530580B4CAE0ED45BC4`. Entries were checked for path traversal before extraction. Reference scripts were read as candidate material, not executed as repository patches. Its reported 36 offline tests are not production acceptance evidence.

## Integrated candidate in the isolated worktree

- Remove the route-local address classifier and unpinned fetch implementation.
- Reuse the shared public endpoint validator. Canonicalize IPv6 first, deny mapped/compatible/translation/tunnel and special-use ranges, retain native global IPv6 and support bracketed literal hosts.
- Download with Node HTTPS, per-request connection, verified-address lookup and explicit address family; retain hostname/certificate verification. Revalidate every redirect, cap redirects, destroy redirect responses.
- Bound declared and streamed media to 100 MiB and HTML to 5 MiB before assembling the result. Request identity encoding and reject compressed responses; reject empty, aborted and truncated results.
- Share one 30-second deadline across DNS, headers, body, redirects and share-page media resolution.
- Bound incoming JSON to 32 KiB even without Content-Length. Oversize responses return 413; malformed input 400; timeout 504.
- Match platform domains by exact root/subdomain boundary rather than substring.
- Keep existing origin and abuse guards. No credentials/cookies are forwarded to remote targets.
- Explicit family also hardens the existing pinned media range/probe call sites against automatic family selection callback mismatch.

This uses the repository's existing Node/shared security architecture rather than replacing it with the offline reference. The reference blocks all IPv6; the integrated candidate retains native global IPv6 with a stricter classifier. No yt-dlp executable, package, model, or license-dependent extraction service was installed.

## Evidence and limits

- Actual shared classifier, downloader and route tests pass with mocked network: DNS changes after validation still connect to the pinned address; native IPv6 family; mapped/expanded IPv6; mixed DNS answers; private and loop redirects; declared/streamed limits; encoding; truncated/aborted bodies; stalled DNS/body; bounded incoming JSON; real route response/status mapping.
- Existing pinned range and exact media completion tests pass.
- Type check and source gate pass for the candidate. Initial and final integrated builds pass; final build includes the subsequent address-family hardening (`reports/r64/build-r76-final.log`). Final actual-source attack tests pass (`reports/r64/test-media-import-security-final.log`).
- A real public image download was attempted and **blocked** before connection: the local DNS returns `198.18.0.66` for raw.githubusercontent.com (and benchmark-range answers for other public hosts). This range is deliberately forbidden. The guard was not weakened to make the test pass. Live public download acceptance remains incomplete in this DNS environment.
- The limit is per request, not a global concurrent-memory quota. Provider-specific public share extraction and all media formats still need functional acceptance; this does not claim all 121 tools or SASI videos are complete.
- No GitHub commit/push, Vercel deployment, mini review resubmission or production-data modification was performed for this candidate. Release remains paused.

Primary design reference: [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html). Its separate validation, DNS and redirect guidance supports the defensive approach; it does not certify this implementation.
