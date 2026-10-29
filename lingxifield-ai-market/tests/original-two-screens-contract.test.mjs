import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('global market and platform detail preserve original two-screen visual hierarchy',async()=>{
 const home=await read('app/market-workbench.tsx');
 for(const field of ['全球 AI 平台排行榜','排行榜','AI工具库','对比','搜索 AI 平台','/apps','/models','detailTab']){
  assert.ok(home.includes(field),'Missing original experience '+field);
 }
 assert.ok(!home.includes('logoMark">◈'),'Use official original logo asset, never invented mark');
});
test('acceptance contract forbids fabricated screenshot KPIs, valuations and ratings',async()=>{
 const contract=await read('docs/ORIGINAL_TWO_SCREENS_PRODUCT_CONTRACT.md');
 for(const word of ['5.28B','298M','48.7B','用户','厂商','SEO/GEO','Logo','待核验'])assert.ok(contract.includes(word));
});
