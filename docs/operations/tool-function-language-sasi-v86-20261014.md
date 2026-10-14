# Tool output, language and SASI acceptance — 2026-10-14

This release repairs confirmed defects against current source. It does not claim every possible tool input, external provider or paid model has passed live acceptance. No supplier purchase, recharge or production test-user data mutation was performed.

## Confirmed defects and resulting behavior

- **SASI terminal progress:** the supplied production had 40 completed plan jobs across two revisions, whose output required an AI connection. The worker was running; the client only set a connection flag and left its previous “organizing” message visible. Terminal ready/connection/failed states now replace that message and stop polling. Auth/not-found failures stop immediately; transient failures are bounded, requests have 15-second cancellation, and polling is sequential rather than overlapping. Users can explicitly refresh progress. Reading progress no longer writes stale status snapshots over worker updates.
- **A usable free script artifact:** approved text can produce local PNG reference cards, a ZIP containing the full original script and explanatory README, and an optional browser-recorded animatic of at most three cards at four seconds each. No model, paid endpoint or remote asset is called for this rendering. The UI labels these as script layout previews, not AI-generated actors or completed episodes. Unsupported recording falls back to the script/image download. Recording has byte/time bounds and stream cleanup.
- **Already detailed approved episodes:** explicit episode sections with enough material can be organized into bounded 4/8/12-second shot requests without inference. Missing episode sections and insufficient outlines remain incomplete. This works both in the durable job and when reading older exhausted plans. The entire requested episode count must be present before the client proceeds to a whole-series video quote. Existing cost consent, rights checks and explicit final paid confirmation are retained.
- **Tool language leakage:** fixed literal labels, option arrays, explanations, paid button labels, image alt text and headings in shared and specialized workbenches. Added nine-language copy for 230 source phrases plus bounded quantity patterns. React renders only registered UI text; user prompts, document contents, code examples and downloaded material are not translated or altered by a DOM scanner.
- **PDF Unicode annotations:** actual baseline browser runs failed for Chinese/emoji watermarks, headers and Bates prefixes because Helvetica could not encode the text. Encodable labels remain vector text; other labels use a bounded local canvas image overlay. Original pages/content are retained. Unsupported-script annotations are raster overlays and are not searchable text; glyph coverage depends on browser fonts.
- **Calendar/contact fidelity:** replaced duplicate ad hoc ICS/VCF parsers with shared bounded unfolding and one-pass escaped-text decoding. Preserve grouped fields, multiple phone/email values, structured names, nested alarm isolation, timezone and recurrence data. Legacy quoted-printable/Base64 text has explicit decoding/error checks. Calendar recurrence rules are exported, not expanded, and event times are not silently converted.
- **Hydration and numeric blur:** the broad run reproduced a typed crop value reverting after blur. The shared number control now waits for its handlers before enabling edits and commits the final finite native value on blur. Delayed-script and deliberately missed-input-event tests pass; deletion/replacement and the real 356×267 image remain verified.
- **PDF crop/flatten integrity:** margins removing an entire page fail rather than generating a one-point blank box. Both standalone and paid batch paths propagate flatten errors. Real form fields become non-editable with their appearances retained; unsupported missing appearances produce no misleading result.
- **Cron correctness:** actual baseline `0/15` expanded only to minute 0. It now expands to 0, 15, 30, 45. Malformed extra slashes, empty steps and noninteger ranges are rejected. Actual output intervals and day/week OR semantics are tested.
- **Long-plan checkpoint size:** a valid 250-shot/50-episode fixture exceeded the actual 512 KiB request reader. Checkpoints now keep the owned production reference instead of duplicating its full shot array. Original script, conversation, website content, delivery references and the in-memory plan remain intact. Remote/local checkpoint and full-plan restoration tests pass; the request cap was not raised.
- Removed superseded calendar/contact parsers and unused PDF font imports. No unrelated D: files or concurrent work were deleted.

## Verification evidence

Evidence is under `_local/handoff/function-acceptance-v86/`.

