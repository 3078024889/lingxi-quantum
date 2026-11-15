import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("announcement ticker is notices-only and recharge remains in the main header",()=>{
 const ticker=read("components/PublicAnnouncementTicker.tsx");
 const nav=read("components/Nav.tsx");
 assert.doesNotMatch(ticker,/href=["']\/ai-wallet/);
 assert.doesNotMatch(ticker,/余额\s*·\s*充值|Balance \/ Top up/);
 assert.match(ticker,/href="\/announcements"/);
 assert.match(nav,/href="\/ai-wallet"/);
 assert.match(nav,/t\("recharge"\)/);
 assert.doesNotMatch(nav,/rechargeClick|openMiniRecharge|onClick=\{rechargeClick\}/,"the header must open the new wallet page instead of the legacy native page");
 const wallet=read("components/WalletLivePanel.tsx");
 assert.ok(wallet.includes("miniVirtualTopupsAvailable"));
 assert.ok(wallet.includes("openMiniRecharge(String(amount))"));
 const boundary=read("components/MiniPaymentBoundary.tsx");
 assert.ok(boundary.includes("miniVirtualTopupsAvailable"));
 assert.ok(boundary.includes("小程序充值暂未开放"));
});

test("mini-program recharge uses the live CN API origin and the refreshed native wallet screen",()=>{
 const api=read("miniapp/utils/api.js");
 const balance=read("miniapp/pages/balance/index.wxml");
 const balanceJs=read("miniapp/pages/balance/index.js");
 assert.ok(api.includes("const API_BASE = 'https://lingxifield.cn'"));
 assert.ok(!api.includes("mini-api.lingxifield.cn"));
 assert.match(balance,/余额与充值/);
 assert.match(balance,/人民币 CNY/);
 assert.ok(balanceJs.includes("wx.requestVirtualPayment"));
 assert.ok(balanceJs.includes("encodeURIComponent('/account')"));
});
