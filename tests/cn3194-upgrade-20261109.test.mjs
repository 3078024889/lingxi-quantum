import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const stage=readFileSync("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261109.sh","utf8");
const activate=readFileSync("scripts/ops/cn-payment-activate-3194-20261109.sh","utf8");

test("3194 upgrade is pinned to the exact new artifact and prior 3193 baseline",()=>{
  assert.match(stage,/EXPECTED_SHA="5054d6f492c14c7f476acbfb3152a28b1a308a30"/);
  assert.match(stage,/EXPECTED_ARCHIVE_SHA="4368bd5956dd2f68f6aa46a564ffeef5751fb68d78903182f754831d352602ea"/);
  assert.match(stage,/EXPECTED_ARCHIVE_BYTES="454674344"/);
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
  assert.match(stage,/lx-cel-wallet-page/);
  assert.match(stage,/lx-cel-tools-page/);
  assert.match(stage,/CN3194_FOUR_TOOLPASS_OFFERS_PASS/);
  assert.match(stage,/api\/sasi\/account 401/);
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
