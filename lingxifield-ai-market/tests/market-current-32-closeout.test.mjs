import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {lumaSubscription,lumaFree,lumaModels,LUMA_PLANS} from '../lib/market-luma-pricing.ts';
const file=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8');

test('Luma official prices and model sources are shared by every language',()=>{
 assert.equal(LUMA_PLANS.source,'https://lumalabs.ai/pricing');
 assert.equal(LUMA_PLANS.modelSource,'https://lumalabs.ai/llm-info');
 assert.deepEqual(LUMA_PLANS.plans.map(x=>x.monthly),[30,90,300]);
 assert.deepEqual(LUMA_PLANS.plans.map(x=>x.annualTotal),[300,900,3000]);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  const price=lumaSubscription(lang),free=lumaFree(lang),models=lumaModels(lang);
  for(const plan of ['Plus','Pro','Ultra'])assert.ok(price.includes(plan),lang+' '+plan);
  for(const monthly of ['$30/','$90/','$300/'])assert.ok(price.includes(monthly),lang+' '+monthly);
  assert.ok(price.includes('3000'),lang);
  assert.doesNotMatch(price,/49\.99|Dream Machine/i,lang+' uses obsolete prices');
  assert.match(models,/Ray3\.2.*UNI-1\.1/);
  assert.ok(free.length>=15);
 }
 const localized=file('lib/market-fact-locale.ts');
 assert.match(localized,/if\(id==='luma'\)return scope==='price'\?lumaSubscription\(language\)/);
 assert.doesNotMatch(localized,/49\.99/);
 const facts=file('lib/market-researched-facts.ts');
 assert.match(facts,/"priceSource": "https:\/\/lumalabs\.ai\/pricing"/);
});
test('curated published tools and imported legacy catalogs have separate named population counts',()=>{
 const c=file('app/api/v1/catalog/readiness/route.ts');
 const cov=file('app/api/v1/coverage/route.ts');
 assert.match(c,/scope:'imported_source_catalog'/);
 assert.match(c,/curatedMarket:\{products:searchPlatforms\(\{limit:1\}\)\.total/);
 assert.match(cov,/scope:'legacy_market_metrics'/);
 assert.match(cov,/collections:\{curatedTools:searchPlatforms\(\{limit:1\}\)\.total/);
 assert.match(cov,/importedSourceCatalog:entries\.length/);
 assert.match(cov,/publisherEvidence:/);
});
test('model limits that are absent/zero return null instead of pretending context length is zero tokens',()=>{
 const s=file('app/api/v1/models/route.ts');
 assert.match(s,/x\.contextLimit>0\?x\.contextLimit:null/);
 assert.match(s,/x\.outputLimit>0\?x\.outputLimit:null/);
 assert.match(s,/m\.limit!\.context!>0/);
 assert.match(s,/m\.limit!\.output!>0/);
});
test('product detail footer displays useful prices and publisher facts, not internal ranking assertions',()=>{
 const s=file('app/[lang]/platform/[id]/page.tsx');
 assert.doesNotMatch(s,/未核实的能力不参与排行|Unverified claims do not become rankings/);
 assert.match(s,/点击官方资料查看详情/);
 assert.match(s,/See the publisher source for details/);
});
test('new ten-publisher intake does not affect current public catalog',()=>{
 const batch=JSON.parse(file('data/company-intake/batch-001.json'));
 assert.equal(batch.visibleToPublic,false);
 assert.equal(batch.products.length,10);
 assert.ok(batch.products.every(x=>x.publishApproved===false));
 const s=file('lib/platform-repository.ts');
 assert.doesNotMatch(s,/company-intake\/batch/);
});
