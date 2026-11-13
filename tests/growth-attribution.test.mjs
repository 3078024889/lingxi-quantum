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
const {summarizeGrowthVisits,summarizeGrowthToolFunnel}=loadPureTs("lib/analytics/growth-attribution.ts");
const row=(i,minute="2026-11-05T02:00",source=null)=>({
 occurred_at:minute+":00Z",path:"/tools/"+i,session_hash:"hash-"+i,
 utm_source:source,utm_campaign:source?"qr_widget":null,
 utm_content:source?"owner_site":null,referrer_host:null
});
const event=(session_id,event_type,metadata=null)=>({session_id,event_type,tool_id:"pdf-merge",metadata,created_at:"2026-11-05T02:00:00Z"});

test("growth report never mistakes pageviews for actual people or completed actions",()=>{
 const report=summarizeGrowthVisits([row(1),row(2,"2026-11-05T02:02","partner_widget")],2);
 assert.equal(report.totalRecorded,2);assert.equal(report.sampledSessions,2);
 assert.equal(report.attributedViews,1);assert.equal(report.attributedSessions,1);
 assert.equal(report.flaggedViews,0);assert.equal(report.channels.length,2);assert.equal(report.truncated,false);
});
test("review burst detection requires a concurrent spread of sessions and distinct pages",()=>{
 const rows=Array.from({length:35},(_,i)=>row(i));
 const report=summarizeGrowthVisits(rows,35);
 assert.equal(report.flaggedMinutes,1);assert.equal(report.flaggedViews,35);
 const sameSession=rows.map(r=>({...r,session_hash:"one-session"}));
 assert.equal(summarizeGrowthVisits(sameSession,35).flaggedViews,0);
 const samePage=rows.map(r=>({...r,path:"/siai"}));
 assert.equal(summarizeGrowthVisits(samePage,35).flaggedViews,0);
});
test("partial sampling is explicit and publisher labels aren't treated as verified identities",()=>{
 const report=summarizeGrowthVisits([row(1,"2026-11-05T02:03","partner_widget")],100000);
 assert.equal(report.truncated,true);assert.equal(report.totalRecorded,100000);assert.equal(report.analyzed,1);
 assert.equal(report.channels[0].partner,"owner_site");
});
test("tool completion funnel joins visits to tool events by anonymous host-scoped session hash",()=>{
 const visits=[{...row(1,"2026-11-05T02:00","partner_widget"),session_hash:"session-a"},{...row(2),session_hash:"session-b"}];
 const events=[event("session-a","tool_open"),event("session-a","process_started"),event("session-a","process_completed"),
  event("session-b","tool_open"),event("session-b","process_started"),event("session-b","process_failed")];
 const funnel=summarizeGrowthToolFunnel(visits,events,6);
 assert.equal(funnel.toolEventsTotal,6);assert.equal(funnel.toolEventsAnalyzed,6);
 assert.equal(funnel.toolOpens,2);assert.equal(funnel.toolStarts,2);assert.equal(funnel.toolCompletions,1);
 assert.equal(funnel.completedSessions,1);
 const partner=funnel.toolFunnelChannels.find(x=>x.source==="partner_widget");
 assert.equal(partner.sessions,1);assert.equal(partner.completedSessions,1);
 assert.equal(partner.completionRate,100);assert.equal(partner.taskSuccessRate,100);
 const direct=funnel.toolFunnelChannels.find(x=>x.source==="direct_or_unattributed");
 assert.equal(direct.sessions,1);assert.equal(direct.completedSessions,0);assert.equal(direct.taskSuccessRate,0);
});
test("tool funnel keeps UTM labels bounded and exposes truncation",()=>{
 const events=[event("orphan","process_completed",{utm_source:"partner_widget",utm_campaign:"launch_01",utm_content:"wp_site"})];
 const report=summarizeGrowthToolFunnel([],events,50);
 assert.equal(report.toolEventsTruncated,true);assert.equal(report.channels[0].source,"partner_widget");
 assert.equal(report.channels[0].campaign,"launch_01");assert.equal(report.channels[0].partner,"wp_site");
});
test("growth analytics are administrator-only and never expose hashes to client UI",()=>{
 const api=read("app/api/account/growth-stats/route.ts");
 const panel=read("components/money/GrowthAttributionPanel.tsx");
 const parent=read("components/MoneyAdminDashboard.tsx");
 assert.match(api,/if\(!await moneyAdministrator\(\)\)/);
 assert.match(api,/Cache-Control":"private, no-store"/);
 assert.match(api,/summarizeGrowthVisits/);assert.match(api,/summarizeGrowthToolFunnel/);
 assert.match(api,/from\("tool_events"\)/);assert.match(panel,/GrowthAttributionPanel/);
 assert.match(panel,/完成会话率/);assert(!panel.includes("session_hash"));assert(!panel.includes("session_id"));
 assert.match(parent,/GrowthAttributionPanel days=\{Number\(days\)\}/);
});
test("voluntary public-tool sharing carries attribution, not private file contents",()=>{
 const rail=read("components/tools/ToolShareRail.tsx");
 assert.match(rail,/utm_source:'tool_share'/);assert.match(rail,/utm_campaign:'free_tools'/);
 assert.match(rail,/!privateSearchPath\(publicPath\)/);assert(!rail.includes("new FormData("));
});
test("voluntary SIAI comparison sharing keeps its filters and tracks source without leaking private state",()=>{
 const home=read("components/SiaiRankingHome.tsx");
 assert.match(home,/siaiSharePath\(\{query,category,task,payment,evidence,sort,compareIds\},lang\)/);
 assert.match(home,/outgoing\.searchParams\.set\("utm_source","siai_share"\)/);
 assert.match(home,/outgoing\.searchParams\.set\("utm_campaign","siai_compare"\)/);
});
