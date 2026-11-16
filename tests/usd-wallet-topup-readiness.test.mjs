import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";

const read=path=>readFileSync(path,"utf8");
const exists=path=>existsSync(path);

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

test("mini-program CNY and USD wallet top-ups use the official website checkout only",()=>{
 const wallet=read("components/WalletLivePanel.tsx");
 const balanceRoute=read("miniapp/pages/balance/index.js");
 const web=read("miniapp/pages/web/index.js");
 const app=JSON.parse(read("miniapp/app.json"));

 assert.ok(wallet.includes('"/checkout?productId=sasi-balance-"'));
 assert.ok(wallet.includes('"/checkout-usd?productId=sasi-usd-balance-"'));
 assert.ok(wallet.includes('params.get("currency")==="USD"'));
 assert.ok(balanceRoute.includes("/pages/web/index?path="));
 assert.ok(balanceRoute.includes("encodeURIComponent(path)"));
 assert.ok(balanceRoute.includes('"/ai-wallet"'));
 assert.ok(!balanceRoute.includes("requestVirtualPayment"));
 assert.ok(app.pages.includes("pages/balance/index"),"Keep only the compatibility redirect for old deep links");
 assert.ok(!app.pages.includes("pages/recharge/index"));
 assert.ok(web.includes("currencyParam=/(?:[?&])currency="));
 assert.ok(!web.includes("lx_mini_topup_pending"));
 assert.ok(!web.includes("lx_mini_last_payment_error"));

 for(const route of [
  "app/api/wechat/mini/balance-pay/availability/route.ts",
  "app/api/wechat/mini/balance-pay/create/route.ts",
  "app/api/wechat/mini/balance-pay/status/route.ts"
 ]) assert.equal(exists(route),false,"Retired mini-program wallet API remains: "+route);
 assert.equal(exists("miniapp/pages/recharge/index.js"),false);
 assert.equal(exists("miniapp/utils/topup-expiry.js"),false);
 assert.equal(exists("miniapp/utils/virtual-payment-errors.js"),false);
});

test("retired native recharge controls are gone while account services remain",()=>{
 const nativeScript=read("miniapp/pages/balance/index.js");
 const nativePage=read("miniapp/pages/balance/index.wxml");
 const profile=read("components/AccountProfileCard.tsx");
 const accountCss=read("app/unified-shell.css");
 const i18n=read("lib/account-experience-i18n.ts");
 assert.ok(!nativeScript.includes("requestVirtualPayment"));
 assert.ok(!nativeScript.includes("balance-pay/create"));
 assert.ok(!nativePage.includes("充值金额"));
 assert.ok(profile.includes('t("confirmChange")'));
 assert.ok(i18n.includes('"zh": "确认修改"'));
 assert.ok(accountCss.includes("grid-template-columns:82px minmax(0,1fr)"));
 assert.ok(accountCss.includes(".lx-account-profile-copy{min-width:0;width:100%}"));
 assert.ok(accountCss.includes("grid-template-columns:minmax(0,1fr) auto"));
 assert.ok(accountCss.includes(".lx-account-name-edit button:disabled"));
});
