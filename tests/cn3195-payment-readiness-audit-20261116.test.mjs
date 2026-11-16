import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";

const script=readFileSync("scripts/ops/cn3195-payment-readiness-audit-20261116.sh","utf8");

test("CN3195 payment readiness audit is syntax-valid and pinned to current production port",()=>{
 execFileSync("bash",["-n","scripts/ops/cn3195-payment-readiness-audit-20261116.sh"]);
 assert.match(script,/PORT=3195/);
 assert.match(script,/ss -ltnpH/);
 assert.match(script,/127\\.0\\.0\\.1:\\$PORT/);
 assert.match(script,/\\/proc\\/\\$PID\\/environ/);
 assert.match(script,/cn3195-payment-audit/);
 assert.match(script,/api\\/wechat\\/mini\\/cny-topup\\/availability/);
});

test("CN3195 audit prints only boolean credential readiness and safe payment flags",()=>{
 for(const key of ["WECHAT_ENABLED","ALIPAY_ENABLED","PAYPAL_ENABLED","SASI_RMB_BALANCE_V1_ENABLED","USD_BALANCE_TOPUP_ENABLED","SASI_REFUND_FLOW_TESTED","WECHAT_MINI_JSAPI_TOPUPS_ENABLED"])
  assert.ok(script.includes(key),"missing safe readiness flag: "+key);
 for(const marker of ["WECHAT_MERCHANT_CREDENTIALS_PRESENT","ALIPAY_MERCHANT_CREDENTIALS_PRESENT","PAYPAL_LIVE_CREDENTIALS_PRESENT","MINI_JSAPI_MERCHANT_CREDENTIALS_PRESENT","MINI_APP_ID_MATCHES_EXPECTED"])
  assert.ok(script.includes(marker));
 for(const secret of ["WECHAT_API_V3_KEY","WECHAT_PRIVATE_KEY","ALIPAY_PRIVATE_KEY","PAYPAL_CLIENT_SECRET","WECHAT_PLATFORM_PUBLIC_KEY","WECHAT_PLATFORM_PUBLIC_KEY_ID","WECHAT_MINI_APP_SECRET"])
  assert.ok(script.includes(secret));
 assert.doesNotMatch(script,/echo\\s+\\$?(WECHAT_API_V3_KEY|WECHAT_PRIVATE_KEY|ALIPAY_PRIVATE_KEY|PAYPAL_CLIENT_SECRET|WECHAT_MINI_VPAY_APP_KEY)/);
});

test("CN3195 audit does not activate flags, restart services, or create payment traffic",()=>{
 assert.doesNotMatch(script,/systemctl\\s+(restart|start|stop|enable|disable|set-environment)/);
 assert.doesNotMatch(script,/curl[^\\n]*(?:-X\\s+POST|--request\\s+POST)/);
 assert.doesNotMatch(script,/WECHAT_ENABLED=true|ALIPAY_ENABLED=true|PAYPAL_ENABLED=true|USD_BALANCE_TOPUP_ENABLED=true|WECHAT_MINI_JSAPI_TOPUPS_ENABLED=true/);
 assert.match(script,/NO_ORDER_CREATED_NO_CHARGE_NO_REFUND_NO_BALANCE_CHANGE_NO_ENV_CHANGE_NO_SERVICE_RESTART/);
});

test("CN3195 audit counts systemd EnvironmentFiles without matching literal backslashes",()=>{
 assert.ok(script.includes('re.findall(r"/[^\\\\s()]+\\\\.env",sys.stdin.read())'));
 const code='import re,sys; print(len(set(re.findall(r"/[^\\\\s()]+\\\\.env",sys.stdin.read()))))';
 const output=execFileSync("python3",["-c",code],{input:"- /etc/lingxifield/production.env (ignore_errors=no)\\n"});
 assert.equal(output.toString().trim(),"1");
});

test("CN3195 audit checks the new JSAPI endpoint and verifies the legacy balance API is retired",()=>{
 assert.match(script,/probe \\/api\\/wechat\\/mini\\/cny-topup\\/availability/);
 assert.match(script,/probe \\/api\\/wechat\\/mini\\/balance-pay\\/availability/);
 assert.match(script,/ML="\\$PROBE_CODE"/);
 assert.match(script,/CN3195_LEGACY_MINI_BALANCE_API_REMOVED=YES/);
});
