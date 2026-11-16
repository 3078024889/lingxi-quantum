import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const script=readFileSync("scripts/cloudflare/com-merchant-live-probe-20261116.mjs","utf8");

test("COM Live merchant probe syntax and site identity are pinned",()=>{
 execFileSync(process.execPath,["--check","scripts/cloudflare/com-merchant-live-probe-20261116.mjs"]);
 assert.match(script,/NEXT_PUBLIC_SITE_URL!=="https:\/\/lingxifield\.com"/);
 assert.match(script,/ALIPAY_SELLER_ID/);
 assert.match(script,/WECHAT_PLATFORM_PUBLIC_KEY_ID/);
 assert.match(script,/PAYPAL_ENV/);
});

test("Alipay and WeChat probes query a deliberately nonexistent reference and verify signed replies",()=>{
 assert.match(script,/alipay\.trade\.query/);
 assert.match(script,/ACQ\.TRADE_NOT_EXIST/);
 assert.match(script,/v3\/pay\/transactions\/out-trade-no/);
 assert.match(script,/ORDER_NOT_EXIST/);
 assert.match(script,/RESPONSE_SIGNATURE_INVALID/);
 assert.match(script,/RESPONSE_SERIAL_MISMATCH/);
});

test("PayPal probe authenticates Live and validates the production webhook without creating an order",()=>{
 assert.match(script,/api-m\.paypal\.com\/v1\/oauth2\/token/);
 assert.match(script,/api-m\.paypal\.com\/v1\/notifications\/webhooks/);
 assert.match(script,/https:\/\/lingxifield\.com\/api\/pay\/paypal\/webhook/);
 assert.match(script,/PAYMENT\.CAPTURE\.REFUNDED/);
 assert.doesNotMatch(script,/v2\/checkout\/orders|\/capture|\/refund/);
 assert.match(script,/NO_ORDER_CREATED_NO_CHARGE_NO_CAPTURE_NO_REFUND_NO_DATABASE_ACCESS/);
});
