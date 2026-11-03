import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {auditGlobalIntake} from "../lingxifield-ai-market/lib/market-global-intake.mjs";
import {auditOfficialObservations} from "../lingxifield-ai-market/lib/market-official-observations.mjs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="lingxifield-ai-market/data/company-intake/";
const batches=[4,5].map(i=>load(root+"batch-00"+i+".json"));
const obs=[4,5].map(i=>load(root+"batch-00"+i+"-official-observations.json"));
test("Batch 004/005 = 20 unapproved products from 19 publisher groups, no duplication",()=>{
 const p=batches.flatMap(b=>b.products);
 assert.equal(p.length,20);assert.equal(new Set(p.map(x=>x.id)).size,20);
 assert.equal(new Set(p.map(x=>x.publisherGroupId)).size,19);
 for(let i=0;i<2;i++){assert.equal(batches[i].products.length,10);assert.equal(obs[i].products.length,10);assert.equal(batches[i].batch,obs[i].batch);
  assert.equal(batches[i].visibleToPublic,false);assert.equal(batches[i].intakePaused,true);
  for(const x of batches[i].products){assert.equal(x.reviewed,false);assert.equal(x.publishApproved,false);}
 }
});
test("Use the same strict existing official-source auditor, not a weaker custom test",()=>{
 for(let i=0;i<2;i++){
 const result=auditOfficialObservations(obs[i],batches[i],{today:"2026-11-03"});
 assert.deepEqual(result.issues,[]);
 assert.equal(result.readyForEditorialReview,true);
 assert.equal(result.readyForPublication,false);
 }
 const overall=auditGlobalIntake(batches,obs,[],{today:"2026-11-03"});
 assert.deepEqual(overall.issues,[]);
 assert.equal(overall.stagedProducts,20);
 assert.equal(overall.allBatchesSafe,true);
 assert.equal(overall.readyForPublicRelease,false);
});
test("Keep 20-source observations unverified, with explicit missing reasons",()=>{
 let observed=0,missing=0;
 for(const row of obs.flatMap(x=>x.products)){assert.equal(row.reviewStatus,"unapproved");
  for(const [key,fact] of Object.entries(row.facts)){
   if(fact.status==="missing"){missing++;assert(fact.reason.length>=12);assert.equal(fact.source,undefined);assert.equal(fact.text,undefined);}
   else{observed++;assert.equal(fact.status,"observed");assert(fact.source.startsWith("https://"));assert.equal(fact.checkedAt,"2026-11-03");}
  }
  assert.equal(row.facts.commercial.status,"missing");
 }
 assert.equal(observed+missing,140);
 assert(observed>=62);
 const google=batches.flatMap(x=>x.products).find(x=>x.id==="google-gemini-agent-platform");
 assert(google.aliases.includes("Vertex AI"));
 const apple=obs.flatMap(x=>x.products).find(x=>x.id==="apple-intelligence");
 assert.match(apple.facts.regions.text,/中国大陆/);
});
