import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import ts from "typescript";

const read=(p)=>fs.readFileSync(new URL("../"+p,import.meta.url),"utf8");
function loadPureTs(path){
 const source=read(path);
 const js=ts.transpileModule(source,{compilerOptions:{
  target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS
 }}).outputText;
 const module={exports:{}};
 new Function("module","exports",js)(module,module.exports);
 return module.exports;
}
const {summarizeGrowthVisits}=loadPureTs("lib/analytics/growth-attribution.ts");
const row=(i,minute="2026-11-05T02:00",source=null)=>({
 occurred_at:minute+":00Z",path:"/tools/"+i,session_hash:"hash-"+i,
 utm_source:source,utm_campaign:source?"qr_widget":null,
 utm_content:source?"owner_site":null,referrer_host:null
});

test("growth report never mistakes pageviews for actual people or completed actions",()=>{
 const report=summarizeGrowthVisits([row(1),row(2,"2026-11-05T02:02","partner_widget")],2);
 assert.equal(report.totalRecorded,2);
 assert.equal(report.sampledSessions,2);
 assert.equal(report.attributedViews,1);
 assert.equal(report.attributedSessions,1);
 assert.equal(report.flaggedViews,0);
 assert.equal(report.channels.length,2);
 assert.equal(report.truncated,false);
});
test("review burst detection requires a concurrent spread of sessions and distinct pages",()=>{
 const rows=Array.from({length:35},(_,i)=>row(i));
 const report=summarizeGrowthVisits(rows,35);
 assert.equal(report.flaggedMinutes,1);
 assert.equal(report.flaggedViews,35);
 const sameSession=rows.map(r=>({...r,session_hash:"one-session"}));
 assert.equal(summarizeGrowthVisits(sameSession,35).flaggedViews,0);
 const samePage=rows.map(r=>({...r,path:"/siai"}));
 assert.equal(summarizeGrowthVisits(samePage,35).flaggedViews,0);
});
test("partial sampling is explicit and publisher labels aren't treated as verified identities",()=>{
 const report=summarizeGrowthVisits([row(1,"2026-11-05T02:03","partner_widget")],100000);
 assert.equal(report.truncated,true);
 assert.equal(report.totalRecorded,100000);
 assert.equal(report.analyzed,1);
 assert.equal(report.channels[0].partner,"owner_site");
});
test("growth analytics are administrator-only and never expose hashes to client UI",()=>{
 const api=read("app/api/account/growth-stats/route.ts");
 const panel=read("components/money/GrowthAttributionPanel.tsx");
 const parent=read("components/MoneyAdminDashboard.tsx");
 assert.match(api,/if\(!await moneyAdministrator\(\)\)/);
 assert.match(api,/Cache-Control":"private, no-store"/);
 assert.match(api,/summarizeGrowthVisits/);
 assert.match(panel,/GrowthAttributionPanel/);
 assert(!panel.includes("session_hash"));
 assert.match(parent,/GrowthAttributionPanel days=\{Number\(days\)\}/);
});

test("voluntary public-tool sharing carries attribution, not private file contents",()=>{
 const rail=read("components/tools/ToolShareRail.tsx");
 assert.match(rail,/utm_source:'tool_share'/);
 assert.match(rail,/utm_campaign:'free_tools'/);
 assert.match(rail,/!privateSearchPath\(publicPath\)/);
 assert(!rail.includes("new FormData("));
});

test("voluntary SIAI comparison sharing keeps its filters and tracks source without leaking private state",()=>{
 const home=read("components/SiaiRankingHome.tsx");
 assert.match(home,/siaiSharePath\(\{query,category,task,payment,evidence,sort,compareIds\},lang\)/);
 assert.match(home,/outgoing\.searchParams\.set\("utm_source","siai_share"\)/);
 assert.match(home,/outgoing\.searchParams\.set\("utm_campaign","siai_compare"\)/);
});
