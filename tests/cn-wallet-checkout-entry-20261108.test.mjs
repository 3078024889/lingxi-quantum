import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("wallet resolves to authenticated real balances, not legacy pricing redirect", () => {
 const wallet=read("app/ai-wallet/page.tsx");
 assert.doesNotMatch(wallet, /redirect\("\/sasi\/pricing"\)/);
 const client=read("components/WalletLivePanel.tsx");
 const summary=read("app/api/money/summary/route.ts");
 assert.match(wallet, /<WalletLivePanel\s*\/>/);
 assert.match(summary, /getServerUser\(supabase\)/);
 assert.match(summary, /readUnifiedBalanceSnapshot\(supabase,user\.id\)/);
 assert.match(summary, /if\(!user\)return.*status:401/);
 assert.match(summary, /\.eq\("user_id",user\.id\)/);
 assert.match(summary, /"Cache-Control":"no-store"/);
 assert.match(client, /status:"error"/);
 assert.match(client, /money\(currency,b\.availableMinor\)/);
 assert.match(client, /b\.refundableMinor/);
 assert.match(client, /b\.refundHoldMinor/);
 assert.match(client, /\/account\/withdrawals/);
 assert.match(client, /\/account\/orders/);
 assert.match(client, /BALANCE_TOPUP_AMOUNTS/);
 assert.match(client, /providers\?\.wechat===true\|\|providers\?\.alipay===true/);
 assert.match(client, /WalletLedgerPanel currency="CNY"/);
 assert.match(client, /WalletLedgerPanel currency="USD"/);
 assert.match(client, /tab==="withdrawals"/);
 assert.doesNotMatch(client, /setData\(\{status:"ready",summary:\{balances:/);
 assert.match(summary, /normalizeWithdrawalStatus/);
 assert.match(summary, /balance_withdrawals/);
 const withdrawals=read("app/account/withdrawals/page.tsx");
 assert.match(withdrawals, /redirect\("\/ai-wallet#withdrawals"\)/);
 assert.doesNotMatch(withdrawals, /\/sasi\/pricing/);
});

test("account links open the real wallet and withdrawal routes from the new account center", () => {
 const account=read("app/account/page.tsx");
 const center=read("components/AccountCenterV26.tsx");
 assert.match(account, /AccountCenterV26/);
 assert.match(center, /href:"\/ai-wallet"/);
 assert.match(center, /zh:"余额"/);
 assert.match(center, /href:"\/account\/withdrawals"/);
 assert.match(center, /zh:"余额提现"/);
 assert.doesNotMatch(account, /href="\/sasi\/pricing#withdrawals"/);
});

test("checkout shows actionable no-provider state and checks the runtime endpoint once", () => {
 const page=read("app/checkout/page.tsx");
 assert.match(page, /refreshProviders = useCallback/);
 assert.match(page, /fetch\("\/api\/pay\/providers"/);
 assert.doesNotMatch(page, /fetch\("\/api\/pay\/alipay\/status"/);
 assert.match(page, /onClick=\{\(\) => void refreshProviders\(\)\}/);
 assert.match(page, /role="alert"/);
 assert.match(page, /onClick=\{payNow\}/);
 assert.match(page, /href="\/ai-wallet"/);
});

test("server still refuses disabled payments and authenticates charge creation", () => {
 const wechat=read("app/api/pay/wechat/create/route.ts");
 const alipay=read("app/api/pay/alipay/create/route.ts");
 assert.match(wechat, /if \(!wechatPayEnabled\(\)\)/);
 assert.match(alipay, /if \(!alipayEnabled\(\)\)/);
 for(const source of [wechat,alipay]){
   assert.match(source, /isSameOriginMutation/);
   assert.match(source, /auth\.getUser\(\)/);
 }
 const notify=read("app/api/pay/wechat/notify/route.ts");
 assert.match(notify, /verifyWechatNotifySignature/);
 assert.match(notify, /paymentAmount\.total/);
});
