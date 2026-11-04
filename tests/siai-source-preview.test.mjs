import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const root=new URL("../",import.meta.url);
const read=path=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
const batches=[1,2,3].map(i=>read("lingxifield-ai-market/data/company-intake/batch-00"+i+".json"));
const obs=[1,2,3].map(i=>read("lingxifield-ai-market/data/siai-source-preview-20261103/batch-00"+i+"-official-observations.json"));
const src=readFileSync(new URL("app/siai/candidate-public.ts",root),"utf8");
const page=readFileSync(new URL("app/siai/page.tsx",root),"utf8");
const catalog=readFileSync(new URL("app/siai/catalog-data.ts",root),"utf8");
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
 assert.deepEqual({observed,missing,conflict},{observed:205,missing:5,conflict:0});
});
test("preview is joined to main SIAI UI, never published as a verified SEO product page",()=>{
 assert.match(catalog,/getSiaiSourcePreviewRows/);
 assert.match(page,/getSiaiDirectoryRows/);
 assert.match(src,/recordStatus:"source_preview"/);
 assert(src.includes("year:history?.year||null"));
 assert(src.includes("yearSource:history?.yearSource||null"));
 assert.match(readFileSync(new URL("app/siai/candidate-company-evidence.ts",root),"utf8"),/"figma-make"/);
 assert(src.includes('region:regionSupplement?.localized.zh||text(region)'));
 assert.doesNotMatch(src,/并非逐国注册或支付验证/);
 assert(src.includes('regionSource:regionSupplement?.source||source(region)'));
 assert.match(src,/materializeCandidateCatalog/);
 assert.match(src,/verifiedPaymentRails/);
 assert.match(src,/https:\/\/www\.magnific\.com\/ai/);
 assert.match(src,/https:\/\/www\.canva\.com\/canva-ai\//);
 assert.match(src,/freepik-ai":\[\]/);
 assert.doesNotMatch(src,/publishApproved:true|verifiedRealUse:true|signedVendorSettlement:true/);
});

test("five added official region policies preserve older snapshot counts and are translated nine ways",()=>{
 const s=readFileSync(new URL("app/siai/official-region-supplements.ts",root),"utf8");
 for(const id of ["notion-ai","devin-desktop","freepik-ai","synthesia","scite"])assert(s.includes('"'+id+'":{'),id);
 for(const code of ["zh","en","ja","ko","fr","de","es","pt","ar"]){
  assert.equal(s.split("\n   "+code+":").length-1,5,code);
 }
 assert.equal((s.match(/checkedAt:"2026-11-04"/g)||[]).length,5);
 assert.match(src,/regionSupplement\?\.localized\.zh\|\|text\(region\)/);
 assert.match(src,/regionSource:regionSupplement\?\.source\|\|source\(region\)/);
 assert(!s.includes("不限地区"));
});
