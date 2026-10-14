# Ten-topic audit and open skills — 2026-10-14

The audit inspected the current repository, ran ten distinct topic verification rounds, installed reviewed open skills and repaired confirmed document and dependency issues. Ten rounds means the ten topics below; it does not mean every tool was executed ten times or that every global platform was examined. Supplier/payment adapters in the tests are isolated. No paid model service, production user write or payment was performed.

## Ten-round evidence

Reproduce with `node scripts/audit/ten-round-audit-v85.mjs`. Per-command logs and results are in `_local/handoff/ten-round-audit-v85/report.json`.

| Round | Topic | Checks | Result |
|---|---|---:|---|
| 1 | Public inventory, editable numbers, ID generation | 3 | PASS |
| 2 | Text, structured data, XML and regex bounds | 4 | PASS |
| 3 | Image limits, watermark resources, result ZIP integrity | 3 | PASS |
| 4 | Office/EPUB semantics, archive bounds, converter limits | 3 | PASS |
| 5 | Remote media imports, ranges, body completion, archived media validation | 4 | PASS |
| 6 | Burn-after-read tokens/files and engine path sandbox | 4 | PASS |
| 7 | SASI streaming, routing and delivery boundaries | 4 | PASS |
| 8 | Recoverable episodes, provider claims and video-result validity | 4 | PASS |
| 9 | Mailbox quota/charging, money lifecycle/refunds, Mini profiles/share | 6 | PASS |
| 10 | Engine license registry, patched dependency compatibility, security/release contracts | 5 | PASS |

These 40 script checks are separate from the full browser regression. The public inventory has **121 tools**, and the numeric scan found **39 controls** with no eager native onChange coercion. Named test references are only a conservative discovery aid, not a complete per-tool feature coverage metric.

## Confirmed findings and repairs

1. **Office empty-node content corruption**: paired-tag-only expressions could consume a subsequent nonempty cell/row after a self-closing one. Fixed both XLSX → CSV and SASI document intake, preserved coordinates and blank rows, and rejected duplicate coordinates instead of silently overwriting content. A late extension reproduced the same root cause in empty shared-string table items (`1` returned instead of `Expected`); both readers were repaired and targeted script/browser tests were added. The full 904-case run precedes this narrowly scoped follow-up; its final targeted checks are recorded separately rather than counted as a repeated full run.
2. **XML entity fidelity**: repeated replacement decoded escaped literal entity spellings twice and did not decode numeric Unicode references. Five readers now use a single-pass XML decoder, including the server-side SASI extractor. Tests preserve literal `&quot;`, non-BMP Unicode, quotes and angle brackets, and reject invalid Unicode references. HTML-specific tolerant readers were excluded from the XML decoder migration because they have a different entity/error contract.
3. **EPUB order mismatch**: SASI intake sorted filenames while the dedicated tool used package spine order; URL fragments could also prevent matching the ZIP member. Both paths now use one bounded spine reader, resolve relative chapter references/fragments, exclude script/style text, and fail on missing/external chapter references instead of silently returning partial text.
4. **ZIP indexing allocation**: post-load entry limits ran after JSZip allocated member objects. A central-directory preflight now validates counts and declared expanded size before JSZip indexes the archive. Multi-disk/ZIP64 containers are outside the bounded Office/EPUB policy; ordinary under-50-MiB Office/EPUB archives remain covered. Actual decompressed chunk counters remain in place.
5. **Dependency advisories**: the initial production audit reported 4 high and 4 moderate advisories. Updated Sharp to **0.35.5**, PostCSS to **8.5.29**, source-map-js to **1.2.2**, ExcelJS's UUID dependency to **11.1.1**, and selector-parser to **7.1.6**. Patched two dependencies without upstream fixed releases locally; see `patches/README.md`. Raw full-tree audit still reports **braces (high, development tree)** and **sprintf-js (moderate, Mammoth's CLI argument parser)**. No ignore rules were added. Guard tests pass; advisory presence is not hidden, and local mitigation is not presented as an upstream fix.

The old duplicate EPUB reader and five duplicate XML decoding implementations were removed/replaced. Package/lock changes were verified with a frozen install. Unrelated work remains untouched.

## Independent comparison

