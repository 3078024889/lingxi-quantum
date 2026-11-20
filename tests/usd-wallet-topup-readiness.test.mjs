import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(p,"utf8"),exists=p=>existsSync(p);

test("CNY and USD wallet readiness are independent and enforced by server gates",()=>{
 const providers=read("app/api/pay/providers/route.ts");
 const create=read("app/api/pay/create/route.ts");
 const wallet=read("components/WalletLivePanel.tsx");
 const checkout=read("app/checkout-usd/page.tsx");
 assert.match(providers,/cnyBalanceTopupReady\s*=\s*sasiRmbBalanceV1Enabled\(\)\s*&&\s*\(wechat\s*\|\|\s*alipay\)/);
 assert.match(providers,/usdBalanceTopupReady\s*=\s*paypal[\s\S]*USD_BALANCE_TOPUP_ENABLED[\s\S]*SASI_REFUND_FLOW_TESTED/);
 assert.match(create,/USD_BALANCE_TOPUP_ENABLED/);
 assert.match(create,/SASI_REFUND_FLOW_TESTED/);
 assert.match(wallet,/cnyBalanceTopupReady:boolean;usdBalanceTopupReady:boolean/);
 assert.match(wallet,/providers\?\.cnyBalanceTopupReady===true/);
 assert.match(wallet,/providers\?\.usdBalanceTopupReady===true/);
 assert.match(checkout,/setUsdWalletReady\(d\?\.usdBalanceTopupReady===true\)/);
 assert.match(checkout,/product\?\.group===\"wallet\"\?usdWalletReady:paypalReady/);
});

test("Mini Program CNY uses native merchant JSAPI; USD enters official website PayPal wallet",()=>{
 const wallet=read("components/WalletLivePanel.tsx");
 const client=read("lib/mini/payment-client.ts");
 const boundary=read("components/MiniPaymentBoundary.tsx");
 const web=read("miniapp/pages/web/index.js");
 const native=read("miniapp/pages/cny-wallet/index.js");
 const cny=read("app/checkout/page.tsx");
 const usd=read("app/checkout-usd/page.tsx");
 assert.match(wallet,/miniCnyReady/);
 assert.match(wallet,/openMiniWallet\(\"CNY\",amount\)/);
 assert.match(wallet,/\/checkout\?productId=sasi-balance-/);
 assert.match(wallet,/\/checkout-usd\?productId=sasi-usd-balance-/);
 assert.match(client,/openMiniWallet\(currency: \"CNY\" \| \"USD\"/);
 assert.match(client,/\/pages\/cny-wallet\/index/);
 assert.match(client,/\/pages\/web\/index\?usdWallet=1/);
 assert.doesNotMatch(client,/openMiniRecharge|pages\/balance/);
 assert.doesNotMatch(boundary,/openMiniRecharge/);
 assert.match(native,/wx\.requestPayment/);
 assert.doesNotMatch(native,/wx\.requestVirtualPayment/);
 assert.match(cny,/\/api\/pay\/wechat\/create/);
 assert.match(usd,/paypalReady/);
 assert.match(web,/currencyParam=\/\(\?:\[\?&\]\)currency=\//);
 for(const path of ["miniapp/pages/balance","miniapp/pages/recharge","app/api/wechat/mini/balance-pay/create/route.ts","app/api/wechat/mini/balance-pay/availability/route.ts","app/api/wechat/mini/balance-pay/status/route.ts"])assert.equal(exists(path),false,path);
});

test("mobile account editor has a visible full-width Save action",()=>{
 const profile=read("components/AccountProfileCard.tsx");
 const css=read("app/unified-shell.css");
 const i18n=read("lib/account-experience-i18n.ts");
 assert.match(profile,/lx-account-save-button/);
 assert.match(profile,/t\(\"save\"\)/);
 assert.match(profile,/t\(\"saving\"\)/);
 assert.doesNotMatch(profile,/t\(\"confirmChange\"\)/);
 assert.match(i18n,/\"zh\": \"保存\"/);
 assert.match(css,/\.lx-account-name-edit \.lx-account-save-button/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\)!important/);
 assert.match(css,/width:100%!important/);
});
