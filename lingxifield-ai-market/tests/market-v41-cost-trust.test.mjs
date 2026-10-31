import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>fs.readFileSync(path.join(ROOT,p),'utf8');
const math=await import(pathToFileURL(path.join(ROOT,'lib/market-cost-math.ts')).href);
test('short-video credit usage and pricing have auditable units',()=>{
 assert.equal(math.estimateVideoCredits(5,6,2),60);
 assert.equal(math.estimateVideoCost(5,6,2,0.1),6);
 assert.equal(math.estimateVideoCredits(0,0,0),0);
 assert.equal(math.estimateVideoCost(5,6,2,null),null);
});
test('API input and output prices are independent per million tokens',()=>{
 assert.equal(math.estimateApiUsageCost(1_000_000,250_000,1,5),2.25);
 assert.equal(math.estimateApiUsageCost(0,0,0,0),0);
 assert.equal(math.estimateApiUsageCost(-1,10,1,5),null);
 assert.equal(math.estimateApiUsageCost(1,10,Infinity,5),null);
 assert.equal(math.estimateVideoCost(1e308,1e308,1e308,1e308),null);
});
test('nine-language cost and evidence sources never prefill unverified prices',()=>{
 const calculator=read('app/market-cost-estimator.tsx');
 const ui=read('lib/market-ui-extra.ts');
 const methodology=read('app/methodology/page.tsx');
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.match(calculator,new RegExp('\\b'+lang+':\\{'));
  assert.match(methodology,new RegExp('\\b'+lang+':\\{'));
 }
 assert.match(ui,/"headline":"全球 SI AI 行情平台"/);
 assert.match(calculator,/useState\(''\)/);
 assert.match(calculator,/estimateApiUsageCost/);
});
test('commercial rights must carry a vendor policy source and conditions',()=>{
 const facts=read('lib/market-commercial-evidence.ts');
 assert.match(facts,/https:\/\/help\.runwayml\.com/);
 assert.match(facts,/https:\/\/openai\.com\/policies/);
 assert.match(facts,/checkedAt:/);
 assert.match(facts,/condition:/);
 assert.doesNotMatch(facts,/commercialEvidence\('anthropic-sdk-python'/);
});
test('SEO indexing stays release-gated; sponsored placement not a rank',()=>{
 const policy=read('lib/market-index-policy.ts');
 const methodology=read('app/methodology/page.tsx');
 assert.match(policy,/AI_MARKET_INDEX_READY/);
 assert.match(policy,/VERCEL_ENV!=='preview'/);
 assert.match(methodology,/付费推荐和赞助位必须明示/);
});

test('V41 country and commercial answers are explicit and scope-correct',async()=>{
 const regions=await import(pathToFileURL(path.join(ROOT,'lib/official-country-lists.ts')).href);
 const sdk=regions.officialCountrySnapshot('anthropic-sdk-python');
 assert.equal(sdk.isComplete,false);
 assert.ok(sdk.countries.size>=20);
 for(const country of ['US','SG','JP','GB','AU','DE','FR']){
   assert.ok(sdk.countries.has(country),country);
 }
 assert.equal(regions.officialCountryStatus('anthropic-sdk-python','US'),'supported');
 assert.equal(regions.officialCountryStatus('anthropic-sdk-python','CN'),'unknown'); // separate documented API unsupported rule
 assert.equal(regions.officialCountryStatus('anthropic-sdk-python','HK'),'unknown');
 const facts=read('lib/market-commercial-evidence.ts');
 for(const id of ['anthropic-sdk-python','claude','suno','midjourney','runway','chatgpt']){
   assert.ok(facts.includes(id+':')||facts.includes('"'+id+'":'),id);
 }
 assert.match(facts,/https:\/\/help\.suno\.com/);
 assert.match(facts,/Apache-2\.0/);
 const row=read('app/market-matrix-row.tsx');
 assert.match(row,/marketLicenseCondition/);
 assert.match(row,/licenseFact\.condition/);
 assert.match(row,/SDK免费安装，API调用另行计费/);
});
test('V41 scrolling reveals all columns instead of sticky overlays; no IP guessing',()=>{
 const css=read('app/globals.css');
 const workbench=read('app/market-workbench.tsx');
 assert.doesNotMatch(css,/\.marketOverviewTable :is\(th:nth-child\(2\),td:nth-child\(2\)\)\{position:sticky/);
 assert.doesNotMatch(css,/\.marketOverviewTable :is\(th:nth-child\(11\),td:nth-child\(11\)\)\{position:sticky/);
 assert.match(css,/\.marketOverviewTable :is\(th,td\)\{position:static!important/);
 assert.doesNotMatch(workbench,/fetch\('\/api\/v1\/visitor-region'/);
 assert.match(workbench,/MarketMatrixRow/);
});
