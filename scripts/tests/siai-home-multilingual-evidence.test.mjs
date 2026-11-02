import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');

test('main SIAI market shows non-Chinese factual details in localized words rather than raw legacy Chinese overview',()=>{
 const c=read('components/SiaiRankingHome.tsx');
 for(const importName of ['globalRegionSummary','commercialEvidence','localizedPaymentName','localizedCatalogFact','localizedProductSummary'])
  assert.ok(c.includes(importName),importName);
 assert.match(c,/const displayRegion=.*?globalRegionSummary\(p\.id,lang\)/);
 assert.match(c,/const displayCommercial=.*?commercialEvidence\(p\.id,lang\)/);
 assert.match(c,/const displayPayment=.*?localizedPaymentName\(s,lang\)/s);
 assert.match(c,/const displayAbout=.*?localizedProductSummary\(p\.id,lang\)/);
 assert.doesNotMatch(c,/<p>\{p\.about\}<\/p><p>\{p\.features/);
 for(const field of ['free','price','models'])assert.ok(c.includes('displayFact(p,"'+field+'")'),field);
 for(const field of ['Region','Commercial','Payment'])assert.ok(c.includes('display'+field+'(p)'),field);
 assert.match(c,/p\.paymentSource,t\.payment/);
});

test('search-engine product detail does not publish Chinese editorial Q&A as localized non-Chinese content',()=>{
 const page=read('app/siai/[lang]/[id]/page.tsx');
 assert.match(page,/const question=lang==='zh'\?questionForProduct\(id\)\[0\]:null/);
 assert.match(page,/\{l==='zh'&&<section className="siai-detail-questions"/);
 assert.match(page,/globalRegionSummary\(id,l\)/);
 assert.match(page,/commercialEvidence\(id,l\)/);
 assert.match(page,/localizedPaymentName\(method,l\)/);
 assert.match(page,/l==='zh'\?p\.about:strength/);
 assert.match(page,/l==='zh'&&<p>\{p\.features\.join/);
 assert.doesNotMatch(page,/<p>\{p\.about\}<\/p><p>\{p\.features/);
 assert.match(page,/siaiDetailShouldIndex\(facts\)/);
 assert.match(page,/robots:\{index:isIndexable,follow:true\}/);
});

test('Midjourney web is not a free offer merely because separate niji mobile app has limited trial',()=>{
 const filtering=read('lib/siai-home-facets.ts');
 const market=read('lingxifield-ai-market/lib/market-v36-screening.ts');
 assert.match(filtering,/if\(row\.id==='midjourney'\)return false/);
 assert.match(market,/if\(p\.id==='midjourney'\)return false/);
});
