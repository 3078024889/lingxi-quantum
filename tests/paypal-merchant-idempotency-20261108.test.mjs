import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const paypal=readFileSync("lib/paypal.ts","utf8");
const checkout=readFileSync("app/api/pay/create/route.ts","utf8");
const verify=readFileSync("app/api/pay/paypal/webhook/route.ts","utf8");
const fulfill=readFileSync("lib/fulfill-order.ts","utf8");

assert.match(paypal,/export async function createPaypalOrder[\s\S]*?"PayPal-Request-Id": params\.referenceId/);
assert.match(paypal,/export async function capturePaypalOrder[\s\S]*?"PayPal-Request-Id": `capture-\$\{orderId\}`/);
assert.match(paypal,/verifyMoney\(capture\.amount, expectedAmountUsd\)/);
assert.match(paypal,/verifyPaypalWebhook[\s\S]*?verification_status === "SUCCESS"/);
assert.match(checkout,/referenceId:order\.id/);
assert.match(verify,/if\(!\(await verifyPaypalWebhook\(req\.headers,raw\)\)\)/);
assert.match(verify,/await verifyPaypalCompletedOrder\(providerId,Number\(order\.amount_usd\),order\.id\)/);
assert.match(fulfill,/if\(!verifiedPayment\)return/);
console.log("PAYPAL_ORDER_CREATE_AND_CAPTURE_IDEMPOTENCY_SECURITY_CONTRACT_PASS");
