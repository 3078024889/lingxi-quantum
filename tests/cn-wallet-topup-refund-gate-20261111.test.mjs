import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("CNY wallet creation is closed unless the refund lifecycle and CNY wallet flag are both verified",()=>{
 const gate=read("lib/sasi/payment-gate.ts");
 const alipay=read("app/api/pay/alipay/create/route.ts");
 const wechat=read("app/api/pay/wechat/create/route.ts");
 assert.match(gate,/SASI_RMB_BALANCE_V1_ENABLED !== "true"/);
 assert.match(gate,/SASI_REFUND_FLOW_TESTED !== "true"/);
 assert.match(alipay,/sasiTopupProductEnabled\(product\.id\)/);
 assert.match(wechat,/sasiTopupProductEnabled\(product\.id\)/);
});
test("USD wallet creation requires both the dedicated USD flag and refund lifecycle verification",()=>{
 const paypal=read("app/api/pay/create/route.ts");
 assert.match(paypal,/USD_BALANCE_TOPUP_ENABLED!=="true"\|\|process\.env\.SASI_REFUND_FLOW_TESTED!=="true"/);
});
test("public payment diagnostics expose only non-secret top-up readiness booleans",()=>{
 const providers=read("app/api/pay/providers/route.ts");
 assert.match(providers,/walletTopupsCny/);
 assert.match(providers,/walletTopupsUsd/);
 assert.match(providers,/SASI_RMB_BALANCE_V1_ENABLED/);
 assert.match(providers,/USD_BALANCE_TOPUP_ENABLED/);
 assert.doesNotMatch(providers,/CLIENT_SECRET|PRIVATE_KEY|API_KEY/);
});
test("wallet UI disables preset and custom recharge unless the matching currency lifecycle is verified",()=>{
 const wallet=read("components/WalletLivePanel.tsx");
 assert.match(wallet,/walletTopupsCny:p\.walletTopupsCny===true/);
 assert.match(wallet,/walletTopupsUsd:p\.walletTopupsUsd===true/);
 assert.match(wallet,/providers\?\.walletTopupsCny===true/);
 assert.match(wallet,/providers\?\.walletTopupsUsd===true/);
 assert.match(wallet,/data-testid="wallet-custom-amount-input"/);
 assert.match(wallet,/data-testid="wallet-custom-topup"/);
});