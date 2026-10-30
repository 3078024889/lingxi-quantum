import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const row=await read('app/market-matrix-row.tsx');
const home=await read('app/market-workbench.tsx');
const css=await read('app/globals.css');
const headings=await read('lib/market-matrix-headings.ts');
const facts=await read('lib/reviewed-product-facts.ts');

test('each table record has exactly 16 independent columns',()=>{
 const start=row.indexOf('<tr className="marketMatrixRow');
 const end=row.indexOf('</tr>',start);
 assert.ok(start>=0&&end>start);
 const top=row.slice(start,end);
 assert.equal((top.match(/<td\b/g)||[]).length,16);
 assert.match(row,/colSpan=\{16\}/);
 assert.match(home,/MATRIX_HEADINGS\[language\]\.map/);
 assert.match(home,/MarketMatrixRow/);
});
test('headings exist in nine languages',()=>{
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])
  assert.match(headings,new RegExp('\\b'+lang+':\\['));
 assert.match(headings,/MATRIX_COLUMN_COUNT=16/);
});
test('newbie path is task oriented, rather than a fabricated quality rank',()=>{
 assert.match(home,/新手友好榜/);
 assert.match(home,/tab==='新手友好榜'\?results.filter/);
 assert.match(home,/新手友好评分需要实际完成任务的数据/);
 assert.match(row,/暂无统一新手上手成功率实测/);
 assert.match(row,/序号，不代表综合排名/);
});
test('verified sources and commercial safeguards are retained',()=>{
 assert.match(row,/modelFact\.source/);
 assert.match(row,/reasoningFact\.source/);
 assert.match(row,/failureFact\.source/);
 assert.match(row,/facts\.paymentSource/);
 assert.match(row,/MarketRowActions platform=\{p\}/);
 assert.match(home,/SponsoredFeatures/);
 assert.match(home,/SeoGeoBoard/);
 assert.match(home,/\/vendor\/claim/);
 assert.match(row,/p\.websiteKind==='repository'/);
});
test('source snapshots distinguish model products and API models',()=>{
 for(const id of ['chatgpt','claude','gemini','runway'])
  assert.match(facts,new RegExp('product:"'+id+'",observedAt:"2026-10-30"'));
 assert.match(facts,/models:"模型与用量",reasoning:"推理与理解能力"/);
 assert.match(facts,/API 模型家族；不是 Gemini App/);
});
test('wide market matrix remains accessible on mobile and Arabic RTL',()=>{
 assert.match(css,/\.matrixScroll:focus-visible/);
 assert.match(css,/position:sticky/);
 assert.match(css,/\.beginnerGuide/);
 assert.match(css,/dir="rtl"/);
 assert.match(home,/aria-label="AI 工具 16 列行情对比"/);
});
