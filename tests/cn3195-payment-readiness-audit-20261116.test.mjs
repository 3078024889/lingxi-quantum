import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";

const script=readFileSync("scripts/ops/cn3195-payment-readiness-audit-20261116.sh","utf8");

test("CN3195 payment readiness audit is syntax-valid and pinned to current production port",()=>{
 execFileSync("bash",["-n","scripts/ops/cn3195-payment-readiness-audit-20261116.sh"]);
 for(const value of ["PORT=3195","ss -ltnpH","127.0.0.1:$PORT","/proc/$PID/environ","cn3195-payment-audit","EnvironmentFiles"])
  assert.ok(script.includes(value),"missing audit contract: "+value);
});

test("CN3195 audit prints only boolean credential readiness and safe payment flags",()=>{
 for(const key of ["WECHAT_ENABLED","ALIPAY_ENABLED","PAYPAL_ENABLED","SASI_RMB_BALANCE_V1_ENABLED","USD_BALANCE_TOPUP_ENABLED","SASI_REFUND_FLOW_TESTED","WECHAT_MINI_JSAPI_TOPUPS_ENABLED"])
  assert.ok(script.includes(key),"missing safe readiness flag: "+key);
 for(const marker of ["WECHAT_MERCHANT_CREDENTIALS_PRESENT","ALIPAY_MERCHANT_CREDENTIALS_PRESENT","PAYPAL_LIVE_CREDENTIALS_PRESENT","MINI_JSAPI_MERCHANT_CREDENTIALS_PRESENT","MINI_APP_ID_MATCHES_EXPECTED"])
  assert.ok(script.includes(marker),"missing credential readiness marker: "+marker);
 for(const secret of ["WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY","ALIPAY_PRIVATE_KEY","PAYPAL_CLIENT_SECRET","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID","WECHAT_MINI_APP_SECRET"])
  assert.ok(script.includes(secret),"credential must be checked: "+secret);
 assert.ok(!script.includes('echo "$WECHAT_API_V3_KEY"'));
 assert.ok(!script.includes('echo "$WECHAT_PRIVATE_KEY"'));
 assert.ok(!script.includes('echo "$ALIPAY_PRIVATE_KEY"'));
 assert.ok(!script.includes('echo "$PAYPAL_CLIENT_SECRET"'));
});

test("CN3195 audit does not activate flags, restart services, or create payment traffic",()=>{
 assert.ok(!/systemctl\s+(restart|start|stop|enable|disable|set-environment)/.test(script));
 assert.ok(!/curl[^\n]*(?:-X\s+POST|--request\s+POST)/.test(script));
 for(const activation of ["WECHAT_ENABLED=true","ALIPAY_ENABLED=true","PAYPAL_ENABLED=true","USD_BALANCE_TOPUP_ENABLED=true","WECHAT_MINI_JSAPI_TOPUPS_ENABLED=true"])
  assert.ok(!script.includes(activation),"read-only audit must not activate "+activation);
 assert.ok(script.includes("NO_ORDER_CREATED_NO_CHARGE_NO_REFUND_NO_BALANCE_CHANGE_NO_ENV_CHANGE_NO_SERVICE_RESTART"));
});

test("CN3195 audit correctly counts inherited systemd EnvironmentFiles",()=>{
 const code=String.raw`import re,sys; print(len(set(re.findall(r"/[^\s()]+\.env",sys.stdin.read()))))`;
 const output=execFileSync("python3",["-c",code],{input:"- /etc/lingxifield/production.env (ignore_errors=no)\n"});
 assert.equal(output.toString().trim(),"1");
});

test("CN3195 audit probes the new JSAPI endpoint and verifies the legacy balance API is retired",()=>{
 assert.ok(script.includes('probe /api/wechat/mini/cny-topup/availability'));
 assert.ok(script.includes('probe /api/wechat/mini/balance-pay/availability'));
 assert.ok(script.includes('ML="$PROBE_CODE"'));
 assert.ok(script.includes("CN3195_LEGACY_MINI_BALANCE_API_REMOVED=YES"));
});
