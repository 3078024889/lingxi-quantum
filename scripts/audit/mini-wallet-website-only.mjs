import assert from "node:assert/strict";
import fs from "node:fs";

const exists=path=>fs.existsSync(path);
const read=path=>fs.readFileSync(path,"utf8");
const app=JSON.parse(read("miniapp/app.json"));
const balance=read("miniapp/pages/balance/index.js");
const wallet=read("components/WalletLivePanel.tsx");
const api=read("miniapp/utils/api.js");
const builder=read("scripts/build-miniapps-v80.cjs");
const packager=read("scripts/package-miniapp-5-7.cjs");

assert.ok(app.pages.includes("pages/balance/index"),"Keep the old balance route as a compatibility deep link");
assert.ok(!app.pages.includes("pages/recharge/index"),"Do not register the retired recharge page");
assert.match(balance,/pages\\/web\\/index\\?path=/);
assert.match(balance,/%2Fai-wallet/);
assert.doesNotMatch(balance,/requestVirtualPayment|balance-pay\\/create|balance-pay\\/availability/);

for(const path of [
 "miniapp/pages/recharge/index.js",
 "miniapp/pages/recharge/index.wxml",
 "miniapp/pages/recharge/index.json",
 "miniapp/pages/recharge/index.wxss",
 "miniapp/utils/topup-expiry.js",
 "miniapp/utils/virtual-payment-errors.js",
 "app/api/wechat/mini/balance-pay/availability/route.ts",
 "app/api/wechat/mini/balance-pay/create/route.ts",
 "app/api/wechat/mini/balance-pay/status/route.ts"
]) assert.equal(exists(path),false,"Retired native top-up implementation remains: "+path);

assert.doesNotMatch(api,/balance-pay\\/availability/,"Mini login must not depend on the deleted top-up endpoint");
assert.doesNotMatch(wallet,/miniVirtualTopupsAvailable|miniTopupsReady|openMiniRecharge|requestVirtualPayment/);
assert.match(wallet,/\\/checkout\\?productId=sasi-balance-/);
assert.match(wallet,/\\/checkout-usd\\?productId=sasi-usd-balance-/);
assert.doesNotMatch(builder,/pages\\/recharge\\/index|existing main-program WeChat recharge/);
assert.match(builder,/pages\\/web\\/index\\?path=%2Fai-wallet/);
assert.match(packager,/const version = '5.7.3'/);
assert.match(packager,/MINI_BALANCE_ROUTE_MUST_REDIRECT_TO_WEBSITE_WALLET/);

// Keep the server-side verifier only to reconcile virtual top-up orders created by older app versions.
assert.match(read("lib/mini/virtual-fulfillment.ts"),/virtualTopupGoods/);
assert.match(read("lib/mini/virtual-goods.ts"),/Legacy-only verifier for already-created virtual top-up orders/);
assert.doesNotMatch(read("lib/mini/virtual-goods.ts"),/miniVirtualTopupsEnabled/);

console.log("PASS: website-only CNY/USD wallet top-ups; no native recharge page or create APIs; legacy deep links redirect; historical payment settlement remains.");
