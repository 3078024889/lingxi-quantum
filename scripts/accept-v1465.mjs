import fs from "node:fs";
const r=p=>fs.readFileSync(p,"utf8");
const failures=[];
const a=(v,m)=>{console.log(`${v?"PASS":"FAIL"} ${m}`);if(!v)failures.push(m)};

a(r("lib/sasi/video-pricing.ts").includes("Math.ceil(amountFen/2)"),"USD task price is half RMB numeric");
a(r("app/api/sasi/quote/route.ts").includes("amountUsd"),"quote returns CNY and USD");
a(r("app/api/sasi/quote/route.ts").includes("resolveSasiSkill"),"quote validates selected Skill");
a(r("app/api/sasi/jobs/route.ts").includes("applySasiSkill"),"job applies selected Skill");
a(r("app/api/sasi/jobs/route.ts").includes("approved.skillId"),"signed quote binds Skill");
a(r("app/api/sasi/skills/route.ts").includes("256*1024"),"user Skill upload capped");
a(r("components/SasiSkillsPanel.tsx").includes("上传自己的 Skill"),"Skills page supports user upload");
a(!r("app/sasi/SasiWorkspace.tsx").includes("HOW SASI SKILLS WORK")&&r("app/sasi/SasiWorkspace.tsx").includes("SasiSkillsPanel"),"old engineering Skills catalog removed");
a(!r("components/SasiDramaLaunch.tsx").includes("productionReady"),"drama landing has no readiness engineering UI");
a(r("app/sasi/SasiProductionPanels.tsx").includes("amountUsd:string"),"production quote model contains USD");
a(r("app/sasi/SasiProductionPanels.tsx").includes("serverQuote.amountUsd"),"production quote UI shows USD");
a(r("app/sasi/SasiComposer.tsx").includes("真正开始生成前"),"composer explains outcome before cost");

const publicFiles=[
  "components/SasiDramaLaunch.tsx",
  "app/sasi/SasiWorkspace.tsx",
  "app/sasi/SasiProductionPanels.tsx",
  "components/SasiCommandCenter.tsx",
  "app/sasi/SasiComposer.tsx"
];
const publicText=publicFiles.map(r).join("\n");
for(const phrase of [
  "HOW SASI SKILLS WORK",
  "制作内核已通过三重门控",
  "制作保护仍在生效",
  "安全门控中",
  "Production kernel passed",
  "server-owned records",
  "供应商成本记录",
  "Unverified",
  "生产执行总开关",
  "完成归属校验与安全索引"
]){
  a(!publicText.includes(phrase),`public SASI copy excludes ${phrase}`);
}
a(r("app/sasi/SasiProductionPanels.tsx").includes("as 5 | 10 | 15"),"duration selector type updated to 5/10/15");

if(failures.length){
  console.error(`V14.65.4_ACCEPT_FAILURES=${failures.length}`);
  failures.forEach((x,i)=>console.error(`${i+1}. ${x}`));
  process.exit(1);
}
console.log("V14.65.6 SKILLS + PRICING + COPY5=PASS");
