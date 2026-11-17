import assert from "node:assert/strict";
import fs from "node:fs";
const read=path=>fs.readFileSync(path,"utf8");
const exists=path=>fs.existsSync(path);

const app=JSON.parse(read("miniapp/app.json"));
assert.ok(app.pages.includes("pages/cny-wallet/index"));
assert.ok(!app.pages.includes("pages/balance/index")&&!app.pages.includes("pages/recharge/index"));
for(const path of ["miniapp/pages/balance","miniapp/pages/recharge","miniapp/utils/topup-expiry.js","miniapp/utils/virtual-payment-errors.js"])assert.equal(exists(path),false,path);

const client=read("lib/mini/payment-client.ts");
assert.ok(client.includes("/pages/cny-wallet/index"));
assert.ok(client.includes("/ai-wallet?currency=USD"));
assert.ok(!client.includes("openMiniRecharge")&&!client.includes("pages/balance"));

const wallet=read("components/WalletLivePanel.tsx");
assert.match(wallet,/detectMiniPaymentContext/);
assert.match(wallet,/openMiniCnyTopup/);
assert.match(wallet,/cnyBalanceTopup/);
assert.match(wallet,/usdBalanceTopup/);

const page=read("miniapp/pages/cny-wallet/index.js");
for(const token of ["cny-topup/availability","cny-topup/create","cny-topup/status","wx.requestPayment","recoverPending","lx_mini_cny_jsapi_pending_v1"])assert.ok(page.includes(token),token);
assert.doesNotMatch(page,/wx\.requestVirtualPayment|expireCheckout/);

const create=read("app/api/wechat/mini/cny-topup/create/route.ts");
assert.match(create,/reserve_mini_cny_jsapi_topup_order/);
assert.match(create,/createMiniJsapiOrder/);
assert.match(create,/queryMiniJsapiOrder/);
assert.match(create,/closeMiniJsapiOrder/);
assert.match(create,/fulfillPaidOrder/);
assert.doesNotMatch(create,/reserve_mini_cny_topup_order/);

const status=read("app/api/wechat/mini/cny-topup/status/route.ts");
assert.match(status,/queryMiniJsapiOrder/);
assert.match(status,/fulfillPaidOrder/);
const availability=read("app/api/wechat/mini/cny-topup/availability/route.ts");
assert.match(availability,/WECHAT_MINI_JSAPI_TOPUPS_ENABLED/);
assert.match(availability,/miniJsapiPayConfigured/);
const merchant=read("lib/mini/tool-pay.ts");
assert.match(merchant,/WECHAT_MINI_APP_ID/);
assert.match(merchant,/verifyWechatApiResponseSignature/);
assert.match(merchant,/buildMiniRequestPayment/);

const callback=read("app/api/pay/wechat/notify/route.ts");
assert.match(callback,/WECHAT_MINI_APP_ID/);
assert.match(callback,/mini_jsapi_topup_order_created/);
assert.match(callback,/fulfillPaidOrder/);
const migration=read("supabase/migrations/20261117013342_mini_cny_jsapi_topup_20261116.sql");
assert.match(migration,/reserve_mini_cny_jsapi_topup_order/);
assert.match(migration,/pg_advisory_xact_lock/);
assert.match(migration,/SECURITY INVOKER/);
assert.match(migration,/REVOKE ALL ON FUNCTION/);
assert.match(migration,/GRANT EXECUTE ON FUNCTION public\.reserve_mini_cny_jsapi_topup_order/);
assert.match(migration,/TO service_role/);
assert.doesNotMatch(migration,/SECURITY DEFINER/);
assert.doesNotMatch(create,/reserve_mini_cny_topup_order/);
assert.equal(exists("supabase/migrations/20261116194500_retire_legacy_mini_virtual_topup_rpc.sql"),false,"legacy RPC is retained only for historical pending-order reconciliation; new JSAPI flow must not call it");

const toolPage=read("miniapp/pages/pay/index.js");
assert.ok(toolPage.includes("wx.requestVirtualPayment"));
assert.ok(toolPage.includes("tool-pay/create"));
assert.ok(toolPage.includes("/pages/cny-wallet/index"));
assert.match(read("lib/mini/virtual-fulfillment.ts"),/virtualTopupGoods/);
assert.match(read("lib/mini/virtual-refund.ts"),/reconcileVirtualRefund/);
assert.match(read("app/api/wechat/mini/pay/notify/route.ts"),/reconcileVirtualToolOrder/);

assert.match(read("app/checkout-usd/page.tsx"),/paypalReady/);
assert.match(read("app/api/pay/create/route.ts"),/USD_BALANCE_TOPUP_ENABLED/);
assert.match(read("app/api/pay/create/route.ts"),/SASI_REFUND_FLOW_TESTED/);
assert.match(read("app/api/pay/providers/route.ts"),/usdBalanceTopup/);
assert.match(read("app/api/pay/providers/route.ts"),/cnyBalanceTopup/);
assert.match(read("app/api/pay/wechat/create/route.ts"),/sasiRmbBalanceV1Enabled/);
assert.match(read("app/api/pay/alipay/create/route.ts"),/sasiRmbBalanceV1Enabled/);

assert.match(read("components/AccountProfileCard.tsx"),/lx-account-save-button/);
assert.match(read("app/unified-shell.css"),/flex-direction:column!important/);
console.log("PASS: CNY mini-wallet uses standard WeChat merchant JSAPI; USD uses official website PayPal; tool virtual purchases and historical top-up settlement/refunds remain separate; old wallet modules are removed");
