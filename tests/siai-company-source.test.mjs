import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import test from "node:test";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("publisher identity, listing, years and source links survive UI redesign",()=>{
 const catalog=read("app/siai/catalog-data.ts"),home=read("components/SiaiRankingHome.tsx");
 const preview=read("app/siai/candidate-public.ts");
 for(const token of [
  "company:publisher.name","legal:publisher.legalEntity","creator:publisher.creator",
  "listing:publisher.listingState","year:publisher.year","companySource:publisher.companySource",
  "listingSource:publisher.ipoFilingSource||publisher.listingSource","yearSource:publisher.yearSource",
  "checkedAt:fact?marketProductReviewedAt(id):null"
 ])assert(catalog.includes(token),"Catalog missing "+token);
 for(const token of [
  "p.creator.role","p.creator.source","listingFor(p)","p.listingSource",
  "p.yearSource","p.checkedAt","p.companySource","visibleRows.map",
  "setPanelHeight","siai-home-table-flow","siai-home-table-bounded"
 ])assert(home.includes(token),"UI missing "+token);
 assert.match(catalog,/curated\.length!==MARKET_API_PRODUCTS\.length/);
 assert.match(catalog,/curatedIds\.size!==curated\.length/);
 assert.match(catalog,/getSiaiSourcePreviewRows\(\)\.filter\(r=>!curatedIds\.has\(r\.id\)\)/);
 assert.match(preview,/candidateProducts!==30/);
});
test("unreviewed 50 company intake records stay non-public",()=>{
 for(let i=1;i<=5;i++){
  const f=JSON.parse(read("lingxifield-ai-market/data/company-intake/batch-"+String(i).padStart(3,"0")+".json"));
  assert.equal(f.products.length,10,f.batch);
  assert.equal(f.visibleToPublic,false,f.batch);
  assert.equal(f.reviewState,"candidate",f.batch);
 }
});
