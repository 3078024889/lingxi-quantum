import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {runInNewContext} from "node:vm";
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
 assert.match(read("app/api/wechat/mini/cny-topup/create/route.ts"),/await createMiniJsapiOrder\(/);
 assert.match(read("lib/mini/tool-pay.ts"),/\/v3\/pay\/transactions\/jsapi/);
 assert.match(read("app/checkout-usd/page.tsx"),/paypalReady/);
});

test("the retired companion landing page is absent from the main Mini Program",()=>{
 const app=JSON.parse(read("miniapp/app.json"));
 assert.ok(!app.pages.includes("pages/mail-home/index"));
 assert.equal(exists("miniapp/pages/mail-home"),false);
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

test("old CNY links return to the website wallet and selected amounts open confirmation", async()=>{
 const opened=[];
 let page;
 runInNewContext(read("miniapp/pages/cny-wallet/index.js"),{
  Page:config=>{page=config;},
  require:()=>({}),
  wx:{getStorageSync:()=>null,redirectTo:({url})=>opened.push(decodeURIComponent(url))},
 });
 const session=()=>({
  ...page,
  data:{...page.data},
  connectionCount:0,
  setData(update){Object.assign(this.data,update);},
  async refreshAll(){this.setData({enabled:true,accountLoaded:true,linked:false});},
  async connectAccount(){this.connectionCount++;},
 });
 const old=session();
 old.onLoad();
 assert.deepEqual(opened,["/pages/web/index?path=/ai-wallet?currency=CNY#wallet-topup"]);
 assert.equal(old.connectionCount,0);
 const payment=session();
 payment.onLoad({amount:"12.50"});
 await Promise.resolve();
 assert.equal(payment.data.amountText,"12.50");
 assert.equal(payment.connectionCount,1);
 assert.equal(opened.length,1);
 assert.doesNotMatch(read("miniapp/pages/cny-wallet/index.wxml"),/选择充值金额|最近充值记录/);
 assert.match(read("miniapp/pages/web/index.js"),/src:withMiniContext\(USD_WALLET_PATH\)/);
 assert.match(read("miniapp/pages/cny-wallet/index.js"),/account-summary\?view=identity/);
 const summary=read("app/api/wechat/mini/account-summary/route.ts");
 assert.match(summary,/if \(new URL\(req.url\).searchParams.get\("view"\) === "identity"\).*?NextResponse.json\(identity/s);
});
