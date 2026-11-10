import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const upgrade=read("scripts/ops/ecs-cn3195-unified-standalone-upgrade-20261110.template.sh");
const payment=read("scripts/ops/cn-payment-activate-3195-20261110.template.sh");
const signed=read("scripts/ops/cn-payment-signed-live-probe-20261110.mjs");
const ps=read("scripts/ops/R2-CN3195-Transfer-20261110.template.ps1");
const workflow=read(".github/workflows/cn3195-release-build-20261110.yml");

test("blue-green upgrade detects current 3193 or 3194 and stages exact release on 3195",()=>{
 assert.ok(upgrade.includes("PORT=3195"));
 assert.ok(upgrade.includes("3193|3194"));
 assert.ok(upgrade.includes("find_service_for_port"));
 assert.ok(upgrade.includes("CN3195_ACTIVE_BASELINE_PASS"));
 assert.ok(upgrade.includes("CN3195_STAGE_GATE_FAILED_PREVIOUS_UPSTREAM_UNCHANGED"));
 assert.ok(upgrade.includes("CN3195_PROMOTION_FAILED_RESTORING_PREVIOUS_UPSTREAM"));
 assert.ok(upgrade.includes("NGINX_BACKUP"));
 assert.ok(upgrade.includes("CN3195_ROLLBACK_TO_PREVIOUS_UPSTREAM_PASS"));
 assert.ok(upgrade.includes('Environment=PORT=3195'));
 assert.ok(upgrade.includes("TOOL_PASS_COMMERCE_READY=false"));
 assert.ok(upgrade.includes("WECHAT_ENABLED=false"));
 assert.ok(upgrade.includes("ALIPAY_ENABLED=false"));
 assert.ok(upgrade.includes("PAYPAL_ENABLED=false"));
 assert.ok(upgrade.includes("SASI_MARKET_SALES_ENABLED=false"));
 assert.ok(upgrade.includes("SOFTWARE_COMMERCE_READY=false"));
 assert.ok(!upgrade.includes("systemctl stop \"$OLD_SVC\""));
});

test("payment audit inherits original secret env files and enables only after signed merchant checks",()=>{
 assert.ok(payment.includes("PORT=3195"));
 assert.ok(payment.includes('SVC="lingxifield-cn-release-20261110-$SHORT"'));
 assert.ok(payment.includes("mapfile -t LIVE_ENV_FILES"));
 assert.ok(payment.includes('env_props+=(--property="EnvironmentFile=$f")'));
 assert.ok(payment.includes('env_props+=(--property="EnvironmentFile=$FLAGS")'));
 assert.ok(payment.includes("CN_MERCHANT_ALIPAY_SIGNED_LIVE_PROBE=PASS"));
 assert.ok(payment.includes("CN_MERCHANT_WECHAT_SIGNED_LIVE_PROBE=PASS"));
 assert.ok(payment.includes("CN_MERCHANT_PAYPAL_LIVE_PROBE=PASS"));
 assert.ok(payment.includes("CN_TOOLPASS_BACKEND_READINESS=PASS"));
 assert.ok(payment.includes("CN_UNSIGNED_WEBHOOK_"));
 assert.ok(payment.includes("CN3195_ALL_THREE_LIVE_MERCHANTS_AND_TOOLPASS_BACKEND_AUDIT_PASS_FLAGS_UNCHANGED"));
 assert.ok(payment.includes("CN3195_ALL_THREE_PAYMENT_PROVIDERS_ENABLED"));
 assert.ok(payment.includes("CN3195_TOOLPASS_COMMERCE_READY_WITH_FOUR_PLANS"));
 assert.ok(payment.includes("SOFTWARE_COMMERCE_REMAINS_GATED_UNTIL_PRIVATE_PACKAGE_SCAN_AND_VERIFICATION"));
 assert.ok(!/SASI_MARKET_SALES_ENABLED[" ]*[:=][" ]*true/.test(payment));
});

test("signed merchant probe accepts only the new service identity and avoids printing secrets",()=>{
 assert.ok(signed.includes("lingxifield-cn-release-20261110-"));
 assert.ok(signed.includes("ALIPAY_PRIVATE_KEY"));
 assert.ok(signed.includes("WECHAT_PLATFORM_PUBLIC_KEY_ID"));
 assert.ok(signed.includes("CN_MERCHANT_PUBLIC_READY_JSON"));
 assert.ok(!/console\.log\([^\n]*(PRIVATE_KEY|API_V3_KEY|access_token)/i.test(signed));
});

test("R2 handoff verifies hashes and keeps temporary signed URLs out of console output",()=>{
 assert.ok(ps.includes("D:\\LINGXIFIELDCN3192\\rclone.conf"));
 assert.ok(ps.includes("cn3192r2:lingxi-cn3192-transfer/cn3195/"));
 assert.ok(ps.includes("Get-FileHash"));
 assert.ok(ps.includes("rclone link"));
 assert.ok(ps.includes("SIGNED_URLS_EXPIRE_IN_6_HOURS_AND_ARE_NOT_PRINTED"));
 assert.ok(ps.includes('bash "$PAYMENT" --audit "$TAG"'));
 assert.ok(ps.includes('bash "$PAYMENT" --enable "$TAG"'));
 assert.ok(!/Write-Host\s+\$ArchiveUrl|Write-Host\s+\$PaymentUrl/.test(ps));
});

test("release workflow only builds and publishes an immutable staging prerelease",()=>{
 assert.ok(workflow.includes("contents: write"));
 assert.ok(workflow.includes("gh release create"));
 assert.ok(workflow.includes("--prerelease"));
 assert.ok(workflow.includes("STAGING ONLY"));
 assert.ok(workflow.includes("release/cn3194-payment-integrated-20261110"));
 assert.ok(!/\bssh\b|\bscp\b|systemctl restart|nginx -s reload/i.test(workflow));
});
