import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const [row,home,css,headings,facts,actions]=await Promise.all([
 'app/market-matrix-row.tsx',
 'app/market-workbench.tsx',
 'app/globals.css',
 'lib/market-matrix-headings.ts',
 'lib/reviewed-product-facts.ts',
 'app/market-row-actions.tsx'
].map(read));

test('market has seven readable columns, with all sixteen original dimensions accessible on expansion',()=>{
 const start=row.indexOf('<tr className="marketOverviewRow"');
 const end=row.indexOf('</tr>',start);
 assert.ok(start>=0&&end>start);
 assert.equal((row.slice(start,end).match(/<td\b/g)||[]).length,7);
 assert.match(row,/colSpan=\{7\}/);
 assert.match(row,/setExpanded\(v=>!v\)/);
 assert.match(row,/aria-expanded=\{expanded\}/);
 assert.match(home,/MATRIX_OVERVIEW_HEADINGS\[language\]\.map/);
 assert.match(home,/MarketMatrixRow/);
 assert.doesNotMatch(home,/className="marketDirectoryTable marketMatrixTable"/);
 for(const index of [3,4,5,6,7,8,9,10,11,12,13,14,15])assert.ok(row.includes('headings['+index+']'),'detail dimension '+index);
});

test('seven overview titles and sixteen detailed titles exist in all nine languages',()=>{
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.match(headings,new RegExp('\\b'+lang+':\\['));
 }
 assert.match(headings,/MATRIX_COLUMN_COUNT=16/);
 assert.match(headings,/MATRIX_OVERVIEW_COLUMN_COUNT=7/);
 assert.match(headings,/MATRIX_OVERVIEW_HEADINGS/);
});

test('newbie path stays task oriented without fabricated ranking',()=>{
 assert.match(home,/新手友好榜/);
 assert.match(home,/tab==='新手友好榜'\?results\.filter/);
 assert.match(home,/新手友好评分需要实际完成任务的数据/);
 assert.match(row,/暂无统一新手上手成功率实测/);
 assert.match(row,/序号，不代表综合排名/);
});

test('official evidence links and vendor separation stay intact',()=>{
 assert.match(row,/modelFact\.source/);
 assert.match(row,/reasoningFact\.source/);
 assert.match(row,/failureFact\.source/);
 assert.match(row,/globalFact\.payments\.source/);
 assert.match(row,/MarketRowActions language=\{language\} platform=\{p\}/);
 assert.match(home,/SponsoredFeatures/);
 assert.match(home,/SeoGeoBoard/);
 assert.match(home,/\/vendor\/claim/);
 assert.match(row,/p\.websiteKind==='repository'/);
 assert.match(actions,/claimUrl/);
});

test('official model and pricing review records are not replaced by marketing claims',()=>{
 for(const id of ['chatgpt','claude','gemini','runway'])
  assert.match(facts,new RegExp('product:"'+id+'",observedAt:"2026-10-30"'));
 assert.match(facts,/models:"模型与用量",reasoning:"推理与理解能力"/);
 assert.match(row,/freeFact\?\.text\|\|guide\?\.free/);
 assert.match(row,/priceFact\?\.text\|\|guide\?\.cost/);
});

test('the overview does not rely on fixed overlay columns or multi-thousand-pixel horizontal scroll',()=>{
 assert.match(css,/V3\.2: Seven-column readable market overview/);
 assert.match(css,/\.marketOverviewViewport/);
 assert.match(css,/\.marketOverviewTable :is\(th,td\)/);
 assert.match(css,/position:static!important/);
 assert.match(css,/@container market-overview \(max-width:1070px\)/);
 assert.match(css,/@container market-overview \(max-width:640px\)/);
 assert.match(css,/dir="rtl"/);
 assert.match(home,/marketOverviewViewport/);
 assert.doesNotMatch(home,/aria-label="AI 工具 16 列行情对比"/);
});
