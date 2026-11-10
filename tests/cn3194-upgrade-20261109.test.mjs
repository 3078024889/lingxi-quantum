import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const stage=readFileSync("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261109.sh","utf8");
const activate=readFileSync("scripts/ops/cn-payment-activate-3194-20261109.sh","utf8");

test("3194 upgrade is pinned to the exact new artifact and prior 3193 baseline",()=>{
  assert.match(stage,/EXPECTED_SHA="9230bcba6a24cce408b56eee78108561b2b573ca"/);
  assert.match(stage,/EXPECTED_ARCHIVE_SHA="9d007903bc1996c273ed37013c934e4d002d7c536e059c56cc011d8928df56ab"/);
  assert.match(stage,/EXPECTED_ARCHIVE_BYTES="454770678"/);
  assert.match(stage,/OLD_SVC=lingxifield-cn-release-20261108-8729bf958a56/);
  assert.match(stage,/old_sha.*8729bf958a565ec1dbd2776082416c83170b1d73/s);
  assert.match(stage,/PORT=3194/);
});

test("stage and rollback preserve the old 3193 service",()=>{
  assert.match(stage,/127\.0\.0\.1:3193/);
  assert.match(stage,/127\.0\.0\.1:3194/);
  assert.match(stage,/NGINX_BACKUP/);
  assert.match(stage,/UNIT_BACKUP/);
  assert.match(stage,/CN3194_ROLLBACK_TO_3193_PASS/);
  assert.match(stage,/OLD_3193_SERVICE_RETAINED_ACTIVE_FOR_ROLLBACK/);
  assert.doesNotMatch(stage,/systemctl\s+(?:stop|disable)\s+"\$OLD_SVC"/);
  assert.ok(stage.indexOf('if [[ "$MODE" == "--rollback" ]]') < stage.indexOf("\nold_live\nload_env_files"));
});

test("new wallet and tools layouts are part of the live 3194 probe",()=>{
  assert.match(stage,/lx26-wallet-page/);
  assert.match(stage,/lx26-tools-page/);
  assert.match(stage,/CN3194_FOUR_TOOLPASS_OFFERS_PASS/);
  assert.match(stage,/api\/sasi\/account 401/);
  assert.match(stage,/api\/sasi\/generation\/submit 410/);
  assert.match(stage,/api\/cron\/sasi-v5-radar 410/);
});

test("promotion remains fail-closed for payment and marketplace until signed audit",()=>{
  for(const flag of ["WECHAT_ENABLED=false","ALIPAY_ENABLED=false","PAYPAL_ENABLED=false",
    "TOOL_PASS_COMMERCE_READY=false","SASI_MARKET_SALES_ENABLED=false",
    "SASI_MARKET_UPLOADS_ENABLED=false","SASI_MARKET_DELIVERY_ENABLED=false",
    "SASI_MARKET_PAYOUTS_ENABLED=false","SASI_MARKETPLACE_COMMERCE_READY=false"])
    assert.ok(stage.includes(flag),flag);
  assert.doesNotMatch(stage,/PAYPAL_ENABLED=true|SASI_MARKETPLACE_COMMERCE_READY=true/);
});

