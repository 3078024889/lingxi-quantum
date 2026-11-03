import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {auditOfficialObservations} from '../lib/market-official-observations.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const get=id=>JSON.parse(read('data/company-intake/batch-'+id+'-official-observations.json'));
const cohort=id=>JSON.parse(read('data/company-intake/batch-'+id+'.json'));
const obs=['001','002','003'].map(get),all=obs.flatMap(p=>p.products);
const langs=['zh','en','ja','ko','fr','de','es','pt','ar'];
const find=id=>all.find(p=>p.id===id);

test('official Tabnine acquisition date and Mistral Vibe plan prices are primary-source facts, not inferred investor labels',()=>{
 const t=find('tabnine'),m=find('mistral-le-chat');
 assert.equal(t.facts.company.status,'observed');
 assert.equal(t.facts.company.source,'https://www.tabnine.com/blog/category/product-news/');
 assert.equal(t.facts.company.checkedAt,'2026-11-03');
 assert.match(t.facts.company.text,/2026 年 7 月 30 日/);
 assert.match(t.facts.company.text,/Tricentis/);
 assert.match(t.facts.company.text,/不代表 Tabnine 单独上市/);
 assert.equal(t.facts.payment.status,'missing','No checkout rail without explicit merchant proof');
 assert.equal(m.facts.price.status,'observed');
 assert.equal(m.facts.price.source,'https://mistral.ai/news/vibe-agent/');
 assert.equal(m.facts.price.checkedAt,'2026-11-03');
 for(const term of ['14.99','24.99','Free','Pro','Team','Enterprise','API'])assert.ok(m.facts.price.text.includes(term),term);
 assert.ok(m.facts.price.additionalEvidence.some(x=>x.source==='https://docs.mistral.ai/admin/billing-usage/subscriptions'));
});
test('all 30 candidate descriptions still pass official source pinning, keep six gaps and never publish',()=>{
 const observed=all.flatMap(p=>Object.values(p.facts).filter(f=>f.status==='observed'));
 const missing=all.flatMap(p=>Object.values(p.facts).filter(f=>f.status==='missing'));
 assert.equal(all.length,30);
 assert.equal(observed.length,204);
 assert.equal(missing.length,6);
 assert.ok(all.every(x=>x.reviewStatus==='unapproved'));
 for(let i=0;i<3;i++){
  const report=auditOfficialObservations(obs[i],cohort(['001','002','003'][i]),{today:'2026-11-03'});
  assert.deepEqual(report.issues,[]);
  assert.equal(report.readyForPublication,false);
 }
});
test('nine locale home labels answer the user, never call the product prototype, demo or disconnected live feed',()=>{
 const src=read('lib/v2.ts');
 for(const lang of langs){
  const line=src.split('\n').find(x=>x.startsWith(lang+':{'));
  assert.ok(line,lang);
  for(const key of ['localeBanner','verifiedNotice','questionAnswer','answerDisclaimer','demoScores','paymentSelection']){
   const match=line.match(new RegExp(key+":'([^']+)'"));
   assert.ok(match,lang+':'+key);
   assert.ok(match[1].length>=5,lang+':'+key);
   assert.doesNotMatch(match[1],/prototype|demo scores|score[s]? fictif|data not connected|payment integration pending|実データ未接続|試作|시제품|미연결|原型|演示|待核验|دون اتصال/i,lang+':'+key);
  }
 }
});
test('comparison cells show dated publisher facts first, with matching HTTPS source links',()=>{
 const app=read('app/market-workbench.tsx');
 for(const line of [
  'researchedFact(p.id)?.price||p.guide?.cost',
  'researchedFact(p.id)?.free||p.guide?.free',
  'researchedFact(p.id)?.models||p.guide?.reasoning',
  'proof:p=>researchedFact(p.id)?.priceSource',
  'proof:p=>researchedFact(p.id)?.freeSource',
  'proof:(p,region)=>paymentFactsFor(p.id,region).source',
  'className="marketCompareProof"',
  'href={field.proof(platform,region)!}'
 ])assert.ok(app.includes(line),line);
 assert.match(app,/本地区结账以实际页面为准/);
 assert.doesNotMatch(app,/查看官网套餐/);
 const css=read('app/globals.css');
 assert.match(css,/\.marketCompareProof\{/);
 assert.match(css,/\.marketCompareProof\{[^}]*font-size:14px/);
});
test('standalone matrix preserves the 32 curated vendor facts ahead of old seed text and marks regional checkout scopes',()=>{
 const app=read('app/market-matrix-row.tsx');
 for(const field of ['rawCost=research?.price','rawFree=research?.free','rawModels=research?.models','rawCommercial=research?.commercial'])
  assert.ok(app.includes(field),field);
 assert.ok(app.includes("paymentFact.scope==='unverified_region'"));
 assert.match(app,/本地区结账需确认/);
 const q=read('app/market-verified-answers.tsx');
 assert.match(q,/localizedCatalogFact\(platform.id,language,'price',f\?\.price\|\|platform.price\)/);
 assert.match(q,/localizedCatalogFact\(platform.id,language,'free',f\?\.free\|\|platform.free\)/);
 assert.match(q,/source:pay.source\|\|f\?\.paymentSource/);
 const fact=read('lib/market-researched-facts.ts');
 const a=fact.indexOf('={',fact.indexOf('RESEARCHED_FACTS:'))+1;
 const b=fact.indexOf('};\nexport const MARKET_RESEARCH_CHECKED_AT',a)+1;
 const records=JSON.parse(fact.slice(a,b));
 assert.equal(Object.keys(records).length,32);
 for(const [id,f] of Object.entries(records)){
  for(const key of ['priceSource','freeSource','regionSource','modelsSource','commercialSource','paymentSource'])
   assert.ok(f[key]?.startsWith('https://'),id+':'+key);
 }
});
