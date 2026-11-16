import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
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
 const usdCheckout=read("app/checkout-usd/page.tsx");
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
 assert.match(usdCheckout,/usdBalanceTopupReady/);
 assert.match(usdCheckout,/product\?\.group==="wallet"\?walletTopupReady:paypalReady/);
 assert.match(usdCheckout,/!paymentReady/);
 assert.match(wallet,/sasi-balance-custom-/);
 assert.match(wallet,/sasi-usd-balance-custom-/);
});
test("CNY payment order references are persisted atomically before provider checkout",()=>{
 const wx=read("app/api/pay/wechat/create/route.ts");
 const ali=read("app/api/pay/alipay/create/route.ts");
 for(const [source,gateway] of [[wx,"createWechatNativeOrder"],[ali,"createAlipayPaymentUrl"]]){
  assert.match(source,/randomUUID/);
  assert.match(source,/provider_payment_id:\s*outTradeNo/);
  const postHandler=source.indexOf("export async function POST");
  const gatewayCall=source.indexOf(gateway+"({",postHandler);
  assert.ok(gatewayCall>postHandler);
  assert.ok(source.indexOf("provider_payment_id: outTradeNo",postHandler)<gatewayCall);
  assert.doesNotMatch(source,/update\(\{\s*provider_payment_id:\s*outTradeNo/);
 }
});
test("Alipay refund completion validates the exact original order and refund amount",()=>{
 const adapters=read("lib/money/provider-adapters.ts");
 assert.match(adapters,/function assertAlipayRefund/);
 assert.match(adapters,/ALIPAY_REFUND_ORDER_MISMATCH/);
 assert.match(adapters,/ALIPAY_REFUND_AMOUNT_MISMATCH/);
 assert.match(adapters,/ALIPAY_REFUND_AMOUNT_MISSING/);
 assert.match(adapters,/WECHAT_REFUND_ORDER_REFERENCE_MISSING/);
 assert.match(adapters,/WECHAT_REFUND_AMOUNT_MISSING/);
 assert.match(adapters,/PAYPAL_REFUND_AMOUNT_MISSING/);
 assert.equal((adapters.match(/assertAlipayRefund\(r,x\)/g)||[]).length,2);
});
test("USD wallet top-up keeps its existing production readiness contract and exposes its live readiness to admins",()=>{
 const paypal=read("app/api/pay/create/route.ts");
 assert.match(paypal,/USD_BALANCE_TOPUP_ENABLED/);
 assert.match(paypal,/SASI_REFUND_FLOW_TESTED/);
 const admin=read("app/api/admin/pay/readiness/route.ts");
 assert.match(admin,/usdBalanceTopupReady/);
 assert.match(admin,/refundFlowTested/);
});


test("CN3196 candidate preflight is read-only and pins the live port topology",()=>{
 const source=read("scripts/ops/cn3196-candidate-preflight-20261116.sh");
 assert.match(source,/PROD_PORT=3195/);
 assert.match(source,/CANDIDATE_PORT=3196/);
 assert.match(source,/ROLLBACK_PORT=3193/);
 assert.match(source,/EXPECTED_PROD_SHA='59d29734ca4cd4c2e6df81d22d2af0287764a9f2'/);
 assert.match(source,/CN_NGINX_PRODUCTION_UPSTREAM_3195_MISSING/);
 assert.match(source,/CN_NGINX_CANDIDATE_NOT_PUBLIC=YES/);
 assert.match(source,/CN3193_ROLLBACK_LISTENER=NOT_RUNNING/);
 assert.match(source,/CN3196_CANDIDATE_PORT_FREE=YES/);
 assert.match(source,/CN3196_CANDIDATE_PREFLIGHT_PASS/);
 assert.match(source,/NO_ENV_CHANGE_NO_SERVICE_RESTART_NO_NGINX_CHANGE_NO_ORDER_CREATED_NO_CHARGE/);
 assert.doesNotMatch(source,/systemctl\s+(?:start|stop|restart|reload|enable|disable)\b/);
 assert.doesNotMatch(source,/nginx\s+-t|systemctl\s+reload\s+nginx|set_nginx_upstream/);
 assert.doesNotMatch(source,/--data(?:-binary)?|-X\s+POST|rm\s+-rf|mktemp/);
 const syntax=spawnSync("bash",["-n","scripts/ops/cn3196-candidate-preflight-20261116.sh"],{encoding:"utf8"});
 assert.equal(syntax.status,0,syntax.stderr);
});
