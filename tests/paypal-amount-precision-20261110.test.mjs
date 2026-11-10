import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseUsdCents,paypalBaseUrl} from "../lib/paypal.ts";

test("USD values are parsed into exact integer cents",()=>{
 assert.equal(parseUsdCents("0.01"),1);
 assert.equal(parseUsdCents("12.3"),1230);
 assert.equal(parseUsdCents("12.30"),1230);
 assert.equal(parseUsdCents(12.3),1230);
 assert.equal(parseUsdCents("90071992547409.91"),Number.MAX_SAFE_INTEGER);
});

test("USD parser rejects precision loss and ambiguous number formats",()=>{
 for(const value of ["01.00","1.001","1.005","1e2"," 1.00","1.00 ","+1.00","-1.00","90071992547409.92",null,{},Number.NaN,Number.POSITIVE_INFINITY])
  assert.equal(parseUsdCents(value),null,String(value));
});

test("PayPal creation and verification share exact cents and normalized environment",()=>{
 const paypal=readFileSync("lib/paypal.ts","utf8");
 assert.match(paypal,/amount: \{ currency_code: "USD", value: formatUsdCents\(amountCents\) \}/);
 assert.match(paypal,/const cents = parseUsdCents\(amount\?\.value\)/);
 assert.match(paypal,/const expectedCents = parseUsdCents\(expectedAmountUsd\)/);
 assert.doesNotMatch(paypal,/Math\.round\(Number\(amount\?\.value\)/);
 const original=process.env.PAYPAL_ENV;
 try{process.env.PAYPAL_ENV=" SANDBOX ";assert.match(paypalBaseUrl(),/sandbox/);}
 finally{if(original===undefined)delete process.env.PAYPAL_ENV;else process.env.PAYPAL_ENV=original;}
});

test("PayPal webhook and browser capture require USD order denomination",()=>{
 const webhook=readFileSync("app/api/pay/paypal/webhook/route.ts","utf8");
 const legacy=readFileSync("app/api/pay/webhook/route.ts","utf8");
 const returned=readFileSync("app/api/pay/paypal/return/route.ts","utf8");
 assert.match(webhook,/order\.currency!=="USD"/);
 assert.match(legacy,/order\.currency!=="USD"/);
 assert.match(returned,/order\.currency!=="USD"/);
});