test("CNY activation requires signed no-charge probe and keeps PayPal off",()=>{
  assert.match(activate,/--audit/);
  assert.match(activate,/CN_MERCHANT_ALIPAY_SIGNED_LIVE_PROBE=PASS/);
  assert.match(activate,/CN_MERCHANT_WECHAT_SIGNED_LIVE_PROBE=PASS/);
  assert.match(activate,/PAYPAL_ENABLED":"false"/);
  assert.match(activate,/NGINX_NOT_USING_3194/);
  assert.match(activate,/CN_UNSIGNED_WEBHOOK/);
  assert.match(activate,/FIRST_REAL_ORDER_WEBHOOK_AND_DELIVERY_ACCEPTANCE_REMAINS_REQUIRED/);
  assert.doesNotMatch(activate,/PAYPAL_ENABLED":"true"/);
});


const runner=readFileSync("scripts/ops/ecs-cn3194-release-runner-20261109.sh","utf8");

test("3194 release runner supports older curl without retry-all-errors",()=>{
  assert.match(runner,/CURL_COMPATIBILITY_MODE/);
  assert.doesNotMatch(runner,/^\s*curl\b[^\n]*--retry-all-errors/m);
  assert.match(runner,/curl --noproxy '\*' -fL --connect-timeout 30 -C -/);
  assert.match(runner,/seq 1 40/);
  assert.match(runner,/UPGRADE_BLOB_SHA="41b7248f672c94a84a447a340568d378c9debf3a"/);
  assert.match(runner,/PAYMENT_BLOB_SHA="897a38e8b90c93168396181555a7a008e01c0e24"/);
});

test("3194 runner verifies pinned scripts and release before staging",()=>{
  assert.match(runner,/GITHUB_SCRIPT_BLOB_MISMATCH/);
  assert.match(runner,/ARCHIVE_SHA="9d007903bc1996c273ed37013c934e4d002d7c536e059c56cc011d8928df56ab"/);
  assert.match(runner,/ARCHIVE_BYTES="454770678"/);
  assert.match(runner,/TAG="ecs-cn-unified-20261108-9230bcba6a24"/);
  assert.match(runner,/SOURCE_SHA="9230bcba6a24cce408b56eee78108561b2b573ca"/);
  assert.match(runner,/SOURCE_REF="0ee8f55e04f24e4a2505cf35d8855235dfc6357e"/);
  assert.match(runner,/EXACT_SOURCE_SHA_PASS/);
  assert.ok(runner.indexOf("sha256sum -c") < runner.indexOf('--stage-local'));
  assert.ok(runner.indexOf("EXACT_SOURCE_SHA_PASS") < runner.indexOf('--stage-local'));
});

test("static-only 3194 release never enables payments or commerce",()=>{
  assert.ok(runner.includes('bash "$PAYMENT" --audit "$TAG"'));
  assert.match(runner,/PAYMENT_REMAINS_CLOSED_DYNAMIC_GO_LIVE_DEFERRED_TO_TOMORROW/);
  assert.doesNotMatch(runner,/--enable "$TAG"/);
});


const runner20261110=readFileSync("scripts/ops/ecs-cn3194-release-runner-20261110.sh","utf8");
const stage20261110=readFileSync("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.sh","utf8");

test("20261110 runner uses isolated temp files, bounded resumable downloads and exact immutable pins",()=>{
  assert.ok(runner20261110.includes('tmp="${dest}.part"'));
  assert.ok(!runner20261110.includes('tmp="2.part"'));
  assert.ok(runner20261110.includes("--max-time 900 -C -"));
  assert.ok(runner20261110.includes("curl --noproxy '*' -4 -fL --connect-timeout 30 --max-time 180"));
  assert.ok(runner20261110.includes("curl --noproxy '*' -4 -fL --connect-timeout 30 --max-time 900 -C -"));
  assert.ok(runner20261110.includes("curl --noproxy '*' -4 -fL --connect-timeout 30 --max-time 900 \"$url\" -o \"$dest\""));
  assert.ok(runner20261110.includes('--max-time 900 "$url" -o "$dest"'));
  assert.ok(runner20261110.includes('SOURCE_REF="6160c1eb9251409e9fbdf3f478787c49f2318357"'));
  assert.ok(runner20261110.includes('UPGRADE_BLOB_SHA="41b7248f672c94a84a447a340568d378c9debf3a"'));
  assert.ok(runner20261110.includes('PAYMENT_BLOB_SHA="897a38e8b90c93168396181555a7a008e01c0e24"'));
  assert.ok(runner20261110.includes('ARCHIVE_SHA="9d007903bc1996c273ed37013c934e4d002d7c536e059c56cc011d8928df56ab"'));
  assert.ok(runner20261110.includes('ARCHIVE_BYTES="454770678"'));
  for(const mode of ["--plan","--stage-local","--verify-stage","--promote"])
    assert.ok(runner20261110.includes('bash "$UPGRADE" '+mode));
  assert.ok(runner20261110.includes('bash "$PAYMENT" --audit "$TAG"'));
  assert.ok(runner20261110.includes("PAYMENT_REMAINS_CLOSED_DYNAMIC_GO_LIVE_DEFERRED_TO_TOMORROW"));
  assert.ok(!runner20261110.includes('--enable "$TAG"'));
});

test("20261110 stage keeps 3193 rollback, verifies the new UI and keeps commerce disabled",()=>{
  assert.ok(stage20261110.includes('EXPECTED_SHA="9230bcba6a24cce408b56eee78108561b2b573ca"'));
  assert.ok(stage20261110.includes('OLD_SVC=lingxifield-cn-release-20261108-8729bf958a56'));
  assert.ok(stage20261110.includes('PORT=3194'));
  assert.ok(stage20261110.includes('CN3194_STAGE_GATE_FAILED_3193_UNCHANGED'));
  assert.ok(stage20261110.includes('CN3194_NGINX_PROMOTION_PASS'));
  assert.ok(stage20261110.includes('OLD_3193_SERVICE_RETAINED_ACTIVE_FOR_ROLLBACK'));
  assert.ok(stage20261110.includes('PAYMENT_FLAGS_REMAIN_CLOSED_UNTIL_SIGNED_MERCHANT_AUDIT'));
  for(const flag of [
    "TOOL_PASS_COMMERCE_READY=false","WECHAT_ENABLED=false","ALIPAY_ENABLED=false",
    "PAYPAL_ENABLED=false","SASI_MARKET_SALES_ENABLED=false","SASI_MARKET_UPLOADS_ENABLED=false",
    "SASI_MARKET_DELIVERY_ENABLED=false","SASI_MARKET_PAYOUTS_ENABLED=false",
    "SASI_MARKETPLACE_COMMERCE_READY=false","SOFTWARE_COMMERCE_READY=false"
  ]) assert.ok(stage20261110.includes(flag),flag);
  assert.ok(stage20261110.includes("lx26-wallet-page"));
  assert.ok(stage20261110.includes("lx26-tools-page"));
  assert.ok(stage20261110.includes("code /api/sasi/generation/submit 410"));
  assert.ok(stage20261110.includes("code /api/sasi/account 401"));
  assert.ok(!stage20261110.includes('systemctl stop "$OLD_SVC"'));
  assert.ok(!stage20261110.includes('systemctl disable "$OLD_SVC"'));
});
