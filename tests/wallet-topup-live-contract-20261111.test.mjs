import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("CNY wallet top-ups require the independent CNY gate and do not inherit the SASI generation refund flag",()=>{
 const gate=read("lib/sasi/payment-gate.ts");
 assert.match(gate,/SASI_TOPUP_PRODUCTS\.has\(productId\)/);
 assert.match(gate,/customTopupAmount\(custom\[1\]\) !== null/);
 const topupGate=gate.slice(gate.indexOf("export function sasiTopupProductEnabled"),gate.indexOf("export function sasiPaidProductionEnabled"));
 assert.doesNotMatch(topupGate,/SASI_REFUND_FLOW_TESTED/);
 for(const path of ["app/api/pay/alipay/create/route.ts","app/api/pay/wechat/create/route.ts"])
  assert.match(read(path),/sasiTopupProductEnabled/);
 const wallet=read("components/WalletLivePanel.tsx");
 const providers=read("app/api/pay/providers/route.ts");
 const checkout=read("app/checkout-usd/page.tsx");
 assert.match(providers,/sasiRmbBalanceV1Enabled/);
 assert.match(providers,/cnyBalanceTopupReady\s*=\s*sasiRmbBalanceV1Enabled\(\)\s*&&\s*\(wechat\s*\|\|\s*alipay\)/);
 for(const path of ["app/api/pay/wechat/create/route.ts","app/api/pay/alipay/create/route.ts"]){
  const source=read(path);
  assert.match(source,/sasiRmbBalanceV1Enabled/);
  assert.match(source,/CNY_BALANCE_TOPUP_NOT_ENABLED/);
 }
 assert.match(providers,/usdBalanceTopupReady\s*=\s*paypal[\s\S]*USD_BALANCE_TOPUP_ENABLED[\s\S]*SASI_REFUND_FLOW_TESTED/);
 assert.match(wallet,/providers\?\.cnyBalanceTopupReady===true/);
 assert.match(wallet,/providers\?\.usdBalanceTopupReady===true/);
 assert.doesNotMatch(wallet,/providers\?\.paypal===true/);
 assert.match(checkout,/usdBalanceTopupReady/);
 assert.match(checkout,/setReady\(d\?\.usdBalanceTopupReady===true\)/);
 assert.match(wallet,/sasi-balance-custom-/);
 assert.match(wallet,/sasi-usd-balance-custom-/);
});

test("CNY payment order references are persisted atomically before provider checkout",()=>{
 const wx=read("app/api/pay/wechat/create/route.ts");
 const ali=read("app/api/pay/alipay/create/route.ts");
 for(const [source,gateway] of [[wx,"createWechatNativeOrder"],[ali,"createAlipayPaymentUrl"]]){
  assert.match(source,/randomUUID/);
  assert.match(source,/provider_payment_id:\\s*outTradeNo/);
  const postHandler=source.indexOf("export async function POST");
  const gatewayCall=source.indexOf(gateway+"({",postHandler);
  assert.ok(gatewayCall>postHandler);
  assert.ok(source.indexOf("provider_payment_id: outTradeNo",postHandler)<gatewayCall);
  assert.doesNotMatch(source,/update\\(\\{\\s*provider_payment_id:\\s*outTradeNo/);
 }
});
test("provider refund success must carry the matching amount and order reference",()=>{
 const adapters=read("lib/money/provider-adapters.ts");
 for(const term of ["assertAlipayRefund","ALIPAY_REFUND_ORDER_MISMATCH","ALIPAY_REFUND_AMOUNT_MISMATCH","ALIPAY_REFUND_AMOUNT_MISSING","WECHAT_REFUND_ORDER_REFERENCE_MISSING","WECHAT_REFUND_AMOUNT_MISSING","PAYPAL_REFUND_AMOUNT_MISSING"])
  assert.ok(adapters.includes(term),term);
 assert.equal((adapters.match(/assertAlipayRefund\\(r,x\\)/g)||[]).length,2);
});
test("USD wallet checkout is blocked unless both explicit wallet and refund gates pass",()=>{
 const paypal=read("app/api/pay/create/route.ts");
 assert.match(paypal,/getUsdBalanceProduct/);
 assert.match(paypal,/paypal(?:Pay)?Enabled/);
 assert.match(paypal,/walletProduct&&\(process\.env\.USD_BALANCE_TOPUP_ENABLED!=="true"\|\|process\.env\.SASI_REFUND_FLOW_TESTED!=="true"\)/);
 assert.match(paypal,/USD_BALANCE_TOPUP_NOT_ENABLED/);
 const adminPath="app/api/admin/pay/readiness/route.ts";
 if(existsSync(adminPath)){
  const admin=read(adminPath);
  assert.match(admin,/usdBalanceTopupReady/);
  assert.match(admin,/refundFlowTested/);
 }
});
