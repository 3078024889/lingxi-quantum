import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";

const read=p=>readFileSync(p,"utf8");
const script=read("scripts/ops/cn-payment-activate-3194-20261110.sh");
const paypal=read("scripts/ops/cn-payment-live-probe-3194-20261110.mjs");
const signed=read("scripts/ops/cn-payment-signed-live-probe-20261109.mjs");
const upgrade=read("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.template.sh");

test("payment activation is pinned to the exact 20261110 service on isolated port 3195",()=>{
 assert.match(script,/TAG" =~ \^ecs-cn-unified-20261110-/);
 assert.match(script,/SVC="lingxifield-cn-release-20261110-\$SHORT"/);
 assert.match(script,/FLAGS="\/etc\/lingxifield\/tool-pass-3195-\$SHORT\.env"/);
 assert.match(script,/PORT=3195/);
 assert.match(script,/127\.0\.0\.1:3195/);
 assert.doesNotMatch(script,/raw\.githubusercontent\.com|PROBE_URL/);
});

test("signed merchant audit inherits every live env file with flags applied last",()=>{
 assert.match(script,/mapfile -t LIVE_ENV_FILES/);
 assert.match(script,/env_props\+=\(--property="EnvironmentFile=\$f"\)/);
 assert.match(script,/env_props\+=\(--property="EnvironmentFile=\$FLAGS"\)/);
 assert.match(script,/systemd-run --quiet --wait --pipe --collect --unit="\$unit" "\$\{env_props\[@\]\}"/);
 assert.match(script,/CN_MERCHANT_ALIPAY_SIGNED_LIVE_PROBE=PASS/);
 assert.match(script,/CN_MERCHANT_WECHAT_SIGNED_LIVE_PROBE=PASS/);
 assert.match(script,/CN_MERCHANT_PAYPAL_LIVE_PROBE=PASS/);
 assert.match(script,/CN_TOOLPASS_BACKEND_READINESS=PASS/);
 assert.match(script,/CN3195_ALL_THREE_LIVE_MERCHANTS_AND_TOOLPASS_BACKEND_AUDIT_PASS_FLAGS_UNCHANGED/);
 assert.match(script,/CN_ALL_THREE_PAYMENT_PROVIDERS_ENABLED/);
 assert.match(script,/CN_TOOLPASS_COMMERCE_READY_WITH_FOUR_PLANS/);
 assert.match(script,/CN_UNSIGNED_WEBHOOK_/);
 assert.match(script,/UNSIGNED_WEBHOOK_REJECTION_FAILED/);
});

test("payment rollback and wallet refund gates remain fail-closed",()=>{
 assert.match(script,/cp -a "\$FLAGS" "\$BACKUP"/);
 assert.match(script,/CN_PAYMENT_ACTIVATION_FAILED_ROLLBACK/);
 assert.match(script,/SASI_RMB_BALANCE_V1_ENABLED/);
 assert.match(script,/CNY_REFUND_GATE/);
 assert.match(script,/USD_REFUND_GATE/);
 assert.match(script,/CN_CNY_WALLET_TOPUP_REMAINS_CLOSED_REFUND_FLOW_NOT_TESTED/);
 assert.match(script,/CN_USD_WALLET_TOPUP_REMAINS_CLOSED_REFUND_FLOW_NOT_TESTED/);
 assert.match(script,/SOFTWARE_COMMERCE_REMAINS_GATED_UNTIL_PRIVATE_PACKAGE_SCAN_AND_VERIFICATION/);
 assert.doesNotMatch(script,/SASI_MARKET_SALES_ENABLED[" ]*[:=][" ]*true/);
 assert.doesNotMatch(script,/SASI_MARKET_PAYOUTS_ENABLED[" ]*[:=][" ]*true/);
});

test("PayPal Live no-charge probe verifies OAuth, webhook identity and refund events",()=>{
 assert.match(paypal,/https:\/\/api-m\.paypal\.com\/v1\/oauth2\/token/);
 assert.match(paypal,/https:\/\/lingxifield\.cn\/api\/pay\/paypal\/webhook/);
 assert.match(paypal,/PAYMENT\.CAPTURE\.REFUNDED/);
 assert.match(paypal,/CN_MERCHANT_PAYPAL_LIVE_PROBE=PASS/);
});

test("Alipay and WeChat signed probe accepts the new service identity and never logs keys",()=>{
 assert.match(signed,/lingxifield-cn-release-20261110-\[a-f0-9\]\{12\}/);
 assert.match(signed,/ALIPAY_PRIVATE_KEY/);
 assert.match(signed,/WECHAT_PLATFORM_PUBLIC_KEY_ID/);
 assert.match(signed,/CN_MERCHANT_PUBLIC_READY_JSON/);
 assert.doesNotMatch(signed,/console\.log\([^\n]*(PRIVATE_KEY|API_V3_KEY|access_token)/i);
 execFileSync(process.execPath,["--check","scripts/ops/cn-payment-signed-live-probe-20261109.mjs"]);
});

test("upgrade script detects old 3193/3194 upstream and promotes 3195 with rollback",()=>{
 assert.match(upgrade,/PORT=3195/);
 assert.match(upgrade,/3193\|3194/);
 assert.match(upgrade,/find_service_for_port/);
 assert.match(upgrade,/CN3195_ACTIVE_BASELINE_PASS/);
 assert.match(upgrade,/CN3195_STAGE_GATE_FAILED_PREVIOUS_UPSTREAM_UNCHANGED/);
 assert.match(upgrade,/CN3195_NGINX_PROMOTION_PASS/);
 assert.match(upgrade,/CN3195_ROLLBACK_TO_PREVIOUS_UPSTREAM_PASS/);
 assert.match(upgrade,/NGINX_BACKUP/);
 assert.match(upgrade,/TOOL_PASS_COMMERCE_READY=false/);
 assert.match(upgrade,/WECHAT_ENABLED=false/);
 assert.match(upgrade,/ALIPAY_ENABLED=false/);
 assert.match(upgrade,/PAYPAL_ENABLED=false/);
 assert.match(upgrade,/SOFTWARE_COMMERCE_READY=false/);
 assert.doesNotMatch(upgrade,/__CHECK_SHA__|EXPECTED_CHECK_SHA/);
});
