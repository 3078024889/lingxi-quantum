import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
const read=path=>readFileSync(path,"utf8");
const stage=read("scripts/ops/ecs-cn3193-unified-standalone-stage-20261108.sh");
const activation=read("scripts/ops/cn-payment-activate-20261109.sh");
const signedProbe=read("scripts/ops/cn-payment-signed-live-probe-20261109.mjs");
const ci=read(".github/workflows/cn-unified-source-only-standalone-20261108.yml");

test("Both scripts are syntax-valid and never perform a live charge during signed merchant probe",()=>{
 execFileSync("bash",["-n","scripts/ops/cn-payment-activate-20261109.sh"]);
 execFileSync("bash",["-n","scripts/ops/ecs-cn3193-unified-standalone-stage-20261108.sh"]);
 execFileSync("node",["--check","scripts/ops/cn-payment-signed-live-probe-20261109.mjs"]);
 assert.match(signedProbe,/alipay\.trade\.query/);
 assert.match(signedProbe,/\/v3\/pay\/transactions\/out-trade-no\//);
 assert.match(signedProbe,/ORDER_NOT_EXIST/);
 assert.match(signedProbe,/ACQ\.TRADE_NOT_EXIST/);
 for(const unsafe of ["alipay.trade.pay","/v3/pay/transactions/native","/v2/checkout/orders","/v3/refund/domestic/refunds"])
  assert.ok(!signedProbe.includes(unsafe),"merchant challenge must not charge: "+unsafe);
});
test("Channel activation is separate from release promotion, and never opens unapproved PayPal",()=>{
 assert.match(stage,/TOOL_PASS_COMMERCE_READY=false/);
 assert.match(stage,/WECHAT_ENABLED=false/);
 assert.match(stage,/ALIPAY_ENABLED=false/);
 assert.match(activation,/ALIPAY_ENABLED/);
 assert.match(activation,/WECHAT_ENABLED/);
 assert.match(activation,/"PAYPAL_ENABLED":"false"/);
 assert.match(activation,/TOOL_PASS_COMMERCE_READY":"true"/);
 assert.match(activation,/CN_LIVE_PAYMENT_PROVIDER_FLAGS_VERIFIED/);
 assert.match(activation,/rollback\(\)/);
 assert.match(activation,/NGINX_NOT_USING_3193/);
 assert.match(activation,/SIGNED_LIVE_PROBE=PASS/);
 assert.match(activation,/status.*401/);
});
test("Staging, payment callbacks, and seller storefront never cross to .com from .cn",()=>{
 assert.match(stage,/NEXT_PUBLIC_SITE_URL=https:\/\/lingxifield\.cn/);
 assert.match(stage,/ALIPAY_SITE_URL=https:\/\/lingxifield\.cn/);
 assert.match(activation,/NEXT_PUBLIC_SITE_URL":"https:\/\/lingxifield\.cn/);
 assert.match(signedProbe,/CN_PAYMENT_SITE_ORIGIN_MISMATCH/);
 assert.match(signedProbe,/ALIPAY_CALLBACK_DOMAIN_MISMATCH/);
});
test("Payment scripts are included in exact-SHA production archive and code review",()=>{
 assert.match(ci,/cp scripts\/ops\/cn-payment-signed-live-probe-20261109\.mjs .next\/standalone\/cn-payment-signed-live-probe\.mjs/);
 assert.match(ci,/cp scripts\/ops\/cn-payment-activate-20261109\.sh .next\/standalone\/cn-payment-activate\.sh/);
 assert.match(ci,/node --test tests\/cn-payment-activation-20261109\.test\.mjs/);
 assert.match(ci,/cn-payment-activate\.sh' cn-20261108-archive-manifest/);
});