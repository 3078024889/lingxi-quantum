import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("CNY preset and custom wallet top-ups remain open without the SASI generation refund flag",()=>{
 const gate=read("lib/sasi/payment-gate.ts");
 assert.match(gate,/SASI_TOPUP_PRODUCTS\.has\(productId\)/);
 assert.match(gate,/customTopupAmount\(custom\[1\]\) !== null/);
 const topupGate=gate.slice(gate.indexOf("export function sasiTopupProductEnabled"),gate.indexOf("export function sasiPaidProductionEnabled"));
 assert.doesNotMatch(topupGate,/SASI_REFUND_FLOW_TESTED/);
 for(const path of ["app/api/pay/alipay/create/route.ts","app/api/pay/wechat/create/route.ts"])
  assert.match(read(path),/sasiTopupProductEnabled/);
 const wallet=read("components/WalletLivePanel.tsx");
 assert.match(wallet,/topupCurrency==="CNY"\?\(providers\?\.wechat===true\|\|providers\?\.alipay===true\):providers\?\.paypal===true/);
 assert.match(wallet,/sasi-balance-custom-/);
 assert.match(wallet,/sasi-usd-balance-custom-/);
});
test("USD wallet top-up keeps its existing production readiness contract and exposes its live readiness to admins",()=>{
 const paypal=read("app/api/pay/create/route.ts");
 assert.match(paypal,/USD_BALANCE_TOPUP_ENABLED/);
 assert.match(paypal,/SASI_REFUND_FLOW_TESTED/);
 const admin=read("app/api/admin/pay/readiness/route.ts");
 assert.match(admin,/usdBalanceTopupReady/);
 assert.match(admin,/refundFlowTested/);
});
