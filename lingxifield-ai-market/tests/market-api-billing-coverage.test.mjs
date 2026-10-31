import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(join(root,p),'utf8');

const apiSource=read('lib/market-api-service-catalog.ts');
const rateSource=read('lib/market-rate-catalog.ts');
const listMatch=apiSource.match(/const ALL=\[([\s\S]*?)\] as const/);
assert.ok(listMatch,'catalogue array declaration');
const MARKET_API_PRODUCTS=[...listMatch[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
const a='export const API_RATES:readonly ApiRate[]=[';
const start=rateSource.indexOf(a),end=rateSource.indexOf('] as ApiRate[];',start);
assert.ok(start>=0&&end>start,'typed rate catalog');
const API_RATES=JSON.parse('['+rateSource.slice(start+a.length,end)+']');

test('all 32 providers have explicit billing groups, no subscription counted as API token rate',()=>{
 assert.equal(MARKET_API_PRODUCTS.length,32);
 assert.equal(new Set(MARKET_API_PRODUCTS).size,32);
 for(const field of ["'self-hosted'","'plan'","'token'","'time'","'characters'","'separate'"])assert.ok(apiSource.includes(field));
 assert.ok(apiSource.includes("LOCAL.has(platform)"));
 assert.ok(apiSource.includes("SUBSCRIPTION_WEB.has(platform)"));
 assert.ok(apiSource.includes("const hasNumeric=tokenRates.length+unitRates.length+videoRates.length>0"));
 assert.ok(apiSource.includes("unit:'1000 characters'"));
});

test('source-priced API regions are separate, currencies not converted by calculator',()=>{
 const q=API_RATES.filter(x=>x.platform==='qwen');
 assert.ok(q.some(x=>x.model.includes('Singapore')));
 assert.ok(q.some(x=>x.model.includes('Beijing')));
 assert.ok(q.some(x=>x.model.includes('US Virginia')));
 assert.ok(q.every(x=>x.currency==='CNY'&&/^https:\/\//.test(x.source)));
 assert.ok(API_RATES.some(x=>x.platform==='claude'&&x.model.includes('Sonnet')));
 assert.ok(API_RATES.some(x=>x.platform==='grok'));
 assert.ok(API_RATES.every(x=>x.inPerMillion>=0&&x.outPerMillion>=0));
 const est=read('app/market-cost-estimator.tsx');
 for(const value of ['MARKET_API_PRODUCTS.map','apiServiceOffer(apiProvider)','apiOffer.unitRates.map','apiOffer.videoRates.map'])assert.ok(est.includes(value),value);
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
