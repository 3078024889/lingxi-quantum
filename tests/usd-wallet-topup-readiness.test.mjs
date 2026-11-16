import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(p,"utf8"),exists=p=>existsSync(p);

test("CNY and USD wallet UI use server-enforced wallet readiness gates",()=>{
 const providers=read("app/api/pay/providers/route.ts"),create=read("app/api/pay/create/route.ts");
 const wallet=read("components/WalletLivePanel.tsx"),checkout=read("app/checkout-usd/page.tsx");
 assert.match(providers,/cnyBalanceTopupReady\s*=\s*sasiRmbBalanceV1Enabled\(\)\s*&&\s*\(wechat\s*\|\|\s*alipay\)/);
 assert.match(providers,/usdBalanceTopupReady\s*=\s*paypal[\s\S]*USD_BALANCE_TOPUP_ENABLED[\s\S]*SASI_REFUND_FLOW_TESTED/);
 assert.match(create,/USD_BALANCE_TOPUP_ENABLED/);assert.match(create,/SASI_REFUND_FLOW_TESTED/);
 assert.match(wallet,/cnyBalanceTopupReady:boolean;usdBalanceTopupReady:boolean/);
 assert.match(wallet,/providers\?\.cnyBalanceTopupReady===true/);
 assert.match(wallet,/providers\?\.usdBalanceTopupReady===true/);
 assert.match(checkout,/setWalletTopupReady\(d\?\.usdBalanceTopupReady===true\)/);
 assert.match(checkout,/product\?\.group===\"wallet\"\?walletTopupReady:paypalReady/);
});

test("Mini Program CNY uses native wallet; USD uses the official website PayPal wallet",()=>{
 const wallet=read("components/WalletLivePanel.tsx"),client=read("lib/mini/payment-client.ts");
 const boundary=read("components/MiniPaymentBoundary.tsx"),web=read("miniapp/pages/web/index.js");
 const toolPay=read("miniapp/pages/pay/index.js"),webCny=read("app/checkout/page.tsx"),usd=read("app/checkout-usd/page.tsx");
 assert.match(wallet,/miniCnyReady/);assert.match(wallet,/openMiniWallet\("CNY",amount\)/);
 assert.match(wallet,/\/checkout\?productId=sasi-balance-/);assert.match(wallet,/\/checkout-usd\?productId=sasi-usd-balance-/);
 assert.match(client,/openMiniWallet\(currency: \"CNY\" \| \"USD\"/);
 assert.match(client,/\/pages\/cny-wallet\/index/);assert.match(client,/\/ai-wallet\?currency=/);
 assert.doesNotMatch(client,/openMiniRecharge|pages\/balance/);assert.doesNotMatch(boundary,/openMiniRecharge/);
 assert.match(toolPay,/\/pages\/cny-wallet\/index/);
 assert.ok(web.includes("currencyParam=/(?:[?&])currency="));
 assert.match(webCny,/\/api\/pay\/wechat\/create/);assert.match(usd,/paypalReady/);
 for(const path of ["miniapp/pages/balance","miniapp/pages/recharge","app/api/wechat/mini/balance-pay/create/route.ts","app/api/wechat/mini/balance-pay/availability/route.ts","app/api/wechat/mini/balance-pay/status/route.ts"])assert.equal(exists(path),false,path);
});

test("account profile keeps the Save action visible on mobile",()=>{
 const p=read("components/AccountProfileCard.tsx"),c=read("app/unified-shell.css"),i=read("lib/account-experience-i18n.ts");
 assert.ok(p.includes('className="lx-account-save-button"'));assert.ok(p.includes('t("save")'));assert.ok(p.includes('t("saving")'));assert.ok(!p.includes('t("confirmChange")'));
 assert.ok(i.includes('"zh": "保存"'));assert.ok(c.includes(".lx-account-name-edit .lx-account-save-button"));
 assert.ok(c.includes("grid-template-columns:minmax(0,1fr)!important"));assert.ok(c.includes("width:100%!important"));
});
