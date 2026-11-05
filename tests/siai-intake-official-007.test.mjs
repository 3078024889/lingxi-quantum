import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
import {auditOfficialObservations,OFFICIAL_REQUIRED_FIELDS} from "../lingxifield-ai-market/lib/market-official-observations.mjs";
const data=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const batch=data("lingxifield-ai-market/data/company-intake/batch-007.json");
const pack=data("lingxifield-ai-market/data/company-intake/batch-007-official-observations.json");
test("10 voice and music suppliers: 41 sourced observations, 29 explicit unknowns, still private",()=>{
 const audit=auditOfficialObservations(pack,batch,{today:"2026-11-05"});
 assert.deepEqual(audit.issues,[]);
 assert.equal(audit.products,10);assert.equal(audit.observed,41);assert.equal(audit.missing,29);
 assert.equal(audit.conflict,0);assert.equal(audit.readyForPublication,false);
 for(const row of pack.products){
  assert.equal(row.reviewStatus,"unapproved");
  assert.deepEqual(Object.keys(row.facts).sort(),[...OFFICIAL_REQUIRED_FIELDS].sort());
  assert.equal(batch.products.find(p=>p.id===row.id).publishApproved,false);
 }
});
test("retired voice services cannot be misrepresented as downloadable products",()=>{
 const ids=new Set(pack.products.map(p=>p.id));
 assert(ids.has("rime-ai"));assert(!ids.has("resemble-ai"));
 const udio=pack.products.find(p=>p.id==="udio");
 assert.match(udio.facts.models.text,/下载已关闭/);
 const aiva=pack.products.find(p=>p.id==="aiva");
 assert.match(aiva.facts.commercial.text,/免费版不能变现/);
 const mubert=pack.products.find(p=>p.id==="mubert");
 assert.match(mubert.facts.commercial.text,/原始音乐/);
});
test("API minute, hour and character rates remain independent units, with pricing source",()=>{
 for(const id of ["rime-ai","deepgram","assemblyai","cartesia"]){
  const p=pack.products.find(p=>p.id===id);
  assert.equal(p.facts.price.status,"observed");
  assert.match(p.facts.price.source,/^https:\/\//);
 }
 assert.match(pack.products.find(p=>p.id==="rime-ai").facts.price.text,/1000字符/);
 assert.match(pack.products.find(p=>p.id==="assemblyai").facts.price.text,/小时/);
 assert.match(pack.products.find(p=>p.id==="cartesia").facts.price.text,/积分/);
});
