import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const read=path=>readFileSync(path,"utf8");
const exists=path=>existsSync(path);

test("CNY uses native merchant JSAPI and USD uses the official website wallet",()=>{
 const app=JSON.parse(read("miniapp/app.json"));
 const client=read("lib/mini/payment-client.ts");
 const page=read("miniapp/pages/cny-wallet/index.js");
 const create=read("app/api/wechat/mini/cny-topup/create/route.ts");
 const availability=read("app/api/wechat/mini/cny-topup/availability/route.ts");
 assert.ok(app.pages.includes("pages/cny-wallet/index"));
 assert.ok(client.includes('openMiniWallet(currency: "CNY" | "USD"'));
 assert.ok(client.includes("/pages/cny-wallet/index"));
 assert.ok(client.includes("/ai-wallet?currency=USD"));
 assert.ok(page.includes("wx.requestPayment"));
 assert.ok(!page.includes("wx.requestVirtualPayment"));
 assert.ok(page.includes("cny-topup/availability")&&page.includes("cny-topup/create")&&page.includes("cny-topup/status"));
 assert.ok(create.includes("createMiniJsapiOrder"));
 assert.ok(create.includes('admin.rpc("reserve_mini_cny_jsapi_topup_order"'));
 assert.ok(availability.includes("WECHAT_MINI_JSAPI_TOPUPS_ENABLED"));
 assert.ok(availability.includes("PRODUCTION_ENV_REQUIRED"));
 assert.ok(availability.includes("APP_ID_MISMATCH"));
});

test("custom CNY amount parser accepts decimal JSAPI amounts through the 10000 CNY cap",()=>{
 let page;
 vm.runInNewContext(read("miniapp/pages/cny-wallet/index.js"),{
  Page:value=>{page=value;},
  wx:{},
  require:()=>({login:async()=>{},request:async()=>({}),publicRequest:async()=>({}),wxLogin:async()=>({code:"test"})}),
 });
 page.setData=update=>Object.assign(page.data,update);
 page.chooseCustom();
 page.input({detail:{value:"123.45"}});
 assert.equal(page.data.amountText,"123.45");
 const parsed=page.currentAmount();assert.equal(parsed.minor,12345);assert.equal(parsed.text,"123.45");
 page.input({detail:{value:"0.01"}});
 assert.equal(page.data.amountText,"0.01");
 page.input({detail:{value:"123.456"}});
 assert.equal(page.data.amountText,"");
 page.input({detail:{value:"10000.01"}});
 assert.equal(page.data.amountText,"");
});

test("retired wallet pages, APIs and client helpers are absent",()=>{
 const app=JSON.parse(read("miniapp/app.json"));
 assert.ok(!app.pages.includes("pages/balance/index")&&!app.pages.includes("pages/recharge/index"));
 for(const path of [
  "miniapp/pages/balance","miniapp/pages/recharge","miniapp/utils/topup-expiry.js","miniapp/utils/virtual-payment-errors.js",
  "app/api/wechat/mini/balance-pay"
 ])assert.equal(exists(path),false,path);
 const client=read("lib/mini/payment-client.ts");
 assert.ok(!client.includes("openMiniRecharge")&&!client.includes("/pages/balance/index"));
 assert.ok(!read("components/MiniPaymentBoundary.tsx").includes("openMiniRecharge"));
 assert.ok(!read("components/Nav.tsx").includes("openMiniRecharge"));
 assert.ok(!read("app/account/MiniAccountLinkPanel.tsx").includes("openMiniRecharge"));
});

