import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { auditLifeArchetypeCoverage, BASE_DENDRITE_PRODUCT_IDS } from "../lib/mini/life-archetype-gate.ts";

const now=Date.parse("2026-08-30T12:00:00.000Z");
const report=(productId,days=0,evidence=24)=>({productId,completedAt:new Date(now-days*86400000).toISOString(),result:{evidenceLeaves:Array.from({length:evidence},(_,index)=>({id:`${productId}-${index}`}))}});
const expectBlocked=(label,fn,pattern)=>{let error;try{fn();}catch(caught){error=caught;}assert(error instanceof Error,`${label} should block`);assert.match(error.message,pattern,label);};

const caseA=BASE_DENDRITE_PRODUCT_IDS.map((id,index)=>report(id,index));
const auditA=auditLifeArchetypeCoverage(caseA,true,now);
assert.equal(auditA.uniqueStreams,8);
assert.equal(auditA.sourceReports,8);
assert.equal(auditA.evidenceLeaves,192);

expectBlocked("mixed subject names",()=>auditLifeArchetypeCoverage(caseA,false,now),/identity/);

const caseC=[...caseA.filter((item)=>item.productId!=="relationship-resonance"),report("relationship-resonance",1),report("relationship-resonance",2),report("relationship-resonance",3)];
const auditC=auditLifeArchetypeCoverage(caseC,true,now);
assert.equal(auditC.uniqueStreams,8);
assert.equal(auditC.sourceReports,10);
assert.equal(auditC.streamEvidence.find((item)=>item.productId==="relationship-resonance")?.reportCount,3);
assert.equal(auditC.streamEvidence.find((item)=>item.productId==="relationship-resonance")?.evidenceCount,72);

const caseD=caseA.map((item)=>item.productId==="qian-reading"?report(item.productId,0,0):item);
expectBlocked("legacy source without leaves",()=>auditLifeArchetypeCoverage(caseD,true,now),/evidence leaves/);
expectBlocked("outside 365 days",()=>auditLifeArchetypeCoverage(caseA.map((item,index)=>index===0?report(item.productId,366):item),true,now),/365 days/);

const root=process.cwd();
const engine=fs.readFileSync(path.join(root,"lib","mini","dendrite-engine.ts"),"utf8");
const reportUi=fs.readFileSync(path.join(root,"app","mini-report","MiniLifeArchetypeReport.tsx"),"utf8");
const readingSpecSource=engine.slice(engine.indexOf("const ARCHETYPE_READING_SPECS"),engine.indexOf("] as const;",engine.indexOf("const ARCHETYPE_READING_SPECS")));
assert.equal((readingSpecSource.match(/^  \["/gm)??[]).length,24,"V6 must define 24 reading questions");
const bodySource=engine.slice(engine.indexOf("const ARCHETYPE_BODY_FORMS"),engine.indexOf("];",engine.indexOf("const ARCHETYPE_BODY_FORMS")));
const verificationSource=engine.slice(engine.indexOf("const ARCHETYPE_VERIFICATION_PROMPTS"),engine.indexOf("] as const;",engine.indexOf("const ARCHETYPE_VERIFICATION_PROMPTS")));
assert.equal((bodySource.match(/^  \(a,b,c\)=>/gm)??[]).length,24,"every reading needs its own sentence architecture");
assert.equal((verificationSource.match(/^  "/gm)??[]).length,24,"every reading needs its own reality verification entrance");
assert.doesNotMatch(`${bodySource}\n${verificationSource}`,/这说明|这意味着|可能表明|不是.{0,40}而是|从某种角度|你需要意识到/);
assert.match(engine,/archetypeReadings/);
assert.match(engine,/readingCount<3/);
assert.doesNotMatch(reportUi,/result\.dominant|topNames|primary=result/);
assert.match(reportUi,/readings\.length!==24/);

console.log("PASS Life Archetype V6: identity, 365-day, 8-stream, relationship-density, legacy-evidence and 24-reading audits");
