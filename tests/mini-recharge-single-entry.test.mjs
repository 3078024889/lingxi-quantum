import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("website wallet remains the single CNY/USD recharge surface",()=>{
 const nav=read("components/Nav.tsx");
 assert.match(nav,/href="\/ai-wallet"/);
 assert.match(nav,/t\("recharge"\)/);
 const wallet=read("components/WalletLivePanel.tsx");
 assert.match(wallet,/\/checkout\?productId=sasi-balance-/);
 assert.match(wallet,/\/checkout-usd\?productId=sasi-usd-balance-/);
 assert.doesNotMatch(wallet,/miniVirtualTopupsAvailable|openMiniRecharge|miniTopupsReady|requestVirtualPayment/);
 const boundary=read("components/MiniPaymentBoundary.tsx");
 assert.doesNotMatch(boundary,/miniVirtualTopupsAvailable|miniTopupsReady|小程序充值暂未开放/);
});

test("mini-program compatibility routes redirect to the official website wallet",()=>{
 const balance=read("miniapp/pages/balance/index.js");
 assert.match(balance,/pages\/web\/index\?path=/);
 assert.match(balance,/%2Fai-wallet/);
 assert.doesNotMatch(balance,/requestVirtualPayment|balance-pay\/create/);
 assert.equal(existsSync("miniapp/pages/recharge/index.js"),false);
 assert.equal(existsSync("miniapp/utils/topup-expiry.js"),false);
 assert.equal(existsSync("miniapp/utils/virtual-payment-errors.js"),false);
 assert.equal(existsSync("app/api/wechat/mini/balance-pay/create/route.ts"),false);
 assert.equal(existsSync("app/api/wechat/mini/balance-pay/availability/route.ts"),false);
 const pay=read("miniapp/pages/pay/index.js");
 assert.match(pay,/pages\/web\/index\?path=%2Fai-wallet/);
 const mail=read("miniapp/pages/mail-home/index.js");
 assert.match(mail,/pages\/web\/index\?path=%2Fai-wallet/);
 const api=read("miniapp/utils/api.js");
 assert.doesNotMatch(api,/balance-pay\/availability/);
});