| Primary source | Actual comparison | Applied advantage |
|---|---|---|
| [Squoosh resize source](https://github.com/GoogleChromeLabs/squoosh/blob/e8d35e0fb66eb16eff6fe8fc773eabcbb7128de3/src/features/processors/resize/client/index.tsx) | Form validity before committing dimensions; image processing options | Numeric draft/commit behavior and image boundary/output checks retained and revalidated; no source copied |
| [CyberChef Recipe](https://github.com/gchq/CyberChef/blob/efe2781e60fcd02352a44013020607df251c4a86/src/core/Recipe.mjs) | Ingredient validation before operation execution; typed failure boundaries | Input/error/timeout and conversion round-trip checks; no implementation copied |
| [LibreChat resumable SSE](https://github.com/LibreChat-AI/LibreChat/blob/e1dfc10449ff713faffacd60273fddcfe2c0a698/client/src/hooks/SSE/useResumableSSE.ts) | Conversation IDs, resumed duplicate-start state, reconnect/replay lifecycle | Compared SASI streaming/history/task tests against these failure paths; not claimed to reproduce every LibreChat feature |
| [W3C EPUB spine](https://www.w3.org/TR/epub-33/#sec-spine) | Declared reading order instead of alphabetic ZIP ordering | Shared EPUB reader and fragment/order regression fixtures |
| [ExcelJS](https://github.com/exceljs/exceljs) | Workbook interoperability and output readback | Real workbook/conditional formatting round trip and 80 seeded CSV→XLSX→CSV cases |
| [OWASP upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) | Bound archive work and decoded content | Directory preflight plus declared/actual decompression bounds |

The three source snapshots were read without executing their code. Squoosh/CyberChef are Apache-2.0; LibreChat is MIT. Dify was considered as a workflow reference, but its [license has additional conditions](https://github.com/langgenius/dify/blob/main/LICENSE), so it was not copied into the multi-user product. Registry API rate limiting interrupted one metadata attempt; direct read-only git source retrieval succeeded. No unavailable metadata was treated as a clean verdict.

## Installed open skills

**19 packages installed and source-hash checked**, pinned to commits, in `C:/Users/30780/.codex/skills`. Machine-readable catalog: `docs/operations/installed-open-skills-v85-20261014.json`. Full reviewed-source hashes: `_local/handoff/skill-audit-v85/installed.json`.

- OpenAI (Apache-2.0): playwright, playwright-interactive, screenshot, security-best-practices, security-ownership-map, security-threat-model, gh-fix-ci, gh-address-comments.
- Anthropic (Apache-2.0): frontend-design, webapp-testing, mcp-builder.
- Trail of Bits (CC-BY-SA-4.0): audit-context-building, differential-review, property-based-testing, variant-analysis, sharp-edges, supply-chain-risk-auditor, post-patch-validation, dimensional-analysis.

Upstream package contents were kept unchanged; license and source provenance were retained. Third-party helper scripts were inspected but not executed during installation. Paid API/model services were not activated. These are Codex development/audit skills, discoverable on the next turn; installing them does not automatically add SASI product features. Existing equivalent plugins were not duplicated, and irrelevant/account-dependent/paid skills were not indiscriminately installed.

## Remaining verification and limits

- Supabase security advisors were read for project `sxsgdpqojepgbbrxrzlq` without reading user rows: 88 `rls_enabled_no_policy` INFO findings and two WARN categories. RLS with no policies denies direct client access; these tables must be judged against their server-only access paths, not automatically opened with permissive policies. The authenticated SECURITY DEFINER balance function's actual database definition contains a null-user rejection and `auth.uid() is distinct from p_user_id` guard, permitting the privileged service role explicitly. This warning was reviewed, not classified as a confirmed cross-user read. The remaining [leaked-password protection configuration warning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) was recorded; the official feature requires Pro or above, and no subscription or auth-setting change was made. Evidence: `_local/handoff/ten-round-audit-v85/supabase-security-advisors.json`. This metadata review is not a full live database privilege or cross-user integration test.

- Source gate: PASS (`_local/handoff/source-tools-v85.log`). Build: PASS, 1305 pages (`build-tools-v85.log`).
- `test-office-semantics-v85.cjs`: PASS; 80 seeded real ZIP conversion round trips and specific corruption/ordering cases.
- Full desktop/mobile browser regression: **904/904 PASS**, 18.0 minutes, no retry/skip (`_local/handoff/browser-full-v85.log`).
- Late shared-string follow-up: the failing reproduction returned `1` instead of `Expected` (`shared-string-repro-v85.log`). After the two-reader repair, all 40 topic checks passed again, the 1305-page build passed (`build-tools-v85-shared-final.log`), and **12/12 targeted desktop/mobile document-output tests passed** (`browser-shared-final-v85.log`). The full suite was not redundantly repeated for this parser-only change.
- Actual baseline source `4e54eb72` reproduced empty-cell column shift (`7` instead of `,7`) and EPUB order reversal; repaired source returned the expected values. Evidence: `_local/handoff/ten-round-audit-v85/baseline-reproduction.json`.
- Read-only Supabase performance advisors: 31 unindexed-foreign-key INFO, 15 auth-RLS-initplan WARN, one no-primary-key INFO and 93 unused-index INFO. These are optimization/review leads, not evidence of a measured production outage. No policies/indexes were changed or deleted without workload validation; live performance tuning remains outside this code release. Evidence: `_local/handoff/ten-round-audit-v85/supabase-performance-advisors.json`; [RLS initplan guidance](https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan).
- Production deployment and live output checks: receipts recorded after completion in `_local/handoff/`. Deployment success must be read before declaring release success.
- Real supplier video rendering remains untested by user instruction; successful isolated failure/recovery tests do not prove provider speed, costs or output quality.
- All tools' every optional feature/file type/provider is not claimed fully accepted. The complete public browser inventory plus explicit functional tests is the stated verification boundary.
