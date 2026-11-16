import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const read = path => readFileSync(path, "utf8");
const exists = path => existsSync(path);

test("CNY uses the native Mini Program wallet and USD uses the official website wallet", () => {
  const client=read("lib/mini/payment-client.ts");
  const wallet=read("components/WalletLivePanel.tsx");
  const app=JSON.parse(read("miniapp/app.json"));
  assert.ok(app.pages.includes("pages/cny-wallet/index"));
  assert.match(client,/openMiniWallet\(currency: "CNY" \| "USD"/);
  assert.ok(client.includes("/pages/cny-wallet/index"));
  assert.ok(client.includes("/ai-wallet?currency=USD"));
  assert.match(wallet,/detectMiniPaymentContext/);
  assert.match(wallet,/openMiniCnyTopup/);
  assert.match(wallet,/\/checkout-usd\?productId=sasi-usd-balance-/);
  assert.match(read("app/checkout-usd/page.tsx"),/paypalReady/);
});

test("retired recharge pages are absent while the new CNY API and native page are present", () => {
  const app=JSON.parse(read("miniapp/app.json"));
  assert.ok(!app.pages.includes("pages/balance/index"));
  assert.ok(!app.pages.includes("pages/recharge/index"));
  for(const path of ["miniapp/pages/balance","miniapp/pages/recharge","miniapp/utils/topup-expiry.js","miniapp/utils/virtual-payment-errors.js"]) assert.equal(exists(path),false,path);
  for(const path of ["miniapp/pages/cny-wallet/index.js","app/api/wechat/mini/cny-topup/create/route.ts","app/api/wechat/mini/cny-topup/availability/route.ts"]) assert.equal(exists(path),true,path);
});

test("uncertain CNY payments retain the original idempotency key and never create a second order", () => {
  const page=read("miniapp/pages/cny-wallet/index.js");
  assert.match(page,/lx_mini_cny_topup_pending_v2/);
  assert.match(page,/lx_mini_cny_topup_pending_v1/);
  assert.match(page,/paymentAttempted/);
  assert.match(page,/recoverPending/);
  assert.match(page,/tool-pay\/status/);
  assert.match(page,/balance-pay\/create/);
  assert.doesNotMatch(page,/expireCheckout|orders['"]?,\s*\{\s*method:\s*['"]DELETE/);
  assert.match(read("app/api/wechat/mini/cny-topup/create/route.ts"),/reserve_mini_cny_topup_order/);
  assert.match(read("supabase/migrations/20261116120000_mini_cny_topup_atomic_reservation.sql"),/pg_advisory_xact_lock/);
});

test("tool-product virtual payment remains independent from wallet top-ups", () => {
  const page=read("miniapp/pages/pay/index.js");
  assert.match(page,/requestVirtualPayment/);
  assert.match(page,/tool-pay\/create/);
  assert.ok(page.includes("/pages/cny-wallet/index"));
  assert.ok(exists("app/api/wechat/mini/tool-pay/create/route.ts"));
});

test("historical CNY settlement, refund and idempotent credit paths remain intact", () => {
  assert.match(read("lib/mini/virtual-fulfillment.ts"),/virtualTopupGoods/);
  assert.match(read("lib/mini/virtual-fulfillment.ts"),/fulfillPaidOrder/);
  assert.match(read("lib/mini/virtual-refund.ts"),/virtualTopupGoods/);
  assert.match(read("app/api/wechat/mini/pay/notify/route.ts"),/reconcileVirtualToolOrder/);
});

test("mobile account name editor uses a visible full-width Save action", () => {
  const profile=read("components/AccountProfileCard.tsx");
  const css=read("app/unified-shell.css");
  assert.match(profile,/lx-account-save-button/);
  assert.match(profile,/lx-account-name-input/);
  assert.match(css,/flex-direction:column!important/);
  assert.match(css,/\.lx-account-name-edit \.lx-account-save-button/);
});
