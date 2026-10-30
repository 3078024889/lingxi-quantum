import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const locales=['zh','en','ja','ko','fr','de','es','pt','ar'];
test('newcomer guide jumps to real controls without login and works in all nine languages',async()=>{
 const guide=await read('app/market-quick-start.tsx');
 const home=await read('app/market-workbench.tsx');
 for(const locale of locales)assert.ok(guide.includes(' '+locale+':{title:'),locale);
 assert.match(guide,/id="market-guide"/);
 assert.match(guide,/querySelector<HTMLInputElement>\('\.searchBar input'\)/);
 assert.match(guide,/\.marketRegionSelect select/);
 assert.match(guide,/#visitor-feedback/);
 assert.match(guide,/if\(step==='compare'\)\{onCompare\(\);return;\}/);
 assert.match(home,/<MarketQuickStart language=\{language\} onCompare=/);
 assert.match(home,/href="\/#market-guide"/);
 assert.doesNotMatch(guide,/login\(|\/auth\/v1\//);
});
test('seven-column overview remains readable, screenshot-marked redundant boxes removed',async()=>{
 const row=await read('app/market-matrix-row.tsx');
 const css=await read('app/globals.css');
 assert.match(row,/marketOverviewDetailsCompact/);
 assert.match(row,/const displayRegion=region==='GLOBAL'\?'CN':region/);
 assert.doesNotMatch(row,/<h4>\{headings\[5\]\}/);
 assert.doesNotMatch(row,/<h4>\{headings\[6\]\}/);
 assert.doesNotMatch(row,/<h4>\{headings\[9\]\}/);
 assert.match(row,/rich\?rich\.capabilities\.slice\(0,3\)/);
 assert.match(css,/td:nth-child\(2\)\)\{width:10%\}/);
 assert.match(css,/td:nth-child\(3\)\)\{width:31%\}/);
 assert.match(css,/marketOverviewDetailsCompact\{grid-template-columns:repeat\(2/);
});
test('comparison keeps the original 2–3 selection workflow and country-specific factual rules',async()=>{
 const home=await read('app/market-workbench.tsx');
 const css=await read('app/globals.css');
 assert.match(home,/sessionStorage\.getItem\('lingxifield_market_compare_v1'\)/);
 assert.match(home,/compare\.length>=2\)\s*setShowCompare\(true\)/);
 assert.match(home,/field\.pick\(platform,region,language\)/);
 assert.match(home,/globalRegionFact\(p\.id,country\)/);
 assert.match(home,/compareFitScroll/);
 assert.match(css,/\.compareFitScroll table\{width:100%;min-width:0;table-layout:fixed/);
});
test('global region policy answers China Mainland explicitly without pretending network tests passed',async()=>{
 const region=await read('app/market-global-access.tsx');
 assert.match(region,/globalRegionFact\(platform\.id,'CN'\)/);
 assert.match(region,/region==='GLOBAL'&&<div className="globalMainlandSpotlight"/);
 assert.match(region,/t\.untested/);
 assert.match(region,/mainland\.policy\.source/);
});
