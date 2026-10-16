# 2026-10-16 remote handoff and media acceptance

Read-only inventory captured before integration. No production merge, deployment, live charge or database mutation is part of this PR.

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

