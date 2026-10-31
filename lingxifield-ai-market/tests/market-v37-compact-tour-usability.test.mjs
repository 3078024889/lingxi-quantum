import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('hero text cannot be cropped by the old fixed height',async()=>{
 const css=await source('app/globals.css');
 const home=await source('app/market-workbench.tsx');
 assert.match(css,/\.app \.hero\{height:auto;min-height:124px;max-height:none;overflow:visible/);
 assert.ok(!home.includes('className="heroPoints"'));
});
test('only one chip filter directly above market grid, not three stacked redundant groups',async()=>{
 const home=await source('app/market-workbench.tsx');
 assert.ok(home.includes('id="market-filters"'));
 assert.equal(home.split('className="marketV36FilterChips"').length-1,1);
 assert.ok(!home.includes('className="taskChips"'));
 assert.ok(!home.includes('className="filters"'));
 assert.ok(home.indexOf('id="market-filters"')>home.indexOf('id="tools-list"'));
 assert.ok(home.indexOf('id="market-filters"')<home.indexOf('marketOverviewViewport'));
 assert.match(home,/PRIMARY_TABS/);
});
test('guide navigates five live controls and highlights the target with an operational next button',async()=>{
 const guide=await source('app/market-quick-start.tsx');
 const css=await source('app/globals.css');
 for(const key of ["'search'","'region'","'filter'","'compare'","'feedback'"])assert.ok(guide.includes(key));
 assert.match(guide,/scrollIntoView\(\{behavior:'smooth'/);
 assert.match(guide,/marketTourSpotlight/);
 assert.match(guide,/marketTourNext/);
 assert.match(guide,/step===3&&<button[^>]+onClick=\{onCompare\}/);
 assert.match(guide,/setStep\(x=>x\+1\)/);
 assert.match(guide,/role="dialog"/);
 assert.match(css,/\.marketTourPanel/);
});
test('right-hand text remains accessible via explicit horizontal-scroll controls and sources',async()=>{
 const home=await source('app/market-workbench.tsx');
 const css=await source('app/globals.css');
 const row=await source('app/market-matrix-row.tsx');
 assert.match(home,/marketV37ScrollTools/);
 assert.match(home,/marketScrollRef\.current\?\.scrollBy/);
 assert.match(css,/min-width:1940px!important/);
 assert.match(row,/allPayments\.slice\(0,2\)/);
 assert.match(row,/allPayments\.length>2/);
 assert.match(row,/!accepted\?specific\.payment/);
 assert.match(row,/marketV37More/);
});
