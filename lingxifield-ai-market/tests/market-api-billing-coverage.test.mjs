import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {MARKET_API_PRODUCTS,apiServiceOffer,API_UNIT_RATES} from '../lib/market-api-service-catalog.ts';
import {API_RATES} from '../lib/market-rate-catalog.ts';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');

test('every platform has a specific billing classification and no web subscription is treated as API charge',()=>{
 assert.equal(MARKET_API_PRODUCTS.length,32);
 assert.equal(new Set(MARKET_API_PRODUCTS).size,32);
 for(const id of MARKET_API_PRODUCTS){
   const info=apiServiceOffer(id);
   assert.equal(info.platform,id);
   assert.ok(info.kind);
   assert.ok(info.descriptionZh.length>10&&info.descriptionEn.length>10);
   for(const row of info.tokenRates)assert.ok(row.inPerMillion>=0&&row.outPerMillion>=0);
 }
 assert.equal(apiServiceOffer('ollama').kind,'self-hosted');
 assert.equal(apiServiceOffer('jimeng').kind,'plan');
 assert.equal(apiServiceOffer('chatgpt').kind,'token');
 assert.ok(API_UNIT_RATES.some(x=>x.platform==='elevenlabs'&&x.unit==='1000 characters'));
});
test('official API regional prices stay separate and calculator does not convert currencies',()=>{
 const q=API_RATES.filter(x=>x.platform==='qwen');
 assert.ok(q.some(x=>x.model.includes('Singapore')));
 assert.ok(q.some(x=>x.model.includes('Beijing')));
 assert.ok(q.some(x=>x.model.includes('US Virginia')));
 assert.ok(q.every(x=>x.currency==='CNY'&&/^https:\/\//.test(x.source)));
 assert.ok(API_RATES.some(x=>x.platform==='claude'&&x.model.includes('Sonnet')));
 assert.ok(API_RATES.some(x=>x.platform==='grok'));
 const estimator=read('app/market-cost-estimator.tsx');
 assert.ok(estimator.includes('MARKET_API_PRODUCTS.map'));
 assert.ok(estimator.includes('apiServiceOffer(apiProvider)'));
 assert.ok(estimator.includes('apiOffer.unitRates.map'));
 assert.ok(estimator.includes('apiOffer.videoRates.map'));
});
test('company profile hides unverified team, financing and launch dates and pages omit unsupported caveats',()=>{
 const profile=read('app/market-company-snapshot.tsx');
 const region=read('app/market-global-access.tsx');
 const capability=read('app/capability-showcase.tsx');
 assert.ok(profile.includes(".filter(x=>good(x.value))"));
 assert.ok(profile.includes('platformLinks(p.id)'));
 assert.ok(!region.includes('countryList.words.access'));
 assert.ok(!capability.includes('真实用途示例'));
 assert.ok(!capability.includes('使用边界'));
});
