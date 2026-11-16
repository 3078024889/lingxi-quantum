import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("CN3195 payment audit is read-only and reports the standard mini JSAPI gate",()=>{
 const script=readFileSync("scripts/ops/cn3195-payment-readiness-audit-20261116.sh","utf8");
 assert.match(script,/PORT=3195/);
 assert.match(script,/WECHAT_MINI_JSAPI_TOPUPS_ENABLED/);
 assert.match(script,/MINI_JSAPI_MERCHANT_CREDENTIALS_PRESENT/);
 assert.match(script,/WECHAT_PLATFORM_PUBLIC_KEY/);
 assert.match(script,/WECHAT_PLATFORM_PUBLIC_KEY_ID/);
 assert.match(script,/api\/wechat\/mini\/cny-topup\/availability/);
 assert.match(script,/api\/wechat\/mini\/balance-pay\/availability/);
 assert.match(script,/CN3195_LEGACY_MINI_BALANCE_API=RETIRED/);
 assert.match(script,/NO_ORDER_CREATED_NO_CHARGE_NO_REFUND_NO_BALANCE_CHANGE_NO_ENV_CHANGE_NO_SERVICE_RESTART/);
 assert.doesNotMatch(script,/curl\s+-X\s+(?:POST|PUT|PATCH|DELETE)/i);
 assert.doesNotMatch(script,/systemctl\s+(?:restart|stop|start)/);
 assert.doesNotMatch(script,/Environment=WECHAT_|export\s+WECHAT_/);
});
