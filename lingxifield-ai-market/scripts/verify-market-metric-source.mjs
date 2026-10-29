import test from'node:test';import assert from'node:assert/strict';import{readFile}from'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('public metric cards are evidence-driven, not hardcoded',async()=>{
 const ui=await read('app/market-workbench.tsx');
 assert.match(ui,/marketCards\(d\.metrics\)/);
 assert.doesNotMatch(ui,/<b>待接入<\/b>/);
 assert.doesNotMatch(ui,/<b>暂无可靠数据<\/b>/);
});
test('verified metrics dataset starts empty instead of invented scores',async()=>{
 const d=JSON.parse(await read('data/verified-market-metrics.json'));
 assert.deepEqual(d,{});
});
test('API emits only source validated metrics',async()=>{
 const api=await read('app/api/market/verified-metrics/route.ts');
 assert.match(api,/marketCards\(source\)/);
 assert.match(api,/filter\(x=>x\.metric!==null\)/);
});
