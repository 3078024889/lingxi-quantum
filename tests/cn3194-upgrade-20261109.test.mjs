import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const stage=readFileSync("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261109.sh","utf8");
const activate=readFileSync("scripts/ops/cn-payment-activate-3194-20261109.sh","utf8");

test("3194 upgrade is pinned to the exact new artifact and prior 3193 baseline",()=>{
  assert.match(stage,/EXPECTED_SHA="2b48fb09bdcc5b48ba11f3ec9bb0b0473dc173de"/);
  assert.match(stage,/EXPECTED_ARCHIVE_SHA="d757c0d6697679443531af574fa07481fa864c8d0719431f3984059961bf0927"/);
  assert.match(stage,/EXPECTED_ARCHIVE_BYTES="454789546"/);
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
  assert.match(runner,/UPGRADE_BLOB_SHA="37aab5fb96a824bf603474c463cbc255e67a3282"/);
  assert.match(runner,/PAYMENT_BLOB_SHA="897a38e8b90c93168396181555a7a008e01c0e24"/);
});

test("3194 runner verifies pinned scripts and release before staging",()=>{
  assert.match(runner,/GITHUB_SCRIPT_BLOB_MISMATCH/);
  assert.match(runner,/ARCHIVE_SHA="d757c0d6697679443531af574fa07481fa864c8d0719431f3984059961bf0927"/);
  assert.match(runner,/ARCHIVE_BYTES="454789546"/);
  assert.match(runner,/EXACT_SOURCE_SHA_PASS/);
  assert.ok(runner.indexOf("sha256sum -c") < runner.indexOf('--stage-local'));
  assert.ok(runner.indexOf("EXACT_SOURCE_SHA_PASS") < runner.indexOf('--stage-local'));
});

test("static-only 3194 release never enables payments or commerce",()=>{
  assert.ok(runner.includes('bash "$PAYMENT" --audit "$TAG"'));
  assert.match(runner,/PAYMENT_REMAINS_CLOSED_DYNAMIC_GO_LIVE_DEFERRED_TO_TOMORROW/);
  assert.doesNotMatch(runner,/--enable "$TAG"/);
});
