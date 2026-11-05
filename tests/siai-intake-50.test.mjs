import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const cohort=n=>JSON.parse(read("lingxifield-ai-market/data/company-intake/batch-"+String(n).padStart(3,"0")+".json"));
const base=[1,2,3,4,5].flatMap(n=>cohort(n).products);
const additions=[6,7,8,9,10].flatMap(n=>cohort(n).products);
const curated=JSON.parse(read("lingxifield-ai-market/data/catalog.json"));
test("exactly 50 NEW distinct official-entry research candidates in five batches",()=>{
 assert.equal(additions.length,50);assert.equal(new Set(additions.map(p=>p.id)).size,50);
 const previous=new Set([...base,...curated].map(p=>p.id));
 for(const row of additions){
  assert(!previous.has(row.id),"not new: "+row.id);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id));
  assert(row.name&&row.company&&row.category&&row.tasks.length>=2);
  for(const key of ["website","evidenceUrl","discoverySource"]){
   const u=new URL(row[key]);assert.equal(u.protocol,"https:");assert(!u.username&&!u.password);
  }
  assert.equal(row.reviewed,false);assert.equal(row.publishApproved,false);
  assert.deepEqual(row.verifiedFacts,{});
  assert(!Object.keys(row).some(k=>/paymentSource|commercialSource|priceSource|payPal|checkOut/i.test(k)));
 }
 for(let i=6;i<=10;i++){
  const batch=cohort(i);assert.equal(batch.products.length,10);assert.equal(batch.visibleToPublic,false);assert.equal(batch.intakePaused,true);
  assert.equal(batch.reviewState,"candidate");
 }
});
test("unreviewed candidates cannot inflate public 62 platform counts or mislabel paid offers",()=>{
 const source=read("app/siai/catalog-data.ts");
 assert.match(source,/curated\.length!==32\|\|rows\.length!==62/);
 assert(!/batch-00[6-9]|batch-010/.test(source));
 const claim=read("app/siai/candidate-public.ts");
 assert(!/batch-00[6-9]|batch-010/.test(claim));
 const dashboard=read("app/account/siai-review/page.tsx");
 for(const n of [6,7,8,9,10])assert(dashboard.includes("batch-"+String(n).padStart(3,"0")+".json"));
});
test("vendor intake stays private and only an existing verified money administrator may review",()=>{
 const src=read("app/api/account/siai-review/route.ts"),page=read("app/account/siai-review/page.tsx");
 assert(src.includes("moneyAdministrator()"));
 assert(src.includes("isSameOriginMutation(req)"));
 assert(src.includes("createAdminClient()"));
 assert(src.includes("identityVerifiedByHuman!==true"));
 assert(src.includes("published:false,ownershipGranted:false"));
 assert(src.includes("rate_limit_check"));
 assert(src.includes("Cache-Control"));
 assert(page.includes('robots:{index:false,follow:false}'));
 assert(page.includes("await moneyAdministrator()"));
});
