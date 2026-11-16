import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
const read=path=>fs.readFileSync(path,"utf8"),exists=path=>fs.existsSync(path);

test("6.0.0 has one registered native CNY wallet and no legacy recharge modules",()=>{
 const app=JSON.parse(read("miniapp/app.json"));
 assert.equal(app.pages[0],"pages/web/index");assert.ok(app.pages.includes("pages/cny-wallet/index"));
 for(const route of ["pages/balance/index","pages/recharge/index","pages/portal/index","pages/mail-home/index"])assert.ok(!app.pages.includes(route),route);
 for(const path of ["miniapp/pages/balance","miniapp/pages/recharge","miniapp/pages/portal","miniapp/utils/topup-expiry.js","miniapp/utils/virtual-payment-errors.js","app/api/wechat/mini/balance-pay"])assert.equal(exists(path),false,path);
 assert.ok(exists("miniapp/pages/cny-wallet/index.js"));assert.ok(exists("app/api/wechat/mini/cny-topup/create/route.ts"));assert.ok(exists("app/api/wechat/mini/cny-topup/availability/route.ts"));
});
test("CNY native payment and USD official website wallet stay separate",()=>{
 const page=read("miniapp/pages/cny-wallet/index.js"),client=read("lib/mini/payment-client.ts");
 assert.match(page,/wx\.requestVirtualPayment/);assert.match(page,/cny-topup\/create/);assert.match(page,/cny-topup\/availability/);
 assert.match(client,/\/pages\/cny-wallet\/index/);assert.match(client,/\/ai-wallet\?currency=USD/);assert.doesNotMatch(client,/openMiniRecharge|pages\/balance/);
 assert.match(read("app/checkout-usd/page.tsx"),/paypalReady/);
});
test("companion temp-mail source is isolated and contains no retired creative or recharge UI",()=>{
 const app=JSON.parse(read("miniapp/app.json"));assert.ok(!app.pages.includes("pages/mail-home/index"));assert.ok(exists("miniapp/pages/mail-home/index.js"));
 const js=read("miniapp/pages/mail-home/index.js"),wxml=read("miniapp/pages/mail-home/index.wxml");
 assert.match(js,/pages\/cny-wallet\/index/);assert.match(js,/ai-wallet\?currency=USD/);assert.doesNotMatch(js,/pages\/recharge|sasi\?mode=image/);
 assert.doesNotMatch(wxml,/creative-card|AI 图片生成|把想象变成图片|pages\/recharge/);assert.match(read("scripts/build-miniapps-v80.cjs"),/tempPages=new Set\(\['mail-home'/);
});
test("all account recharge entry points use the 6.0.0 wallet API",()=>{
 assert.doesNotMatch(read("app/account/MiniAccountLinkPanel.tsx"),/openMiniRecharge/);assert.match(read("app/account/MiniAccountLinkPanel.tsx"),/openMiniWallet\("CNY"\)/);
 assert.doesNotMatch(read("components/Nav.tsx"),/openMiniRecharge/);assert.doesNotMatch(read("components/MiniPaymentBoundary.tsx"),/openMiniRecharge/);
});
test("release project metadata is versioned 6.0.0",()=>{
 const project=JSON.parse(read("miniapp/project.config.json"));assert.equal(project.appid,"wxbf4ae90406e7e26b");
 assert.equal(project.projectname,"lingxifield-miniapp-6.0.0");assert.match(project.description,/6\.0\.0/);assert.match(read("miniapp/README.md"),/6\.0\.0/);
 assert.ok(exists("scripts/package-miniapp-6-0-0.cjs"));
});
