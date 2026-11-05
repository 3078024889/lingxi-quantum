import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";

const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const batch=(n)=>JSON.parse(read("lingxifield-ai-market/data/company-intake/batch-"+String(n).padStart(3,"0")+".json"));
const observation=(n)=>JSON.parse(read("lingxifield-ai-market/data/company-intake/batch-"+String(n).padStart(3,"0")+"-official-observations.json"));
const firstFive=Array.from({length:5},(_,i)=>batch(i+1));
const nextFive=Array.from({length:5},(_,i)=>batch(i+6));
const all=[...firstFive,...nextFive].flatMap(b=>b.products);
const newRows=nextFive.flatMap(b=>b.products);
const curated=JSON.parse(read("lingxifield-ai-market/data/catalog.json"));
const seven=["price","free","models","regions","commercial","payment","company"];
function secureUrl(s){
 const u=new URL(s);
 assert.equal(u.protocol,"https:");
 assert.equal(u.username,"");
 assert.equal(u.password,"");
 assert.equal(u.port,"");
 assert(!/^(localhost|127(?:\.\d+){3}|\[?::1\]?)$/i.test(u.hostname));
}
test("50 distinct new candidate PRODUCT IDs, none in previous 50 or the 32 curated rows",()=>{
 assert.equal(newRows.length,50);
 assert.equal(all.length,100);
 const previous=new Set([...firstFive.flatMap(b=>b.products),...curated].map(p=>p.id));
 assert.equal(new Set(all.map(p=>p.id)).size,100,"duplicate in any candidate cohort");
 assert.equal(new Set(newRows.map(p=>p.publisherGroupId)).size>0,true);
 assert.equal(new Set(all.map(p=>p.publisherGroupId)).size,88,"publisher groups are not the same as independent companies");
 for(const row of newRows){
  assert(!previous.has(row.id),"candidate already public or in earlier intake: "+row.id);
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id));
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.publisherGroupId));
  assert(row.name&&row.company&&row.category&&row.tasks.length>=2);
  for(const key of ["website","evidenceUrl","discoverySource"])secureUrl(row[key]);
  assert.equal(row.reviewed,false);
  assert.equal(row.publishApproved,false);
  assert.deepEqual(row.verifiedFacts,{});
 }
});
test("new batches are intake-paused, never published or silently promoted",()=>{
 for(let n=6;n<=10;n++){
  const b=batch(n);assert.equal(b.products.length,10);
  assert.equal(b.visibleToPublic,false,"public leakage from cohort "+n);
  assert.equal(b.intakePaused,true);
  assert.equal(b.reviewState,"candidate");
  assert(b.products.every(p=>p.publishApproved===false&&p.reviewed===false));
 }
 const publicSource=read("app/siai/catalog-data.ts");
 for(let n=6;n<=10;n++)assert(!publicSource.includes("batch-"+String(n).padStart(3,"0")),"candidate imported by public ranking");
 const publicApi=read("app/api/public/siai-widget/route.ts");
 assert(!publicApi.includes("company-intake"),"private intake imported by public widget");
});
test("B006-B008 evidence packs have seven status-typed scoped facts per candidate",()=>{
 const candidateIds=new Set(newRows.map(x=>x.id));
 const totals=[];
 for(let n=6;n<=8;n++){
  const pack=observation(n);
  assert.equal(pack.reviewStatus??"unapproved","unapproved");
  assert.equal(pack.products.length,10);
  let observed=0,missing=0;
  for(const item of pack.products){
   assert(candidateIds.has(item.id),"orphan official observation "+item.id);
   assert.deepEqual(Object.keys(item.facts).sort(),[...seven].sort());
   for(const fact of Object.values(item.facts)){
    assert(["observed","missing"].includes(fact.status));
    if(fact.status==="observed"){
     observed++;
     assert(typeof fact.text==="string"&&fact.text.trim().length>6);
     secureUrl(fact.source);
     assert(/^\d{4}-\d{2}-\d{2}$/.test(fact.checkedAt));
     assert(fact.scope&&typeof fact.scope==="string");
    }else{
     missing++;
     assert(typeof fact.reason==="string"&&fact.reason.length>10);
     assert(!("text" in fact),"missing fact must not carry a fabricated claim");
    }
   }
  }
  assert.equal(observed+missing,70);
  totals.push({observed,missing});
 }
 assert.deepEqual(totals,[{observed:34,missing:36},{observed:41,missing:29},{observed:31,missing:39}]);
});
