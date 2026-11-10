import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {execFileSync} from "node:child_process";
const script=readFileSync("scripts/ops/cn-payment-activate-3194-20261110.sh","utf8");
const probe=readFileSync("scripts/ops/cn-payment-live-probe-3194-20261110.mjs","utf8");
const signed=readFileSync("scripts/ops/cn-payment-signed-live-probe-20261109.mjs","utf8");
const upgrade=readFileSync("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.template.sh","utf8");
const signed=readFileSync("scripts/ops/cn-payment-signed-live-probe-20261109.mjs","utf8");
const upgrade=readFileSync("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.template.sh","utf8");
assert.match(script,/PROBE_SHA="2aec891d25ea78769d9c12b8ae9a89016d4425a9"/);
assert.match(script,/cat > "\$PROBE\.part" <<'PAYPAL_PROBE'/);
assert.doesNotMatch(script,/raw\.githubusercontent\.com|PROBE_URL/);
assert.match(script,/git_blob_check "\$PROBE\.part" "\$PROBE_SHA"/);
assert.match(script,/cn-payment-signed-live-probe\.mjs/);
for(const token of [
 "CN_MERCHANT_ALIPAY_SIGNED_LIVE_PROBE=PASS",
 "CN_MERCHANT_WECHAT_SIGNED_LIVE_PROBE=PASS",
 "CN_MERCHANT_PAYPAL_LIVE_PROBE=PASS",
 "CN_TOOLPASS_BACKEND_READINESS=PASS",
 "CN_CNY_WALLET_REFUND_GATE=PASS",
 "CN_USD_WALLET_REFUND_GATE=PASS"
])assert.ok(script.includes(token),token);
assert.match(script,/for item in "alipay\|\/api\/pay\/alipay\/notify/);
assert.ok(script.includes('echo "CN_UNSIGNED_WEBHOOK_$name HTTP=$status"'));
assert.match(script,/UNSIGNED_WEBHOOK_REJECTION_FAILED/);
assert.match(script,/cp -a "\$FLAGS" "\$BACKUP"/);
assert.match(script,/CN_PAYMENT_ACTIVATION_FAILED_ROLLBACK/);
assert.match(script,/PAYPAL_ENABLED/);
assert.match(script,/SASI_RMB_BALANCE_V1_ENABLED/);
assert.match(script,/CNY_REFUND_GATE/);
assert.match(script,/CN_CNY_WALLET_TOPUP_REMAINS_CLOSED_REFUND_FLOW_NOT_TESTED/);
assert.match(script,/TOOL_PASS_COMMERCE_READY/);
assert.match(script,/SOFTWARE_COMMERCE_REMAINS_GATED_UNTIL_PRIVATE_PACKAGE_SCAN_AND_VERIFICATION/);
assert.doesNotMatch(script,/SASI_MARKET_PAYOUTS_ENABLED.*true/);
assert.match(probe,/https:\/\/api-m\.paypal\.com\/v1\/oauth2\/token/);
assert.match(probe,/https:\/\/lingxifield\.cn\/api\/pay\/paypal\/webhook/);
assert.match(probe,/PAYMENT\.CAPTURE\.REFUNDED/);

assert.match(script,/SVC="lingxifield-cn-release-20261110-\$SHORT"/);
assert.match(script,/FLAGS="\/etc\/lingxifield\/tool-pass-3195-\$SHORT\.env"/);
assert.match(script,/PORT=3195/);
assert.match(script,/mapfile -t LIVE_ENV_FILES/);
assert.match(script,/env_props\+=\(--property="EnvironmentFile=\$f"\)/);
assert.match(script,/env_props\+=\(--property="EnvironmentFile=\$FLAGS"\)/);
assert.match(script,/systemd-run --quiet --wait --pipe --collect --unit="\$unit" "\$\{env_props\[@\]\}"/);
assert.match(script,/127\.0\.0\.1:3195/);
assert.match(signed,/lingxifield-cn-release-20261110-\[a-f0-9\]\{12\}/);
assert.match(upgrade,/PORT=3195/);
assert.match(upgrade,/3193\|3194/);
assert.match(upgrade,/CN3195_ROLLBACK_TO_PREVIOUS_UPSTREAM_PASS/);
assert.match(upgrade,/CN3195_NGINX_PROMOTION_PASS/);
assert.match(upgrade,/SOFTWARE_COMMERCE_READY=false/);
execFileSync(process.execPath,["--check","scripts/ops/cn-payment-signed-live-probe-20261109.mjs"]);
console.log("CN3195_BLUE_GREEN_AND_LIVE_ENV_INHERITANCE_CONTRACT_PASS");

console.log("CN3195_SIGNED_LIVE_ACTIVATION_NO_RAW_GITHUB_FAIL_CLOSED_CONTRACT_PASS");
