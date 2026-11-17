import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read=path=>fs.readFileSync(path,"utf8"),exists=path=>fs.existsSync(path);

test("6.0.0 has one registered CNY wallet and no legacy recharge modules",()=>{
 const app=JSON.parse(read("miniapp/app.json"));
 assert.equal(app.pages[0],"pages/web/index");assert.ok(app.pages.includes("pages/cny-wallet/index"));
 for(const route of ["pages/balance/index","pages/recharge/index","pages/portal/index","pages/mail-home/index"])assert.ok(!app.pages.includes(route),route);
 for(const path of ["miniapp/pages/balance","miniapp/pages/recharge","miniapp/pages/portal","miniapp/utils/topup-expiry.js","miniapp/utils/virtual-payment-errors.js","app/api/wechat/mini/balance-pay"])assert.equal(exists(path),false,path);
 assert.ok(exists("miniapp/pages/cny-wallet/index.js"));
 for(const path of ["app/api/wechat/mini/cny-topup/create/route.ts","app/api/wechat/mini/cny-topup/availability/route.ts","app/api/wechat/mini/cny-topup/status/route.ts"])assert.equal(exists(path),true,path);
});

test("CNY wallet uses standard merchant JSAPI while USD uses the official website wallet",()=>{
 const page=read("miniapp/pages/cny-wallet/index.js"),client=read("lib/mini/payment-client.ts");
 assert.ok(page.includes("wx.requestPayment"));assert.doesNotMatch(page,/requestVirtualPayment/);
 assert.ok(page.includes("cny-topup/availability"));
 assert.ok(client.includes("/pages/cny-wallet/index"));
 assert.match(read("app/api/wechat/mini/cny-topup/create/route.ts"),/reserve_mini_cny_jsapi_topup_order/);
 assert.match(read("lib/wechatpay.ts"),/createWechatMiniJsapiOrder/);
 assert.match(read("app/checkout-usd/page.tsx"),/paypalReady/);
});

test("companion temp-mail source is isolated and contains no retired creative or recharge UI",()=>{
 const app=JSON.parse(read("miniapp/app.json"));assert.ok(!app.pages.includes("pages/mail-home/index"));assert.ok(exists("miniapp/pages/mail-home/index.js"));
 const js=read("miniapp/pages/mail-home/index.js"),wxml=read("miniapp/pages/mail-home/index.wxml");
 assert.ok(js.includes("pages/cny-wallet/index"));
 assert.ok(read("scripts/build-miniapps-v80.cjs").includes("mail-home"));
});

test("all account recharge entry points use the 6.0.0 wallet API",()=>{
 assert.ok(read("app/account/MiniAccountLinkPanel.tsx").includes('openMiniWallet("CNY")'));
 assert.doesNotMatch(read("components/Nav.tsx"),/openMiniRecharge/);assert.doesNotMatch(read("components/MiniPaymentBoundary.tsx"),/openMiniRecharge/);
});

test("release project metadata is versioned 6.0.0",()=>{
 const project=JSON.parse(read("miniapp/project.config.json"));assert.equal(project.appid,"wxbf4ae90406e7e26b");
 assert.ok(project.description.includes("6.0.0"));
 assert.ok(exists("scripts/package-miniapp-6-0-0.cjs"));
});