| Check | Evidence / scope |
|---|---|
| Clean baseline | `baseline-final.log`, PASS |
| Production source gate | `source-release-complete.log`, PASS, including language/calendar/Cron/workspace boundary checks |
| Playwright contract | `playwright-contract-final.log`, PASS |
| Final production build | `build-checkpoint-final.log`, PASS, 1,305 generated pages |
| Language source inventory | 230 copy entries, nine locales, 178 translated literal references; no missing registered literal or raw Chinese JSX text in scanned workbenches |
| Numeric inventory | 39 numeric/decimal controls; no eager controlled onChange coercion. Browser checks exercise deletion/replacement, uploaded PDF controls and real 356×267 image output separately |
| Calendar baseline comparison | `calendar-baseline.json`; actual baseline reproduced escaped-content corruption; patched shared parser tests PASS |
| Focused browser outputs | `release-focused-browser.log`: 64 existing/output/continuity cases PASS, plus six new preview cases PASS. Four new test assertions initially failed because language hydration causes an additional legitimate read |
| Preview assertion correction | `preview-retest.log`: all ten desktop/mobile cases PASS; asserts terminal reads stop and explicit retry adds a read, not a fixed lifetime request count |
| Broad discovery regression | `release-broad-browser.log`: 1,351 PASS / 17 FAIL; nine product failure cases (four leaking label families on two devices plus one numeric blur), two old SASI assertions and six timeout cases. Failures were triaged rather than erased |
| Final output/editing/SASI cohort | `final-functional-browser.log`: 180 PASS. Four new assertions also matched the framework route announcer; scoped locators then passed all four in `pdf-boundary-retest.log`, closing the 184-case cohort |
| Final all-tool controls/language | `final-all-tools-browser.log`: all 496 PASS, covering 121 tools on desktop/mobile for initial numeric editability and English UI, nine-language hubs, and eight-language reruns of changed Cron/QR/timestamp/video/ICO tools |
| Final large-plan/history/preview | `final-checkpoint-browser.log`: 29 PASS; one counter sampled before the reloaded terminal response. Waiting for that terminal response corrected the assertion; both device reruns PASS in `terminal-reload-retest.log`, closing the 30-case cohort |
| PDF original text retention | `pdf-preservation.log`: six PASS with actual decoded content streams, not page-count-only assertions |

Focused tests read back real XLSX, DOCX extraction, CSV, PNG/JPEG/WebP, PDF and recorded-video bytes. They cover nine QR content modes with independently decoded PNG/SVG, compressed-size targets, three image export formats, PDF layout options, Unicode overlays, escaped/folded calendar/contact properties, two independent hashes, file comparison and conversation/task recovery. Supplier, database, account and payment endpoints used by browser contract tests are isolated mocks. A route/render PASS is not counted as proof of every output option.

Earlier interrupted suites are retained as evidence but are not classified as completed PASS runs. The initial output run had three genuine Unicode PDF failures and eight test fixture/selector failures; the actual failed artifacts and traces are preserved.

## Tool matrix and remaining acceptance scope

`node scripts/audit/tool-function-inventory-v83.cjs` produces a 121-tool JSON/CSV matrix with page source, declared capability, named test references and comparison source. Current conservative discovery finds 60 tools with explicit named tests; generic loops cover additional routes/controls/languages, so that number is not an exhaustive feature coverage percentage. All-tool route and language loops are distinct from real file-output tests.

Live paid image/video/model quality and supplier delivery remain outside this release's acceptance because the owner declined paid testing. Simulated supplier tests validate the actual archive/compose/charging boundaries, not a real AI film. Specialist OCR models, external engines, browser codecs, fonts, Vercel protection and the .cn gateway require their own availability/output checks. Previously recorded dependency advisories and Supabase configuration review findings are retained in the V85 report; this release does not erase them or claim zero global risk.

## Open-source comparison and skills

- [ComfyUI official source](https://github.com/Comfy-Org/ComfyUI): reusable workflows and separate local/API execution are useful patterns. It requires a working inference runtime/model/hardware; installing a skill does not supply free hosted inference. GPL source was not copied into this product, and no model weights or GPU service were installed automatically.
- [Chrome canvas stream documentation](https://developer.chrome.com/blog/capture-stream/): used browser-native capture and recording for a real, bounded, no-supplier-cost preview. This is an independently authored renderer, not borrowed generated-film code.
- [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545) and [RFC 6350](https://www.rfc-editor.org/rfc/rfc6350): unfolded logical lines and escaped structured text guide the shared calendar/contact implementation.
- [pdf-lib font API](https://pdf-lib.js.org/docs/api/classes/pdffont): validate font encodability before drawing; retain the library's original page model and add only the supported overlay.
- [robfig Cron parser](https://github.com/robfig/cron/blob/master/parser.go): compared single-number step expansion and malformed range/step rejection. Independently authored the corrected TypeScript behavior without copying Go source.

The 19 previously installed, license-reviewed Codex development/audit skills remain available. They are development tools, not SASI model execution services. No unrelated or unreviewed skill was installed to imply a free AI video capability.

## Mini Programs

Main `wxbf4ae90406e7e26b` 5.5 was formally published on October 13. The temporary-mail account's authenticated version-management page now shows **2.0 online**, published **2026-10-14 11:16:49**, and no pending review. This was an observed pre-existing release, not an action performed by this audit.

Byte comparisons between the uploaded and current native build outputs show no changed files for either Mini Program (`mini-package-comparison.json`). This release changes web-view content and server behavior, not registered native pages. A duplicate native upload/review was therefore unnecessary. Main 5.5 and temporary-mail 2.0 will load the deployed website changes.

Mailbox billing remains unchanged: daily free allowance is ten per IP and ten per account, paid batch price is ¥0.05 per inbox. No billing gate was disabled or price modified.

## Release receipt

The final source and this report belong to one unified main commit. Production deployment SHA/state/aliases and online verification are recorded after push in `_local/handoff/function-acceptance-v86/release-final.json`; that receipt must match this commit before reporting deployment success. The broad discovery run and final targeted cohorts remain separate evidence; this is not represented as a fresh zero-failure full-suite run after every last change.
