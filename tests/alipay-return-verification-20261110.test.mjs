import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("Alipay browser return is a reconciliation trigger, never payment proof",()=>{
 const route=read("app/api/pay/alipay/return/route.ts");
 const provider=read("lib/alipay.ts");
 assert.match(route,/queryAlipayTrade/);
 assert.match(route,/order\.provider!=="alipay"/);
 assert.match(route,/order\.currency!=="CNY"/);
 assert.match(route,/order\.provider_payment_id/);
 assert.match(route,/remote\.paid/);
 assert.match(route,/fulfillPaidOrder\(order\.id,true\)/);
 assert.match(route,/safeLocalReturnPath/);
 assert.match(provider,/ALIPAY_QUERY_SIGNATURE_MISSING/);
 assert.match(provider,/ALIPAY_QUERY_SIGNATURE_INVALID/);
 assert.match(provider,/ALIPAY_QUERY_ORDER_MISMATCH/);
 assert.match(provider,/ALIPAY_QUERY_AMOUNT_MISMATCH/);
 assert.doesNotMatch(route,/searchParams\.get\(["\x27]trade_status/);
});

test("Alipay pending return never grants entitlement and keeps the order retryable",()=>{
 const route=read("app/api/pay/alipay/return/route.ts");
 assert.match(route,/if\(!remote\.paid\)/);
 assert.match(route,/destination\(baseUrl,dest,"confirming"\)/);
 assert.match(route,/paymentCenter\(baseUrl,"pending"\)/);
 assert.match(route,/if\(order\.status!=="pending"/);
});
