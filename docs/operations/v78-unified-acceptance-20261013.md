# V78 unified acceptance — 2026-10-13

## Integrated source

97 code/test/configuration files were integrated from the isolated worktree into the current main working tree, against baseline 05a8cddbe29476637d3efd2fdf575824de0f7339. A normalized-content comparison passed for every file. Seven unreferenced modules were removed. Other tasks' pre-existing working-tree changes were preserved. No V78 remote commit, production migration, web deployment or mini 5.5 upload has occurred.

Changes cover editable numeric drafts; owned conversation persistence and local recovery; project/service-return continuity; durable episode planning; atomic batch approval/reservation; leased supplier polling; server-side episode assembly and private delivery; video format/duration/resolution/aspect checks before successful billing; native public mini sharing; and AI image entry points.

## Verification receipts

| Verification | Result | Evidence |
|---|---|---|
| Main frozen dependency install | PASS | install-main-v78-20261013.log |
| Main baseline | PASS | baseline-main-v78-20261013.log |
| Main source gate | PASS | source-main-v78-20261013.log |
| Main source gate after model-routing changes | PASS | source-model-routing-closed-v78-20261013.log |
| Playwright import contract after model-routing changes | PASS | playwright-model-routing-v78-20261013.log |
| Main Playwright import contract | PASS | playwright-contract-main-v78-20261013.log |
| Main production build | PASS | build-main-v78-20261013.log |
| Final fixed-source model-routing production build | PASS, 1,305 pages; final model-ID validation confirmed in artifact | build-model-routing-closed-v78-20261013.log |
| Isolated production build including video specification checks | PASS | build-video-spec-final-v78.log |
| Full mobile browser suite in main | 414 PASS | mobile-main-v78-20261013.log |
| Full desktop browser suite after upload-readiness correction in main | 414 PASS | desktop-main-readiness-v78-20261013.log |
| Mobile affected upload/numeric files after readiness correction | 54 PASS | mobile-main-readiness-v78-20261013.log |
| Per-capability model routing and owned credential-preserving edits | PASS, isolated adapters, no supplier calls | scripts/test-model-routing-v78.cjs |
| Model preferences migration, conversation concurrency and ownership | PASS, actual isolated native PostgreSQL | pg-model-routing-v78-20261013.log |
| Final connection settings and conversation/creation continuity browser regression | 34 PASS, desktop and mobile; authenticated/provider boundaries mocked | browser-model-routing-v78-20261013.log |
| Actual image/PDF output tests after readiness correction | 18 PASS, both projects | output-readiness-v78.log |
| SASI recovery, batch confirmation and connection tests | 46 PASS, both projects | sasi-recovery-targeted-v78.log |
| Last desktop rerun | INCOMPLETE: execution session ended at 205 cases | desktop-video-spec-final-v78.log |
| Numeric input inventory | 39 JSX controls scanned; no eager numeric coercion violations | artifacts/numeric-input-audit-v78/inventory.json |
| Real resize output | 356x267 decoded JPEG, both projects | numeric-continuity-release-v78.log |
| Local PostgreSQL ownership, idempotency and transaction contracts | PASS, isolated test data | pg-acceptance-v78.log |
| Background MP4 composition and private archive boundary | PASS, actual fixture bytes and full decoding; network/storage/database isolated | source-video-spec-final-v78.log |
| Mini 5.5 official CI compile | PASS, not uploaded | mini-5.5-20261012-compile.json |

Log files are retained under local ignored _local/handoff; rows marked pending must be updated from actual process completion, never inferred. Earlier failures remain recorded. Browser suites mix real local file processing with explicitly mocked authenticated/supplier boundaries; page rendering is not proof that all remote paid tool outputs were accepted.

## Outstanding acceptance

- Real supplier video generation, provider latency, complete 50-episode output, audio/character continuity and final delivery quality have not passed real-provider acceptance. The review connection has no configured video model ID. On October 13 the user confirmed that the model is not enabled and explicitly declined paid testing. No opening purchase, recharge or supplier generation is authorized.
- Seedance 2.5 official documentation lists opening eligibility based on account balance, a saving plan or remaining resource-pack credit. It does not state that each video costs 200 CNY: https://docs.volcengine.com/docs/ark/seedance-2-5?lang=zh .
- Six production migrations were applied during the V79 audit and aligned to actual production versions 20261013010553, 20261013010556, 20261013010559, 20261013010609, 20261013010614, 20261013010618. Readback verified private-table RLS, client RPC denial and pg_cron/pg_net installation. Worker schedule activation still waits for the correct web deployment. No production users or funds were modified as test fixtures. See the V79 report for final release status.
- Real WeChat formal recipient sharing, search availability and filing status require separate platform/device verification. Experience-version permissions are not fixed merely by uploading a new experience build.
- Mini 5.5 formal release remains conditional on the requested acceptance closure and WeChat approval. Compile, upload, review and formal publication must be recorded separately.

## Publication status

V78 is included in the unified V79 submission after source/build gates and documented browser regression. The V79 audit report records the final acceptance and limitations; post-commit deployment receipt is retained under local ignored _local/handoff/v79-release-receipt.json. No claim is made that all SASI functions or all tools have passed real-world acceptance.

Historical D-drive backup cleanup is not complete: automatic approval review rejected recursive removal of 51 backup directories (291 files), reporting “blocked by policy.” That action was not retried through another shell or tool. Active worktrees, keys and personal files remain protected.

2026-10-13 model check: official model list confirms doubao-seedance-2-5-260628 (https://docs.volcengine.com/docs/82379/1330310). The marketing/series name supplied by the user is not recorded as a validated API alias. Read-only review-connection check still returned an empty configured model ID and empty discovered model list. No provider key was retrieved or displayed, no user configuration was changed, and no paid request was issued. Main browser suites completed with independent ignored output directories as recorded above. The later model-routing changes require their own source/build/browser verification; earlier full-suite results are retained as that earlier snapshot.

Model configuration reference: Vercel official model discovery and model types (https://vercel.com/docs/ai-gateway/models-and-providers), public catalog fetched without credentials: 458 models. Existing direct BYOK transport is preserved. No Gateway subscription, funding or key was created. Chat and video choices are separated; the image path continues to use its reviewed image profile and frozen quote, rather than inheriting the chat model. Model settings may be saved without retrieving or replacing the owner's stored key. Model endpoint/name ambiguity and provider entitlement are not treated as a successful paid-output test.
