import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SIAI_DETAIL_LOCALES,validSiaiDetailLang,siaiProductPath,hasIndexableFacts,
 siaiSeoEnabled,siaiDetailShouldIndex} from '../../lib/siai-seo-policy.ts';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
const full={price:'$19/month',free:'Free trial',region:'US',models:'Model X',
 priceSource:'https://vendor.com/pricing',freeSource:'https://vendor.com/free',
 regionSource:'https://vendor.com/regions',modelsSource:'https://vendor.com/models'};
test('strict official-source completeness; cannot index placeholders, partial or candidates',()=>{
 assert.equal(hasIndexableFacts(full),true);
 for(const field of ['priceSource','freeSource','regionSource','modelsSource','price','free','region','models']){
  assert.equal(hasIndexableFacts({...full,[field]:undefined}),false,field);
 }
 assert.equal(hasIndexableFacts({...full,price:'待核验'}),false);
 assert.equal(hasIndexableFacts({...full,freeSource:'http://unsecured.test/'}),false);
 assert.equal(hasIndexableFacts(null),false);
});
test('production index activation is explicit and previews fail closed',()=>{
 assert.equal(siaiSeoEnabled({VERCEL_ENV:'production',SIAI_MAIN_INDEX_READY:'1'}),true);
 assert.equal(siaiDetailShouldIndex(full,{VERCEL_ENV:'preview',SIAI_MAIN_INDEX_READY:'1'}),false);
 assert.equal(siaiDetailShouldIndex(full,{VERCEL_ENV:'production',SIAI_MAIN_INDEX_READY:'0'}),false);
 assert.equal(siaiDetailShouldIndex(full,{VERCEL_ENV:'production'}),false);
 assert.equal(siaiDetailShouldIndex({...full,priceSource:undefined},{VERCEL_ENV:'production',SIAI_MAIN_INDEX_READY:'1'}),false);
});
test('all nine locales generate stable canonical routes; reject unauthorized locale',()=>{
 assert.deepEqual(SIAI_DETAIL_LOCALES,['zh','en','ja','ko','fr','de','es','pt','ar']);
 for(const lang of SIAI_DETAIL_LOCALES){
  assert.ok(validSiaiDetailLang(lang));
  assert.equal(siaiProductPath(lang,'openai-python'),'/siai/'+lang+'/openai-python');
 }
 assert.equal(validSiaiDetailLang('xx'),false);
 assert.equal(siaiProductPath('en','space id').includes('%20'),true);
});
test('SEO route uses real 32 curated products, verified facts, legal entity and noindex on preview',()=>{
 const route=read('app/siai/[lang]/[id]/page.tsx');
 const sitemap=read('app/sitemap.ts');
 const index=read('components/SiaiRankingHome.tsx');
 assert.match(route,/MARKET_API_PRODUCTS\.includes\(id\)/);
 assert.match(route,/findPlatform\(id\)/);
 assert.match(route,/researchedFact\(id\)/);
 assert.match(route,/companyPresentationFor\(id,p\.company\)/);
 assert.match(route,/siaiDetailShouldIndex\(facts\)/);
 assert.match(route,/robots:\{index:isIndexable,follow:true\}/);
 assert.match(route,/SIAI_DETAIL_LOCALES\.map/);
 assert.match(route,/questionForProduct\(id\)/);
 assert.match(route,/type="application\/ld\+json"/);
 assert.match(route,/legalName:publisher\.legalEntity/);
 assert.match(sitemap,/if\(!siaiDetailShouldIndex\(facts\)\)continue/);
 assert.match(sitemap,/for\(const id of MARKET_API_PRODUCTS\)/);
 assert.match(index,/siai-detail-primary-link/);
 assert.doesNotMatch(route,/Math\.random|estimatedVisits|fabricatedRank/);
});
