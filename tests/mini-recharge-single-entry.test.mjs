import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read = path => readFileSync(path, "utf8");
const exists = path => existsSync(path);

test("CNY uses the native Mini Program merchant JSAPI wallet and USD uses the official website wallet", () => {
  const client=read("lib/mini/payment-client.ts");
  const wallet=read("components/WalletLivePanel.tsx");
  const app=JSON.parse(read("miniapp/app.json"));
  assert.ok(app.pages.includes("pages/cny-wallet/index"));
  assert.ok(client.includes('openMiniWallet(currency: "CNY" | "USD"'));
  assert.ok(client.includes("/pages/cny-wallet/index"));
  assert.ok(client.includes("/ai-wallet?currency=USD"));
  assert.ok(wallet.includes("detectMiniPaymentContext"));
  assert.ok(wallet.includes("openMiniCnyTopup"));
  assert.ok(wallet.includes("checkout-usd?productId=sasi-usd-balance-"));
  assert.ok(read("app/checkout-usd/page.tsx").includes("paypalReady"));
});

test("retired recharge pages are absent while the JSAPI API and native page are present", () => {
  const app=JSON.parse(read("miniapp/app.json"));
  assert.ok(!app.pages.includes("pages/balance/index"));
  assert.ok(!app.pages.includes("pages/recharge/index"));
  for(const path of ["miniapp/pages/balance","miniapp/pages/recharge","miniapp/utils/topup-expiry.js","miniapp/utils/virtual-payment-errors.js"]) assert.equal(exists(path),false,path);
  for(const path of ["miniapp/pages/cny-wallet/index.js","app/api/wechat/mini/cny-topup/create/route.ts","app/api/wechat/mini/cny-topup/availability/route.ts","app/api/wechat/mini/cny-topup/status/route.ts"]) assert.equal(exists(path),true,path);
  assert.ok(read("miniapp/pages/cny-wallet/index.js").includes("wx.requestPayment"));
  assert.doesNotMatch(read("miniapp/pages/cny-wallet/index.js"),/requestVirtualPayment/);
});

test("uncertain CNY payments retain the original idempotency key and never create a second order", () => {
  const page=read("miniapp/pages/cny-wallet/index.js");
  assert.ok(page.includes("lx_mini_cny_topup_pending_v2"));
  assert.ok(page.includes("lx_mini_cny_topup_pending_v1"));
  assert.ok(page.includes("paymentAttempted"));
  assert.ok(page.includes("recoverPending"));
  assert.ok(page.includes("cny-topup/status"));
  assert.ok(page.includes("cny-topup/create"));
  assert.ok(!page.includes("expireCheckout"));
  assert.ok(read("app/api/wechat/mini/cny-topup/create/route.ts").includes("reserve_mini_cny_jsapi_topup_order"));
  const availability=read("app/api/wechat/mini/cny-topup/availability/route.ts");
  assert.ok(availability.includes("TOPUPS_DISABLED"));
  assert.ok(availability.includes("APP_ID_MISMATCH"));
  assert.ok(availability.includes("PROVIDER_CONFIG_MISSING"));
  assert.ok(availability.includes("providerConfigured"));
  assert.match(read("miniapp/pages/cny-wallet/index.js"),/disabledMessages/);
  const migration=read("supabase/migrations/20261116180000_mini_cny_jsapi_topup_reservation.sql");
  assert.match(migration,/pg_advisory_xact_lock/);
  assert.match(migration,/SECURITY INVOKER/);
  assert.match(migration,/REVOKE ALL ON FUNCTION/);
  assert.ok(migration.includes("GRANT EXECUTE ON FUNCTION public.reserve_mini_cny_jsapi_topup_order"));
  assert.ok(migration.includes("TO service_role"));
});

test("tool-product virtual payment remains independent from wallet top-ups", () => {
  const page=read("miniapp/pages/pay/index.js");
  assert.ok(page.includes("requestVirtualPayment"));
  assert.ok(page.includes("tool-pay/create"));
  assert.ok(page.includes("/pages/cny-wallet/index"));
  assert.ok(exists("app/api/wechat/mini/tool-pay/create/route.ts"));
});

test("historical CNY virtual settlements, refunds and idempotent credits remain intact", () => {
  assert.ok(read("lib/mini/virtual-fulfillment.ts").includes("virtualTopupGoods"));
  assert.ok(read("lib/mini/virtual-fulfillment.ts").includes("fulfillPaidOrder"));
  assert.ok(read("lib/mini/virtual-refund.ts").includes("reconcileVirtualRefund"));
  assert.ok(read("lib/mini/virtual-refund.ts").includes("virtual_topup_order_created"));
  assert.ok(read("lib/mini/virtual-refund.ts").includes("mini_order_refund_v1"));
  assert.ok(read("app/api/wechat/mini/pay/notify/route.ts").includes("reconcileVirtualToolOrder"));
});

test("mobile account name editor uses a visible full-width Save action", () => {
  const profile=read("components/AccountProfileCard.tsx");
  const css=read("app/unified-shell.css");
  assert.ok(profile.includes("lx-account-save-button"));
  assert.ok(profile.includes("lx-account-name-input"));
  assert.ok(css.includes("flex-direction:column!important"));
  assert.ok(css.includes(".lx-account-name-edit .lx-account-save-button"));
});
