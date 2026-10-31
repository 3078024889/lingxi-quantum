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
