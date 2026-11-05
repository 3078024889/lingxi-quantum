import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {auditOfficialObservations,OFFICIAL_REQUIRED_FIELDS} from "../lingxifield-ai-market/lib/market-official-observations.mjs";
const data=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const batch=data("lingxifield-ai-market/data/company-intake/batch-006.json");
const evidence=data("lingxifield-ai-market/data/company-intake/batch-006-official-observations.json");
test("10 video suppliers: all 70 official facts have provenance or explicit missing state",()=>{
 const result=auditOfficialObservations(evidence,batch,{today:"2026-11-05"});
 assert.deepEqual(result.issues,[]);
 assert.equal(result.products,10);
 assert.equal(result.observed,34);
 assert.equal(result.missing,36);
 assert.equal(result.conflict,0);
 assert.equal(result.readyForEditorialReview,true);
 assert.equal(result.readyForPublication,false);
 for(const p of evidence.products){
  assert.equal(p.reviewStatus,"unapproved");
  assert.deepEqual(Object.keys(p.facts).sort(),[...OFFICIAL_REQUIRED_FIELDS].sort());
  assert.equal(batch.products.find(x=>x.id===p.id).publishApproved,false);
  for(const [key,value]of Object.entries(p.facts)){
   if(value.status!=="observed")continue;
   assert.match(value.source,/^https:\/\//);
   assert.equal(value.checkedAt,"2026-11-05");
   if(key==="price"&&p.id==="veed")assert.match(value.text,/API/);
  }
 }
});
test("video-to-short clipping never automatically proves text-to-video, and API cost differs from membership",()=>{
 const opus=evidence.products.find(x=>x.id==="opusclip");
 assert.match(opus.facts.models.text,/不等于从纯文本/);
 const veed=evidence.products.find(x=>x.id==="veed");
 assert.match(veed.facts.price.text,/不等于 VEED 网页订阅/);
 const ltx=evidence.products.find(x=>x.id==="ltx-studio");
 assert.equal(ltx.facts.commercial.status,"observed");
 assert.match(ltx.facts.commercial.text,/个人使用/);
});
