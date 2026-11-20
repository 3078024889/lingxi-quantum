import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("account center is current and preserves real user authentication & orders",()=>{
 const account=read("app/account/page.tsx"),client=read("app/account/AccountClientShell.tsx"),panel=read("components/AccountCenterV26.tsx");
 assert.match(account,/export const dynamic = "force-static"/);
 assert.match(account,/<AccountClientShell \/>/);
 assert.doesNotMatch(account,/getServerUser|paidOrderCount|createClient/);
 assert.match(client,/supabase\.auth\.getUser\(\)/);
 assert.match(client,/supabase\.auth\.onAuthStateChange/);
 assert.match(client,/paidOrderCount/);
 assert.match(client,/AccountCenterV26/);
 assert.doesNotMatch(account,/继续短剧、网站、书本、学习和科研/);
 for(const p of ["/products","/account/orders","/ai-wallet","/sasi","/account/withdrawals","/account/support","/account/notifications","/account/settings"])
  assert.ok(panel.includes(p),"missing account link "+p);
 for(const component of ["AccountProfileCard","ChangePasswordForm","SwitchAccountButton","SignOutButton","DeleteAccountButton"])
  assert.ok(panel.includes(component),"missing secure action "+component);
});
test("wallet design is driven by validated server-side money, never static fake amounts",()=>{
 const page=read("app/ai-wallet/page.tsx"),live=read("components/WalletLivePanel.tsx");
 assert.match(page,/lx26-wallet-page/);
 assert.match(live,/fetch\("\/api\/money\/summary"/);
 assert.match(live,/validSummary\(result\)/);
 assert.match(live,/Number\.isSafeInteger/);
 assert.match(live,/WalletLedgerPanel/);
 assert.match(live,/BALANCE_TOPUP_AMOUNTS/);
 assert.match(live,/lx26-wallet-overview/);
 assert.doesNotMatch(live,/支付通道未开放时不会扣款或创建收费订单/);
});
test("tools hub preserves search, real catalog and compact reference layout",()=>{
 const page=read("app/tools/page.tsx"),tools=read("components/tools/ToolsHubV11.tsx");
 assert.match(page,/ToolsHubV11/);
 for(const term of ["publicToolSurface()","searchToolItems(","TOOL_DISPLAY_CATEGORIES","setFreeOnly(","RecentTools","lx26-tools-stage","lx26-tools-search","/tools/pass"])
  assert.ok(tools.includes(term),"missing working tools behavior "+term);
 assert.equal((tools.match(/<input /g)||[]).length,1);
});
test("scoped visual layer loaded last and retired SASI pages cannot become public creation entrypoints",()=>{
 const css=read("app/lingxifield-premium-20261109.css"),layout=read("app/layout.tsx");
 assert.ok(layout.indexOf("v43-product-visuals.css")<layout.indexOf("lingxifield-premium-20261109.css"));
 for(const selector of [".lx26-account-services",".lx26-wallet-overview",".lx26-tools-stage","@media(max-width:700px)"])
  assert.ok(css.includes(selector),"missing responsive visual "+selector);
 for(const route of ["drama","series","chat","director","image","assemble","build","project-dna","variants"]){
  const path="app/sasi/"+route+"/page.tsx";
  assert.ok(existsSync(new URL("../"+path,import.meta.url)));
  const src=read(path);
  assert.match(src,/permanentRedirect\("\/sasi"\)/);
  assert.match(src,/index:false/);
 }
 const pricing=read("app/sasi/pricing/page.tsx");
 assert.match(pricing,/permanentRedirect\("\/ai-wallet"\)/);
 const deleted=["SasiCommandCenter","SasiAutonomyEntrances","SasiByokImageStudio","SasiMultiEpisodeWorkspace","SasiNativeCreatePanel","SasiOneSurface","SasiProjectDNAEditor","SasiSeriesStudio","SasiVariantWorkbench"];
 for(const name of deleted)assert.equal(existsSync(new URL("../components/"+name+".tsx",import.meta.url)),false,"retired source unexpectedly restored: "+name);
 const nav=read("components/Nav.tsx");
 assert.doesNotMatch(nav,/href="\/sasi\/(?:drama|image|director|series|build|chat)"/);
});
