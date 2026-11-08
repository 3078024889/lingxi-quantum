import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("wallet resolves to authenticated real balances, not legacy pricing redirect", () => {
 const wallet=read("app/ai-wallet/page.tsx");
 assert.doesNotMatch(wallet, /redirect\("\/sasi\/pricing"\)/);
 assert.match(wallet, /getServerUser\(supabase\)/);
 assert.match(wallet, /readUnifiedBalanceSnapshot\(supabase,user\.id\)/);
 assert.match(wallet, /readFailed/);
 assert.match(wallet, /formatMinor\(currency,balance\.availableMinor\)/);
 assert.match(wallet, /\/account\/withdrawals/);
 assert.match(wallet, /\/account\/orders/);
 assert.match(wallet, /BALANCE_TOPUP_AMOUNTS/);
 assert.match(wallet, /normalizeWithdrawalStatus/);
 assert.match(wallet, /balance_withdrawals/);
 const withdrawals=read("app/account/withdrawals/page.tsx");
 assert.match(withdrawals, /redirect\("\/ai-wallet#withdrawals"\)/);
 assert.doesNotMatch(withdrawals, /\/sasi\/pricing/);
});

test("account links open the real wallet and withdrawal routes", () => {
 const account=read("app/account/page.tsx");
 assert.match(account, /href="\/ai-wallet"[\s\S]*?\{T\.balance\}/);
 assert.match(account, /href="\/account\/withdrawals"[\s\S]*?\{T\.refund\}/);
 assert.doesNotMatch(account, /href="\/sasi\/pricing#withdrawals"/);
});

test("checkout shows actionable no-provider state and checks the runtime endpoint once", () => {
 const page=read("app/checkout/page.tsx");
 assert.match(page, /refreshProviders = useCallback/);
 assert.match(page, /fetch\("\/api\/pay\/providers"/);
 assert.doesNotMatch(page, /fetch\("\/api\/pay\/alipay\/status"/);
 assert.match(page, /onClick=\{\(\) => void refreshProviders\(\)\}/);
 assert.match(page, /role="alert"/);
 assert.match(page, /支付通道未开放 · 查看原因/);
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
