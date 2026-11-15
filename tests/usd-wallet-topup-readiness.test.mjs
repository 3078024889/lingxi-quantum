import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("USD wallet top-up readiness includes PayPal Live and the wallet-specific release gates",()=>{
 const providers=read("app/api/pay/providers/route.ts");
 const create=read("app/api/pay/create/route.ts");
 const wallet=read("components/WalletLivePanel.tsx");
 const checkout=read("app/checkout-usd/page.tsx");

 assert.match(providers,/const usdBalanceTopup=paypal[\\s\\S]*USD_BALANCE_TOPUP_ENABLED[\\s\\S]*SASI_REFUND_FLOW_TESTED/);
 assert.match(providers,/wechat,alipay,paypal,usdBalanceTopup/);
 assert.match(create,/USD_BALANCE_TOPUP_ENABLED!==["']true["'][\\s\\S]*SASI_REFUND_FLOW_TESTED!==["']true["']/);

 assert.match(wallet,/usdBalanceTopup:boolean/);
 assert.match(wallet,/providers\\?\\.usdBalanceTopup===true/);
 assert.doesNotMatch(wallet,/topupCurrency==="USD"\\?providers\\?\\.paypal===true/);

 assert.match(checkout,/setUsdWalletReady\\(d\\?\\.usdBalanceTopup===true\\)/);
 assert.match(checkout,/product\\?\\.group==="wallet"\\?usdWalletReady:paypalReady/);
 assert.match(checkout,/!paymentReady/);
});

test("mini-program native virtual top-up remains CNY-only and does not expose USD checkout",()=>{
 const wallet=read("components/WalletLivePanel.tsx");
 const nativePage=read("miniapp/pages/balance/index.wxml");
 const availability=read("app/api/wechat/mini/balance-pay/availability/route.ts");
 assert.match(wallet,/if\\(mini\\)\\{[\\s\\S]*setTopupCurrency\\("CNY"\\)/);
 assert.match(wallet,/miniContext===false&&<button[^>]*美元 USD/);
 assert.match(nativePage,/人民币 CNY/);
 assert.doesNotMatch(nativePage,/PayPal|USD/);
 assert.match(availability,/currency:\\s*"CNY"/);
});
