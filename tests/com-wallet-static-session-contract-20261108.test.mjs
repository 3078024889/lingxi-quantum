import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("wallet is anonymous static shell with no server-rendered private balance",()=>{
 const page=read("app/ai-wallet/page.tsx");
 assert.match(page,/export const dynamic="force-static"/);
 assert.match(page,/<WalletLivePanel\s*\/>/);
 assert.doesNotMatch(page,/readUnifiedBalanceSnapshot|getServerUser|createClient/);
 const client=read("components/WalletLivePanel.tsx");
 assert.match(client,/fetch\("\/api\/money\/summary"/);
 assert.match(client,/credentials:"same-origin"/);
 assert.match(client,/cache:"no-store"/);
 assert.match(client,/response\.status===401/);
 assert.match(client,/validSummary\(result\)/);
 assert.match(client,/status:"error"/);
 assert.match(client,/Number\.isSafeInteger/);
});

test("Cloudflare static wallet is an anonymous asset while private API stays dynamic",()=>{
 const patch=read("scripts/cloudflare/patch-critical-static-html-20261108.mjs");
 assert.match(patch,/"\/ai-wallet":"ai-wallet.html"/);
 assert.match(patch,/pathname\.startsWith\("\/api\/"\)/);
 const wf=read(".github/workflows/com-unified-next-isolated-canary-20261108.yml");
 assert.match(wf,/ai-wallet:ai-wallet/);
 assert.match(wf,/\$path" = \/ai-wallet/);
 const cutover=read("scripts/cloudflare/com-unified-apex-verified-cutover-20261108.mjs");
 assert.match(cutover,/"\/ai-wallet"/);
 assert.doesNotMatch(cutover,/COM_LEGACY_WALLET_PREFLIGHT|walletBridge/);
 assert.match(cutover,/COM_POSTCUTOVER_HEALTH_FAIL_ROLLBACK_BEGIN/);
});
