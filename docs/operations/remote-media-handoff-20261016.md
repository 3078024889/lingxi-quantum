# 2026-10-16 remote handoff and media acceptance

Read-only inventory captured before integration. No production merge, frontend deployment, live charge, price/balance change or existing-user-data mutation is part of this PR. One missing empty temporary-delivery table was restored with an additive migration, documented below.

Production: both domain aliases map to READY deployment `dpl_GRc3K2YcLfRsPUSPuEYrPN3BXyJz`, commit `b42ca0e4cadc8bc842eeb43c0a5b81c19d32ef9d`. PR #35 was already merged as `bef4edebecce07a77a1b4b7dcc5effcf01185030` on 2026-10-16. Main checkout has other ongoing work and was left untouched.

Media audit branch advanced from the handoff's `ecd16fbe` to `5088af324549e755867a317b5c38a0265fae8f24`. This isolated review branch starts at that exact source; no blanket PR stacking.

## Open PR inventory

All 16 open PR file lists were fetched from GitHub. Decisions below are preliminary integration holds, not acceptance or rejection of the implementations.

| PR | Head | Scope and integration check |
|---|---|---|
| [#37](https://github.com/3078024889/lingxi-quantum/pull/37) | `98a85405` | Hold: overlaps media/client, VideoToolkit, VideoEffects and BatchImage. Body reports live pricing migration; reconcile with original-price requirement before any release. Adds preview-translate/tts routes needing provider and billing review. |
| [#36](https://github.com/3078024889/lingxi-quantum/pull/36) | `53b9983e` | Hold: BatchImage and ToolFacts overlap PR37. Compare exact-size/crop/fit behavior before choosing implementation. |
| [#34](https://github.com/3078024889/lingxi-quantum/pull/34) | `39c3e4ce` | Research/skills: inspect present routing and OpenAlex implementation before reuse. |
| [#33](https://github.com/3078024889/lingxi-quantum/pull/33) | `ba84267e` | Large legacy cross-cutting implementation; contains retired SasiSkillsPanel and creator test paths. Never merge whole branch; inspect individual still-missing outcomes. |
| [#32](https://github.com/3078024889/lingxi-quantum/pull/32) | `b90d100b` | Conversation save race: compare current conversation implementation and later changes. |
| [#31](https://github.com/3078024889/lingxi-quantum/pull/31) | `2366025f` | PDF/image error copy: compare nine-language current handlers before reuse. |
| [#30](https://github.com/3078024889/lingxi-quantum/pull/30) | `59a08c38` | Actual PDF/image I/O tests: compare current output regressions; old vercel.json must not overwrite current. |
| [#26](https://github.com/3078024889/lingxi-quantum/pull/26) | `7c278660` | Audit document only plus old vercel.json; no runtime capability to merge blindly. |
| [#21](https://github.com/3078024889/lingxi-quantum/pull/21) | `be32d091` | Conversation feedback overlaps PR17/32 and current conversation; compare behaviors. |
| [#19](https://github.com/3078024889/lingxi-quantum/pull/19) | `937192f3` | Media evidence sampling and CI gate: compare current detector/evidence requirements and workflow. |
| [#17](https://github.com/3078024889/lingxi-quantum/pull/17) | `8f41bfde` | Conversation feedback/draft retention overlaps PR21/32. |
| [#8](https://github.com/3078024889/lingxi-quantum/pull/8) | `c99c1607` | Connections, routing, detector and CI changes overlap later work; inspect current equivalents. |
| [#5](https://github.com/3078024889/lingxi-quantum/pull/5) | `c6597926` | SASI error/local text hotfix: compare current boundary and local model behavior. |
| [#4](https://github.com/3078024889/lingxi-quantum/pull/4) | `b03027b0` | Old on-device SASI implementation touches unified entry; inspect current implementation before reuse. |
| [#2](https://github.com/3078024889/lingxi-quantum/pull/2) | `aa294eb2` | Analytics dependency/layout/lockfile: preserve current dependency and deployment configuration. |
| [#1](https://github.com/3078024889/lingxi-quantum/pull/1) | `4a0184df` | Knowledge gym and package scripts: inspect current knowledge pipeline and manifest before reuse. |

## Defects found in supplied media branch

- `muxDubbedVideo` used `originalDuration` without defining it. Read the source duration before starting FFmpeg.
- Audio duration contract script had an unescaped nested quote and could not parse.
- Effects and watermark output paths lacked post-encode duration verification. Added checks before exposing files.
- Prepared sharing needs a fresh second click after authorization; unsupported browsers must still show their fallback on the first click, without reserving quota. Existing delivery and subtitle tests updated to exercise the explicit second gesture.
- Common file actions previewed audio only. Video results now have a local controls/playsInline preview.

## Evidence and boundaries

New `Media saved-file acceptance` PR workflow runs existing retired-code audit, source contracts, native regressions and browser processing remotely. Dedicated actual-output matrix: 2/12/60/125 seconds × nine operations × desktop/mobile Chromium. Inputs and downloaded bytes are retained with stream metadata, expected/actual duration, first/last PNGs and full decoder success/failure. Other existing delivery/subtitle tests check same-byte handoff and explicit temporary-upload consent using isolated endpoints. No real payment/model calls.

Browser matrix is initially pending until CI returns. Native reference tests do not establish WASM compatibility. Chromium phone emulation does not establish iPhone Safari, Android physical-device, WeChat or mini-WebView delivery. No actual recipient receipt is claimed. Current round does not accept video translation/dubbing model quality or all tools. No further code deletion until the existing cleanup audit and full references are verified.

### First remote results and integration blockers

PR #38 initial commit `42a5fa9a`: remote native job `116953749638` passed retired-code audit, three source contracts and 37 native output cases (9 stop-motion, 9 watermark boundaries, 6 reverse speeds, 3 mismatched dub audio lengths, 10 toolkit operations). Remote production build also passed; actual-browser run was still pending at this checkpoint. These native scripts exercise reference command arguments, not the production WASM binary.

Read-only production pricing query confirmed audio/video transcription, dubbing and video translation are now `per_second`, 0.10 in each independent currency book. Current main UI still calculates and submits rounded minutes. This mismatch must be resolved before release; this PR does not change either live prices or production database data. ID photo price is 2.90 in each book, while main policy still marks the capability disabled. PR37 cannot be accepted merely because its migration has already been applied.

Temporary delivery: API issues private signed GET links for 900 seconds and expiry records for 20 minutes, but the current cleanup cron runs daily at 03:17 UTC and processes up to 100 records. This does not prove object deletion after 20 minutes. PUT currently signs host only; the API checks declared size, not the final uploaded object size. Real storage cleanup/access-limit verification remains open; no private user files were uploaded during this review.

Follow-up matrix adds reverse, loop, stop-motion, boomerang and watermark removal (payment isolated) at the same four durations. Full decoder progress end timestamps are checked in addition to container duration, with output stream metadata and first/last frames retained. Prepared sharing now ignores an authorization result if its source result was replaced while the request was pending.

Initial delivery regression run `38895154339` finished with 95 passes, one skip and two failures. Both failures independently reproduce the still-visible `处理方式` heading in the shared footer, on desktop and mobile. The follow-up moves that disclosure into a nine-language FAQ question instead of weakening the assertion. The MP3 actual-output/same-byte sharing tests passed on both projects in that run. All follow-up changes still require their own remote rerun.

Reference analysis additionally found PR37 video translation preview calls `clipMedia` without importing it and its preview marker regex matches escaped backslashes rather than numbered segment markers, then falls back to the source text. Keep PR37 held until these are fixed and actual translated outputs verified. It also has overlapping dimension logic with PR36; neither implementation has been stacked into this review branch.

Removed the old `shareFile` wrapper after full source/script references showed no production caller; tests now exercise only the prepared-sharing API. Two duplicate metadata readers were consolidated into one lightweight module, including finite-duration discovery for unindexed MediaRecorder WebM and event/URL cleanup tests. Video translation mux now checks source/output durations before exposing a result. No heavy local commands were executed.

First actual-browser media run `38895154366`, job `116953749702`, completed successfully: **98 passed**, including all 72 toolkit cases (four durations × nine operations × desktop/mobile Chromium) and existing delivery/subtitle cases. Source is exactly `42a5fa9acb1f8d4ba8b942668ca4ae46901bf589`. Evidence artifact `12044500152` (`media-saved-file-evidence`, SHA256 `77d2292e3acb7aacd6ad6950dc5da4caa689d40d23d18944827ca132ffa8d9d0`) retains source/downloaded media, stream metadata and first/last frames until 2026-10-23. The 154 MB artifact remains remote. Samples are synthetic 160×90 at 25 fps with an audio tone; this is duration/container/decoder verification, not real-phone memory, high-resolution performance, subjective sound or cinematic quality acceptance. Follow-up changes require a new run and do not inherit this result.

### Missing production temporary-delivery table

An actual read-only query returned `42P01`: `public.tool_temp_files` did not exist, while `tool_export_requests` did. This is a real dependency failure for the existing authorized temporary-file API, independent of browser sharing support.

Applied the narrowly scoped additive migration `20261016115946_restore_mobile_file_delivery_schema.sql` to the existing project. It recreates only that API's missing empty tracking table, expiry index and service-only permissions; it does not replay the historical v210 nutrition/extension changes, change prices/balances or modify existing user records. RLS is enabled, anon/authenticated have no direct SELECT/INSERT, service_role has CRUD. Account deletion sets owner to NULL so that the cleanup worker retains the object reference instead of losing it through cascade deletion. This is a schema repair, not a frontend deployment.

Live PostgreSQL verification used a transaction rolled back afterwards: test-row insertion/update worked and an over-100-MB declared size was rejected. Post-test verification: rows=0, RLS=true, anon/authenticated SELECT/INSERT=false, service CRUD=true, foreign-key cleanup preservation=true. The database size check does not prove the uploaded object size is bounded. Actual R2 upload, signed-link expiry and scheduled deletion remain unverified; no user file or storage object was created. Reference: [Supabase grants and RLS](https://supabase.com/docs/guides/api/securing-your-api).

Second scoped delivery run `38896465816` on `e3b78964` completed **97 passed, 1 skipped, zero failures**. Both previously failing footer cases now pass. The expanded media and full production-gate runs were still pending at this checkpoint.

Expanded media run `38896465778` on `e3b789644c9700196f9acf1db14e3a88401b1b8d` subsequently completed **138 passed**, including all 112 real-output matrix cases (four durations × fourteen processing paths × two Chromium projects). Reverse, loop, stop-motion, boomerang and watermark removal include all four durations through 125 seconds. Payment is intercepted for the watermark workflow; no funds or provider generation are used. Each saved output also passes decoder end-time checks. Metadata lifecycle unit tests and all 37 native reference cases passed on the same runtime source. Evidence artifact `12044965672`, SHA256 `9f57d1737c914fa01be86f7cc4b69fa346b48daa61b958e07e7fe2553f15cc90`, remains remote (257 MB, expires 2026-10-23). The following schema/documentation receipt commit does not change that tested application code. Full production CI was still running; this is not a release approval.

### Private real-file acceptance and image selection regression

The user explicitly authorized local Google Chrome use and supplied private files. Reuse one tool tab; close temporary decoder/inspection tabs immediately. Originals and evidence remain on the user's computer, never in Git or public CI artifacts.

Production UI processed a real 720×1280 HEVC/AAC phone clip (~10.1 seconds) through compression and MP3 extraction. Saved outputs were independently reopened and fully decoded using a separate FFmpeg browser instance: compressed H.264 retained 241 frames through 10.10 seconds; MP3 decoded through 10.10 seconds. The supplied precompressed file also fully decoded. This sample did not reproduce two-second truncation and does not establish every codec/tool is accepted.

The supplied 966-page PDF completed production metadata removal. Independent PDF-lib reads with `updateMetadata:false` found no Info keys or catalog XMP in the output; all 966 page content-stream hashes and dimensions matched the source. Visible page text is intentionally retained. This is metadata acceptance, not acceptance of all PDF functions.

Actual stepped mouse dragging in production image watermark selection triggered IMG dragstart, pointercancel and lostpointercapture, leaving an incomplete box. Capturing dragstart prevention restored the complete gesture in an isolated diagnostic. Both brush and box now disable native dragging, cancel dragstart on the surface and default to explicit scroll mode, with nine-language scroll/select controls. The new browser regression exercises stepped mouse drawing and selection preservation in scroll mode; real phone gesture acceptance is still pending.

Box inpainting also interleaved four boundary sides then sliced them as if grouped. A distinct-side color regression fails on HEAD before this patch and passes after correcting grouping; unselected pixels stay unchanged. The existing paid-callback resource cleanup test passes. Retesting the user's image against the patched algorithm still shows a visible footer gradient: quality remains insufficient for that sample. Do not claim watermark restoration is complete or replace this with a paid model call. The algorithm-only retest is not a deployed UI acceptance.

Full production gate run `38897938927` on `9c4f9d6` completed with a failing Desktop closure step. Scoped media and delivery successes do not override this release blocker. No production promotion or main merge has occurred.

