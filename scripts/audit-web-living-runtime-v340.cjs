const fs=require("node:fs");
const path=require("node:path");
const Module=require("node:module");
const ts=require("typescript");

const root=path.resolve(__dirname,"..");
const originalResolve=Module._resolveFilename;
Module._resolveFilename=function(request,parent,isMain,options){
  if(request.startsWith("@/"))request=path.join(root,request.slice(2));
  return originalResolve.call(this,request,parent,isMain,options);
};
require.extensions[".ts"]=function(module,filename){
  const source=fs.readFileSync(filename,"utf8");
  const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText;
  module._compile(output,filename);
};

const {composeDendriticChapter}=require(path.join(root,"lib/dendritic-engine.ts"));
const {compileHybridLivingSections}=require(path.join(root,"lib/report-v340/web-adapter.ts"));
const {planReport}=require(path.join(root,"lib/hybrid-report.ts"));

const products=["life-map","relationship-deep","relationship-business","relationship-other","resilience","romance","wealth","daily-tide","life-mirror","life-oracle"];
const outputs=products.map((product,index)=>composeDendriticChapter({chapter:String(index+1).padStart(2,"0"),livingProduct:product,slots:{judgment:`${product}主力先发，现实承载随后决定其成败。`,evidence:"主轴八十二，承载四十七。",mechanism:"得位时能把判断化为可见结果。",scenario:"工作选择中先定方向；关系承诺中再核边界。",shadow:"若只用主力，速度会把复核与恢复成本留到事后。",counterevidence:"若最近三次同类事件均无此顺序，此断不立。",action:"记录事实、动作与结果，十四日后复核。"},activated:[],evidence:[{key:"primary",label:"主轴",value:82,source:"calculation"},{key:"support",label:"承载",value:47,source:"fact"}]}).text);

if(new Set(outputs).size!==products.length)throw new Error("ten product outputs converged");
for(const output of outputs){
  for(const token of ["现实复核","其力得位","其过在"]){if(!output.includes(token))throw new Error(`missing ${token}`);}
  for(const banned of ["这说明","这意味着","综合来看","结构：","机制："]){if(output.includes(banned))throw new Error(`banned language: ${banned}`);}
}

for(const product of ["resilience","wealth"]){
  const dir=path.join(root,"knowledge",product);
  const lib={chapters:require(path.join(dir,"chapters.json")).chapters,nodes:require(path.join(dir,"nodes.json")).nodes,combos:require(path.join(dir,"combos.json")).combos,states:require(path.join(dir,"states.json")).nodes,tails:require(path.join(dir,"tails.json")).tails};
  const scores=product==="wealth"?{insight:78,build:64,connect:51,express:37,risk:43}:{stressRecovery:78,adaptability:64,crisisRebound:51,persistence:37,emotionalStability:43};
  const plan=planReport(lib,scores,"v340-runtime-audit",null);
  const sections=compileHybridLivingSections({product,library:lib,scores,chapters:plan.chapters});
  if(sections.length!==11||sections.some(section=>!section.includes("现实复核")))throw new Error(`${product} hybrid V340 runtime failed`);
}

const vector={freedomNeed:78,stabilityNeed:43,creativity:72,discipline:51,riskTolerance:66,emotionalDepth:84,introspection:69,socialDrive:57,ambition:63,adaptability:74};
const {generateStaticLifeMapReport}=require(path.join(root,"lib/lifemap-knowledge.ts"));
const {generateStaticQianReport}=require(path.join(root,"lib/qian-knowledge.ts"));
const {generateStaticRomanceReport}=require(path.join(root,"lib/romance-knowledge.ts"));
const {generateStaticLifeMirrorReport}=require(path.join(root,"lib/life-mirror-knowledge.ts"));
const {generateStaticDailyTideReport}=require(path.join(root,"lib/daily-tide-knowledge.ts"));
const {generateStaticRelationshipReport}=require(path.join(root,"lib/knowledge-loader.ts"));
const {calculateRomance}=require(path.join(root,"lib/romance-calc.ts"));
const {LIFE_SIGNS}=require(path.join(root,"lib/qian-data.ts"));
const {TAROT_MAJOR_ARCANA}=require(path.join(root,"lib/tarot-data.ts"));
const transitApi=require(path.join(root,"lib/daily-transit.ts"));
const fixedDate=new Date("2026-09-01T12:00:00.000Z");
const transit=transitApi.computeTodayTransit(fixedDate);
const reports=[
  ["life-map",generateStaticLifeMapReport({facts:{sunSignZh:"处女座",dayMasterElement:"wood",wuXingCount:{wood:3,fire:1,earth:2,metal:1,water:2}},vector,submission:{id:"audit",name:"审计",energy_level:68,clarity_level:71,alignment_level:62},seed:"v340",lang:"zh"}).fullReport],
  ["life-oracle",generateStaticQianReport({signs:[LIFE_SIGNS[0],LIFE_SIGNS[1],LIFE_SIGNS[2]],vector,seed:"v340",lang:"zh"}).fullReport],
  ["romance",generateStaticRomanceReport({profile:calculateRomance(vector,{yearPillar:"甲子",monthPillar:"丙申",dayPillar:"戊午",hourPillar:"庚辰"}),seed:"v340",lang:"zh"}).fullReport],
  ["life-mirror",generateStaticLifeMirrorReport({cards:[TAROT_MAJOR_ARCANA[0],TAROT_MAJOR_ARCANA[1],TAROT_MAJOR_ARCANA[2]],vector,facts:{sunSignZh:"处女座"},seed:"v340",lang:"zh"}).fullReport],
  ["daily-tide",generateStaticDailyTideReport({lang:"zh",seed:"v340",generatedDate:"2026-09-01",sunSignZh:"处女座",sunSignEn:"Virgo",dayMasterElement:"wood",vector,transit,relation:transitApi.elementRelation("earth",transit.moonElement),retrogrades:transitApi.computeRetrogrades(fixedDate),ruler:transitApi.dayRuler(fixedDate),tide:transitApi.tideLevel(transit.moonPhaseAngle),nextTurningPoint:transitApi.nextTidePeak(fixedDate),trajectories:{day7:transitApi.tideTrajectory(7,fixedDate),day30:transitApi.tideTrajectory(30,fixedDate),day90:transitApi.tideTrajectory(90,fixedDate)}}).fullReport],
  ...["romantic","business","general"].map(relationshipType=>[`relationship-${relationshipType}`,generateStaticRelationshipReport({nameA:"甲",nameB:"乙",vectorA:vector,vectorB:{...vector,freedomNeed:42,stabilityNeed:79,emotionalDepth:55},resonance:{resonant:[],complementary:[],friction:[]},relationshipType,lang:"zh"})]),
];
for(const [label,report] of reports){
  const stamped=label.startsWith("relationship-")||report.includes("<!-- classical-editorial:V340.1-LIVING-WEB -->");
  if(!stamped||!report.includes("现实复核"))throw new Error(`${label} production generator did not publish V340 living text`);
}
if(new Set(reports.map(([,report])=>report)).size!==reports.length)throw new Error("production report paths converged");
if(process.env.V340_SAMPLE==="1")console.log("\n--- LIFE MAP SAMPLE ---\n"+reports[0][1].split(/===\d+===/)[1].slice(0,1800));

console.log("PASS runtime V340: production generators remain distinct; life map, three relationships, romance, daily tide, life mirror and life oracle publish living text; resilience and wealth each compile 11 evidence-grown sections.");
