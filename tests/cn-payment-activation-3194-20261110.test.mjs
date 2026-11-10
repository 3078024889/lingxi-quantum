import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";

const read=p=>readFileSync(p,"utf8");
const script=read("scripts/ops/cn-payment-activate-3194-20261110.sh");
const paypal=read("scripts/ops/cn-payment-live-probe-3194-20261110.mjs");
const signed=read("scripts/ops/cn-payment-signed-live-probe-20261109.mjs");
const upgrade=read("scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.template.sh");
const alipayNotify=read("app/api/pay/alipay/notify/route.ts");
const wechat=read("lib/wechatpay.ts");
const wechatNotify=read("app/api/pay/wechat/notify/route.ts");
const walletMigration=read("supabase/migrations/20261110050414_harden_legacy_ai_wallet_topup_order_state.sql");
const releaseWorkflow=read(".github/workflows/cn3194-payment-release-20261110.yml");

test("payment activation is pinned to final 3194; 3195 is temporary staging only",()=>{
 assert.match(script,/TAG" =~ \^ecs-cn-unified-20261110-/);
 assert.match(script,/SVC="lingxifield-cn-release-20261110-\$SHORT-final"/);
 assert.match(script,/FLAGS="\/etc\/lingxifield\/tool-pass-3194-\$SHORT\.env"/);
 assert.match(script,/PORT=3194/);
 assert.match(script,/127\.0\.0\.1:3194/);
 assert.match(script,/CN3194_PUBLIC_PAYMENT_ROUTE/);
 assert.match(script,/CN3194_NGINX_UPSTREAM_NOT_ACTIVE/);
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
 assert.match(script,/CN3194_ALL_THREE_LIVE_MERCHANTS_AND_TOOLPASS_BACKEND_AUDIT_PASS_FLAGS_UNCHANGED/);
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

test("legacy AI wallet topups reject failed/refunded orders and remain service-role only",()=>{
 assert.equal((walletMigration.match(/if coalesce\(o\.status,''\) not in \('pending','paid'\)/g)||[]).length,2);
 assert.equal((walletMigration.match(/SET search_path TO ''/g)||[]).length,2);
 assert.match(walletMigration,/REVOKE EXECUTE ON FUNCTION public\.credit_ai_topup\(uuid\) FROM PUBLIC, anon, authenticated/);
 assert.match(walletMigration,/REVOKE EXECUTE ON FUNCTION public\.credit_ai_usd_topup\(uuid\) FROM PUBLIC, anon, authenticated/);
 assert.match(walletMigration,/GRANT EXECUTE ON FUNCTION public\.credit_ai_topup\(uuid\) TO service_role/);
 assert.match(walletMigration,/GRANT EXECUTE ON FUNCTION public\.credit_ai_usd_topup\(uuid\) TO service_role/);
 assert.match(walletMigration,/o\.amount_usd is null/);
 assert.doesNotMatch(walletMigration,/^\s*(DELETE|TRUNCATE)\s/m);
});

test("WeChat verifies signed API responses and binds callback merchant identity",()=>{
 assert.match(wechat,/verifyWechatApiResponseSignature/);
 assert.match(wechat,/verifyWechatApiResponseSignature\(res\.headers, raw\)/);
 assert.match(wechatNotify,/wechatAppId\(\)/);
 assert.match(wechatNotify,/wechatMerchantId\(\)/);
 assert.match(wechatNotify,/1024 \* 1024/);
 assert.match(alipayNotify,/64 \* 1024/);
 assert.match(alipayNotify,/duplicateKey/);
});

test("Alipay and WeChat signed probe accepts the final service identity and never logs keys",()=>{
 assert.match(signed,/lingxifield-cn-release-20261110-\[a-f0-9\]\{12\}-final/);
 assert.match(signed,/ALIPAY_PRIVATE_KEY/);
 assert.match(signed,/WECHAT_PLATFORM_PUBLIC_KEY_ID/);
 assert.match(signed,/CN_MERCHANT_PUBLIC_READY_JSON/);
 assert.match(signed,/WECHAT_RESPONSE_SIGNATURE_INVALID/);
 assert.match(signed,/WECHAT_RESPONSE_SERIAL_MISMATCH/);
 assert.match(signed,/responseVerifier\.update\(responseTimestamp\+"\\n"\+responseNonce\+"\\n"\+raw\+"\\n"/);
 assert.doesNotMatch(signed,/console\.log\([^\n]*(PRIVATE_KEY|API_V3_KEY|access_token)/i);
 execFileSync(process.execPath,["--check","scripts/ops/cn-payment-signed-live-probe-20261109.mjs"]);
});

test("release checksum is relocatable between GitHub artifacts, Windows transfer and ECS",()=>{
 assert.match(releaseWorkflow,/printf '%s  %s\\n' "\$ARCHIVE_SHA" "\$FILE" > "\$DIST\/\$CHECK"/);
 assert.match(releaseWorkflow,/sha256sum -c "\$CHECK_FILE"/);
 assert.doesNotMatch(releaseWorkflow,/sha256sum "\$DIST\/\$FILE" > "\$DIST\/\$CHECK"/);
});

test("upgrade script stages on 3195 but promotes final 3194 and retains 3193 rollback",()=>{
 assert.match(upgrade,/PORT=3195/);
 assert.match(upgrade,/3193\|3194/);
 assert.match(upgrade,/find_service_for_port/);
 assert.match(upgrade,/CN3195_ACTIVE_BASELINE_PASS/);
 assert.match(upgrade,/CN3195_STAGE_GATE_FAILED_PREVIOUS_UPSTREAM_UNCHANGED/);
 assert.match(upgrade,/FINAL_PORT=3194/);
 assert.match(upgrade,/FINAL_SVC=.*-final/);
 assert.match(upgrade,/set_nginx_upstream 3195/);
 assert.match(upgrade,/set_nginx_upstream 3194/);
 assert.match(upgrade,/set_nginx_upstream 3193/);
 assert.match(upgrade,/CN3194_NGINX_PROMOTION_PASS/);
 assert.match(upgrade,/CN3193_ROLLBACK_BASELINE_ACTIVE/);
 assert.match(upgrade,/CN3194_OLD_SERVICE_DISABLE_FAILED_OLD_UPSTREAM_RESTORED/);
 assert.match(upgrade,/CN3194_OLD_SERVICE_DISABLE_FAILED_DURING_ROLLBACK/);
 assert.match(upgrade,/systemctl disable "\$OLD_3194_SVC"/);
 assert.doesNotMatch(upgrade,/CN3195_NGINX_PROMOTION_PASS/);
 assert.match(upgrade,/NGINX_BACKUP/);
 assert.match(upgrade,/TOOL_PASS_COMMERCE_READY=false/);
 assert.match(upgrade,/WECHAT_ENABLED=false/);
 assert.match(upgrade,/ALIPAY_ENABLED=false/);
 assert.match(upgrade,/PAYPAL_ENABLED=false/);
 assert.match(upgrade,/SOFTWARE_COMMERCE_READY=false/);
 assert.doesNotMatch(upgrade,/__CHECK_SHA__|EXPECTED_CHECK_SHA/);
 const promotion=upgrade.slice(upgrade.indexOf('if [[ "$MODE" == --promote ]];then'));
 const stageRoute=promotion.indexOf("set_nginx_upstream 3195");
 const stopOld=promotion.indexOf('systemctl stop "$OLD_3194_SVC"');
 const startFinal=promotion.indexOf('systemctl start "$FINAL_SVC"');
 const finalRoute=promotion.indexOf("set_nginx_upstream 3194");
 const stopStage=promotion.indexOf('systemctl stop "$NEW_SVC"');
 assert.ok(stageRoute>=0&&stageRoute<stopOld&&stopOld<startFinal&&startFinal<finalRoute&&finalRoute<stopStage);
 assert.match(upgrade,/rollback_to_3193\(\)/);
 assert.match(promotion,/rollback_to_3193 "CN3194_FINAL_SERVICE_START_FAILED"/);
 assert.match(promotion,/rollback_to_3193 "CN3194_FINAL_PORT_PROBE_FAILED"/);
 assert.match(promotion,/CN3195_STAGE_STOP_FAILED/);
 assert.match(promotion,/CN3195_STAGE_PORT_STILL_LISTENING/);
 assert.match(upgrade,/CN3193_AUTOMATIC_ROLLBACK_CANDIDATE_STOP_FAILED/);
 assert.match(upgrade,/CN3193_ROLLBACK_CANDIDATE_STOP_FAILED/);
 assert.doesNotMatch(promotion,/NEW_CODE_STILL_SERVING_ON_3195|NEW_CODE_RETAINED_ON_3195/);
 const rollback=upgrade.slice(0,upgrade.indexOf(String.fromCharCode(10)+"old_live"+String.fromCharCode(10)+"load_env_files"));
 assert.ok(rollback.indexOf("set_nginx_upstream 3193")<rollback.indexOf('systemctl stop "$FINAL_SVC"'));
 execFileSync("bash",["-n","scripts/ops/ecs-cn3194-unified-standalone-upgrade-20261110.template.sh"]);
 execFileSync("bash",["-n","scripts/ops/cn-payment-activate-3194-20261110.sh"]);
});
