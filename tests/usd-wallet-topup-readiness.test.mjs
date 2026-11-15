import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");

test("USD wallet top-up readiness includes PayPal Live and the wallet-specific release gates",()=>{
 const providers=read("app/api/pay/providers/route.ts");
 const create=read("app/api/pay/create/route.ts");
 const wallet=read("components/WalletLivePanel.tsx");
 const checkout=read("app/checkout-usd/page.tsx");

 assert.ok(providers.includes("const usdBalanceTopup=paypal"));
 assert.ok(providers.includes("USD_BALANCE_TOPUP_ENABLED"));
 assert.ok(providers.includes("SASI_REFUND_FLOW_TESTED"));
 assert.ok(providers.includes("wechat,alipay,paypal,usdBalanceTopup"));
 assert.ok(create.includes('USD_BALANCE_TOPUP_ENABLED!=="true"'));
 assert.ok(create.includes('SASI_REFUND_FLOW_TESTED!=="true"'));

 assert.ok(wallet.includes("usdBalanceTopup:boolean"));
 assert.ok(wallet.includes("providers?.usdBalanceTopup===true"));
 assert.ok(!wallet.includes('topupCurrency==="USD"?providers?.paypal===true'));

 assert.ok(checkout.includes("setUsdWalletReady(d?.usdBalanceTopup===true)"));
 assert.ok(checkout.includes('product?.group==="wallet"?usdWalletReady:paypalReady'));
 assert.ok(checkout.includes("!paymentReady"));
});

test("mini-program native virtual top-up remains CNY-only and does not expose USD checkout",()=>{
 const wallet=read("components/WalletLivePanel.tsx");
 const nativePage=read("miniapp/pages/balance/index.wxml");
 const nativeScript=read("miniapp/pages/balance/index.js");
 const availability=read("app/api/wechat/mini/balance-pay/availability/route.ts");
 assert.ok(wallet.includes("if(mini){"));
 assert.ok(wallet.includes('setTopupCurrency("CNY")'));
 assert.ok(wallet.includes("miniContext===false&&<button"));
 assert.ok(wallet.includes("美元 USD"));
 assert.ok(nativePage.includes("人民币 CNY"));
 assert.ok(nativePage.includes("美元充值请前往灵犀场官网"));
 assert.ok(nativePage.includes('bindtap="copyUsdTopupLink"'));
 assert.ok(nativeScript.includes("copyUsdTopupLink()"));
 assert.ok(nativeScript.includes("https://lingxifield.com/ai-wallet?currency=USD"));
 assert.ok(nativeScript.includes("wx.setClipboardData"));
 assert.ok(wallet.includes('params.get("currency")==="USD"'));
 assert.ok(wallet.includes('"/account?next=%2Fai-wallet%3Fcurrency%3DUSD"'));
 assert.ok(!/PayPal|USD/.test(nativePage));
 assert.ok(availability.includes('currency: "CNY"'));
});

test("mini-program shows an explicit disabled-payment state and prevents misleading amount selection",()=>{
 const nativeScript=read("miniapp/pages/balance/index.js");
 const nativePage=read("miniapp/pages/balance/index.wxml");
 const profile=read("components/AccountProfileCard.tsx");
 const accountCss=read("app/unified-shell.css");
 const i18n=read("lib/account-experience-i18n.ts");
 assert.ok(nativeScript.includes("人民币充值服务尚未启用，当前不会创建订单或扣款"));
 assert.ok(nativePage.includes('disabled="{{busy || !enabled}}"'));
 assert.ok(nativePage.includes("美元充值请前往灵犀场官网"));
 assert.ok(profile.includes('t("confirmChange")'));
 assert.ok(i18n.includes('"zh": "确认修改"'));
 assert.ok(accountCss.includes("grid-template-columns:82px minmax(0,1fr)"));
 assert.ok(accountCss.includes(".lx-account-profile-copy{min-width:0;width:100%}"));
 assert.ok(accountCss.includes("grid-template-columns:minmax(0,1fr) auto"));
 assert.ok(accountCss.includes(".lx-account-name-edit button:disabled"));
});
