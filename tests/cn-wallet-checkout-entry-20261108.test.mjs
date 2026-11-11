import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("wallet page renders the authenticated live balance and ledger panel",()=>{
 const page=read("app/ai-wallet/page.tsx");
 const panel=read("components/WalletLivePanel.tsx");
 const ledger=read("components/WalletLedgerPanel.tsx");
 assert.match(page,/WalletLivePanel/);
 assert.doesNotMatch(page,/redirect\(["']\/sasi\/pricing/);
 assert.match(panel,/fetch\(["']\/api\/money\/summary/);
 assert.match(panel,/response\.status===401/);
 assert.match(panel,/WalletLedgerPanel/);
 assert.match(panel,/\/api\/pay\/providers/);
 assert.match(ledger,/WalletLedgerPanel|ledger|balance|transaction/i);
});

test("account center links to actual wallet, order and withdrawal pages",()=>{
 const page=read("app/account/page.tsx");
 const center=read("components/AccountCenterV26.tsx");
 assert.match(page,/<AccountClientShell \/>/);
 const shell=read("app/account/AccountClientShell.tsx");
 assert.match(shell,/AccountCenterV26/);
 assert.match(center,/href:"\/ai-wallet"/);
 assert.match(center,/href:"\/account\/orders"/);
 assert.match(center,/href:"\/account\/withdrawals"/);
 assert.doesNotMatch(page,/\/sasi\/pricing#withdrawals/);
});

test("checkout refreshes real provider readiness and exposes retry feedback",()=>{
 const page=read("app/checkout/page.tsx");
 assert.match(page,/refreshProviders = useCallback/);
 assert.match(page,/fetch\(["']\/api\/pay\/providers/);
 assert.doesNotMatch(page,/fetch\(["']\/api\/pay\/alipay\/status/);
 assert.match(page,/refreshProviders\(\)/);
 assert.match(page,/role="alert"/);
 assert.match(page,/onClick=\{payNow\}/);
 assert.match(page,/href="\/ai-wallet"/);
});

test("server refuses disabled payment and authenticates provider checkout",()=>{
 const wechat=read("app/api/pay/wechat/create/route.ts");
 const alipay=read("app/api/pay/alipay/create/route.ts");
 for(const [source,guard] of [[wechat,/if\s*\(!wechatPayEnabled\(\)\)/],[alipay,/if\s*\(!alipayEnabled\(\)\)/]]){
  assert.match(source,guard);
  assert.match(source,/isSameOriginMutation/);
  assert.match(source,/auth\.getUser\(\)/);
 }
 const notify=read("app/api/pay/wechat/notify/route.ts");
 assert.match(notify,/verifyWechatNotifySignature/);
 assert.match(notify,/paymentAmount\.total/);
});

test("provider readiness requires complete merchant callback identity",()=>{
 const wechat=read("lib/wechatpay.ts");
 assert.match(wechat,/WECHAT_PLATFORM_PUBLIC_KEY/);
 assert.match(wechat,/WECHAT_PLATFORM_PUBLIC_KEY_ID/);
 assert.match(wechat,/wechatPayKeyMaterialReady/);
 const alipay=read("lib/alipay.ts");
 assert.match(alipay,/ALIPAY_SELLER_ID/);
 assert.match(alipay,/alipayKeyMaterialReady/);
 const notify=read("app/api/pay/alipay/notify/route.ts");
 assert.match(notify,/params\.seller_id !== expectedSeller/);
});
