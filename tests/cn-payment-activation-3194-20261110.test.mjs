import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const script=readFileSync("scripts/ops/cn-payment-activate-3194-20261110.sh","utf8");
const probe=readFileSync("scripts/ops/cn-payment-live-probe-3194-20261110.mjs","utf8");
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
 "CN_USD_WALLET_REFUND_GATE=PASS"
])assert.ok(script.includes(token),token);
assert.match(script,/for item in "alipay\|\/api\/pay\/alipay\/notify/);
assert.match(script,/CN_UNSIGNED_WEBHOOK_\\$name HTTP=\\$status/);
assert.match(script,/UNSIGNED_WEBHOOK_REJECTION_FAILED/);
assert.match(script,/cp -a "\$FLAGS" "\$BACKUP"/);
assert.match(script,/CN_PAYMENT_ACTIVATION_FAILED_ROLLBACK/);
assert.match(script,/PAYPAL_ENABLED/);
assert.match(script,/TOOL_PASS_COMMERCE_READY/);
assert.match(script,/SOFTWARE_COMMERCE_REMAINS_GATED_UNTIL_PRIVATE_PACKAGE_SCAN_AND_VERIFICATION/);
assert.doesNotMatch(script,/SASI_MARKET_PAYOUTS_ENABLED.*true/);
assert.match(probe,/https:\/\/api-m\.paypal\.com\/v1\/oauth2\/token/);
assert.match(probe,/https:\/\/lingxifield\.cn\/api\/pay\/paypal\/webhook/);
assert.match(probe,/PAYMENT\.CAPTURE\.REFUNDED/);
console.log("CN3194_SIGNED_LIVE_ACTIVATION_NO_RAW_GITHUB_FAIL_CLOSED_CONTRACT_PASS");
