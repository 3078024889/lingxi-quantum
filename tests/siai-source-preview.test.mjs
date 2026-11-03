import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const root=new URL("../",import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
const batches=[1,2,3].map(i=>read("lingxifield-ai-market/data/company-intake/batch-00"+i+".json"));
const obs=[1,2,3].map(i=>read("lingxifield-ai-market/data/siai-source-preview-20261103/batch-00"+i+"-official-observations.json"));
const src=readFileSync(new URL("app/siai/candidate-public.ts",root),"utf8");
const page=readFileSync(new URL("app/siai/page.tsx",root),"utf8");
test("30 unique staged IDs remain explicitly unapproved in source, no price/region inference",()=>{
 const ids=new Set(),groups=new Set();let observed=0,missing=0,conflict=0;
 for(let i=0;i<3;i++){
  assert.equal(batches[i].products.length,10);
  assert.equal(obs[i].products.length,10);
  const map=new Map(obs[i].products.map(x=>[x.id,x]));
  for(const p of batches[i].products){
   assert(!ids.has(p.id));ids.add(p.id);groups.add(p.publisherGroupId);
   assert.equal(p.reviewed,false);assert.equal(p.publishApproved,false);
   assert.equal(map.get(p.id)?.reviewStatus,"unapproved");
   const r=map.get(p.id);
   assert(new URL(p.website).protocol==="https:");
   for(const key of ["price","free","models","regions","commercial","payment","company"]){
    const f=r.facts[key];assert(f, p.id+":"+key);
    if(f.status==="observed"){
     observed++;assert(new URL(f.source).protocol==="https:");
     const host=new URL(f.source).hostname;
     assert(r.officialHosts.some(h=>host===h||host.endsWith("."+h)),p.id+" "+key+" untrusted origin");
     assert(f.checkedAt<="2026-11-03"&&f.checkedAt>="2026-01-01");
    } else if(f.status==="missing"){missing++;assert(!f.source);} else if(f.status==="conflict"){conflict++;} else assert.fail(f.status);
   }
  }
 }
 assert.equal(ids.size,30);assert.equal(groups.size,28);
 assert.deepEqual({observed,missing,conflict},{observed:204,missing:6,conflict:0});
});
test("preview is joined to main SIAI UI, never published as a verified SEO product page",()=>{
 assert.match(page,/getSiaiSourcePreviewRows/);
 assert.match(page,/source_preview/);
 assert.match(src,/recordStatus:"source_preview"/);
 assert.match(src,/year:null,yearSource:null/);
 assert.match(src,/并非逐国注册或支付验证/);
 assert.match(src,/materializeCandidateCatalog/);
 assert.match(src,/verifiedPaymentRails/);
 assert.match(src,/freepik-ai":\[\]/);
 assert.doesNotMatch(src,/publishApproved:true|verifiedRealUse:true|signedVendorSettlement:true/);
});