test("CNY JSAPI top-up keeps idempotency and provider reconciliation",()=>{
 const page=read("miniapp/pages/cny-wallet/index.js");
 const create=read("app/api/wechat/mini/cny-topup/create/route.ts");
 const status=read("app/api/wechat/mini/cny-topup/status/route.ts");
 assert.ok(page.includes("lx_mini_cny_jsapi_pending_v1"));
 assert.ok(page.includes("requestId")&&page.includes("orderId")&&page.includes("recoverPending"));
 assert.ok(create.includes("REQUEST_ID"));
 assert.ok(create.includes("existingOrderResponse"));
 assert.ok(create.includes("queryMiniJsapiOrder")&&create.includes("closeMiniJsapiOrder"));
 assert.ok(create.includes("reserve_mini_cny_jsapi_topup_order"));
 assert.ok(create.includes("(\\.[0-9]{1,2})"));
 assert.ok(status.includes("queryMiniJsapiOrder")&&status.includes("fulfillPaidOrder"));
 assert.ok(!create.includes('admin.rpc("reserve_mini_cny_topup_order"'));
 assert.ok(!/expireCheckout|orders['"]?,\s*\{\s*method:\s*['"]DELETE/.test(page));
});

test("new JSAPI reservation is service-role-only and legacy pending-order RPC remains isolated",()=>{
 const create=read("app/api/wechat/mini/cny-topup/create/route.ts");
 const migration=read("supabase/migrations/20261116181000_mini_cny_jsapi_topup_20261116.sql");
 assert.ok(migration.includes("reserve_mini_cny_jsapi_topup_order"));
 assert.ok(migration.includes("pg_advisory_xact_lock"));
 assert.ok(migration.includes("SECURITY INVOKER"));
 assert.ok(migration.includes("REVOKE ALL ON FUNCTION"));
 assert.ok(migration.includes("GRANT EXECUTE ON FUNCTION public.reserve_mini_cny_jsapi_topup_order"));
 assert.ok(migration.includes("TO service_role"));
 assert.ok(migration.includes("p_snapshot->>'requestId' !~"));
 assert.ok(migration.includes("p_snapshot->>'appId' IS DISTINCT FROM 'wxbf4ae90406e7e26b'"));
 assert.ok(migration.includes("NULLIF(p_snapshot->>'openid', '') IS NULL"));
 assert.ok(migration.includes("provider IN ('wechat', 'wechat_mini_virtual')"));
 assert.ok(!migration.includes("SECURITY DEFINER"));
 assert.ok(!exists("supabase/migrations/20261116194500_retire_legacy_mini_virtual_topup_rpc.sql"));
 assert.ok(!create.includes('admin.rpc("reserve_mini_cny_topup_order"'));
});

test("WeChat callback validates mini AppID, payer openid and the exact reserved out-trade number",()=>{
 const notify=read("app/api/pay/wechat/notify/route.ts");
 assert.ok(notify.includes("WECHAT_MINI_APP_ID"));
 assert.ok(notify.includes("mini_jsapi_topup_order_created"));
 assert.ok(notify.includes("snapshot.outTradeNo !== outTradeNo"));
 assert.ok(notify.includes("snapshot.openid !== (decrypted.payer as any)?.openid"));
 const account=read("app/api/wechat/mini/account-summary/route.ts");
 assert.ok(account.includes('.eq("channel", "mini-program")'));
 assert.ok(account.includes('.eq("provider", "wechat_mini_virtual")'));
});
test("tool-product virtual payment and historical wallet settlement/refunds remain separate",()=>{
 const toolPage=read("miniapp/pages/pay/index.js");
 assert.ok(toolPage.includes("wx.requestVirtualPayment"));
 assert.ok(toolPage.includes("tool-pay/create"));
 assert.ok(toolPage.includes("/pages/cny-wallet/index"));
 assert.ok(exists("app/api/wechat/mini/tool-pay/create/route.ts"));
 const fulfillment=read("lib/mini/virtual-fulfillment.ts");
 const refund=read("lib/mini/virtual-refund.ts");
 assert.ok(fulfillment.includes("virtualTopupGoods")&&fulfillment.includes("fulfillPaidOrder"));
 assert.ok(refund.includes("reconcileVirtualRefund")&&refund.includes("mini_order_refund_v1"));
 assert.ok(read("app/api/wechat/mini/pay/notify/route.ts").includes("reconcileVirtualToolOrder"));
});

test("account name editor remains visible and full-width on mobile",()=>{
 const profile=read("components/AccountProfileCard.tsx");
 const css=read("app/unified-shell.css");
 assert.ok(profile.includes("lx-account-save-button"));
 assert.ok(profile.includes("lx-account-name-input"));
 assert.ok(css.includes("flex-direction:column!important"));
 assert.ok(css.includes(".lx-account-name-edit .lx-account-save-button"));
});
