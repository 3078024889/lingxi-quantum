import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('original dashboard retains market metrics and adds real inventory without fake growth',async()=>{
 const page=await read('app/market-workbench.tsx');
 assert.ok(page.includes('marketCards()'));
 assert.ok(!page.includes('<HfModelRankings/>'));
 assert.ok(page.includes('<PriceLeaderboards language={language}/>'));
});
test('coverage data has actual local file evidence and reports missing counts honestly',async()=>{
 const route=await read('app/api/market/coverage/route.ts');
 for(const file of ['modelsdev-bulk.json','model-offer-groups.json','products-unified.json','hf-models-catalog.json','hf-spaces-catalog.json'])assert.ok(route.includes(file));
 assert.ok(route.includes("status:'missing'"));
 assert.ok(route.includes('No traffic, SEO/GEO'));
});
test('coverage strip labels candidates rather than verified commercial products',async()=>{
 const strip=await read('app/market-coverage-strip.tsx');
 assert.ok(strip.includes('产品候选'));
 assert.ok(strip.includes('不是访问量或 SEO/GEO 排名'));
});
