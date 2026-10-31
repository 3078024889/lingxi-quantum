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

test('market has eleven visible facts, no duplicate row accordion',()=>{
 assert.ok(row.includes('export const V36_COL_COUNT=11'));
 assert.equal(row.split('<td ').length-1,11);
 assert.ok(!row.includes('setExpanded('));
 assert.ok(!row.includes('marketOverviewDetailsRow'));
 assert.ok(home.includes('marketRowTitles(language).map'));
 assert.ok(home.includes('const filtered=results;'));
 assert.ok(row.includes('shortDramaSummary(p.id,language)'));
 assert.ok(row.includes('globalRegionFact(p.id,region)'));
});

test('all existing source headings and new eleven-column headings are translated to nine languages',()=>{
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.match(headings,new RegExp('\\b'+lang+':\\['));
 }
 assert.match(headings,/MATRIX_COLUMN_COUNT=16/);
 assert.match(headings,/MATRIX_OVERVIEW_COLUMN_COUNT=7/);
 assert.match(headings,/MATRIX_OVERVIEW_HEADINGS/);
 assert.match(row,/export const V36_COL_COUNT=11/);
});

test('newbie path stays task oriented without fabricated ranking',()=>{
 assert.match(home,/新手友好榜/);
 assert.match(home,/beginner:tab==='新手友好榜'\?'1':'0'/);
 assert.match(home,/beginner:tab==='新手友好榜'\?'1':'0'/);
 assert.doesNotMatch(row,/暂无统一新手上手成功率实测/);
 assert.match(home,/SeoGeoBoard/);
});

test('official evidence links and vendor separation stay intact',()=>{
 assert.match(row,/p.conditions\?\.find\(x=>x.label==='模型与用量'\)/);
 assert.match(row,/summary\.source/);
 assert.match(row,/commercial\?\.source/);
 assert.ok(row.includes('globalRegionSummary(p.id,language)'));
 assert.match(row,/MarketRowActions language=\{language\} platform=\{p\}/);
 assert.match(home,/SponsoredFeatures/);
 assert.match(home,/SeoGeoBoard/);
 assert.match(home,/\/vendor\/claim/);
 assert.match(actions,/platform\.websiteKind==='repository'/);
 assert.match(actions,/claimUrl/);
});

test('official model and pricing review records are not replaced by marketing claims',()=>{
 for(const id of ['chatgpt','claude','gemini','runway'])
  assert.match(facts,new RegExp('product:"'+id+'",observedAt:"2026-10-30"'));
 assert.match(facts,/models:"模型与用量",reasoning:"推理与理解能力"/);
 assert.match(row,/const rawFree=free\?\.text\|\|guide\?\.free/);
 assert.match(row,/const rawCost=price\?\.text\|\|guide\?\.cost/);
});

test('the overview does not rely on fixed overlay columns or multi-thousand-pixel horizontal scroll',()=>{
 assert.match(css,/V3\.6: filterable first-view matrix/);
 assert.match(css,/\.marketOverviewViewport/);
 assert.match(css,/\.marketOverviewTable :is\(th,td\)/);
 assert.match(css,/position:sticky!important/);
 assert.match(css,/min-width:1940px!important/);
 assert.match(css,/\.marketV36Row/);
 assert.match(css,/dir="rtl"/);
 assert.match(home,/marketOverviewViewport/);
 assert.doesNotMatch(home,/aria-label="AI 工具 16 列行情对比"/);
});
