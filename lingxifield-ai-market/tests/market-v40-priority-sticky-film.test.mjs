import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');

test('primary columns answer buyer questions before advanced model and licensing details in all nine languages',async()=>{
 const row=await read('app/market-matrix-row.tsx');
 const order=[...row.matchAll(/<td className="([^"]+)"/g)].map(m=>m[1]);
 assert.deepEqual(order,['marketOverviewRank','marketOverviewIdentity','marketOverviewStrength','marketOverviewFree','marketOverviewPrice','marketOverviewRegion','marketV36Login','marketV36Drama','marketV36Model','marketV36Business','marketOverviewActions']);
 assert.equal(order.length,11);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  const line=row.match(new RegExp('\\b'+lang+':\\[([^\\n]+)\\]'))?.[1];
  assert.ok(line,lang+' missing');
  const vals=[...line.matchAll(/'([^']*)'/g)].map(m=>m[1]);
  assert.equal(vals.length,11,lang);
  assert.match(vals[7],/视频|動画|영상|film|clip|Cortos|Curtas|أفلام|فيلم/i,lang+' short film/clip label');
  assert.ok(vals[10],lang+' missing official action');
 }
});
test('pinned name and action remain visible during horizontal scroll and shrink on mobile',async()=>{
 const css=await read('app/globals.css');
 const home=await read('app/market-workbench.tsx');
 assert.match(css,/min-width:1940px!important/);
 assert.ok(css.includes('position:sticky!important;left:48px!important'));
 assert.ok(css.includes('position:sticky!important;right:0!important'));
 assert.match(css,/@media\(max-width:720px\)/);
 assert.ok(css.includes('left:0!important;right:auto!important'));
 assert.match(home,/marketScrollRef\.current\?\.scrollBy/);
});
test('no repeated video-wrong answer for a nonvideo tool, but real short film limits linked to publisher',async()=>{
 const row=await read('app/market-matrix-row.tsx');
 const screen=await read('lib/market-v36-screening.ts');
 assert.match(row,/videoTool=Boolean\(drama\)\|\|/);
 assert.match(row,/videoTool\?<span className="marketDramaUnknown"/);
 assert.match(row,/marketDramaNA/);
 assert.match(screen,/Kling 4\.0/);
 assert.match(screen,/Gen-4/);
 assert.match(screen,/Ray3 Modify/);
 assert.match(screen,/const videoSource/);
});
test('six primary filters directly above table; expert criteria are optional but functional',async()=>{
 const home=await read('app/market-workbench.tsx');
 assert.equal(home.split('className="marketV36FilterChips"').length-1,1);
 assert.match(home,/MARKET_FILTERS\.map\(x=><button type="button"/);
 assert.doesNotMatch(home,/details className="marketV40ExtraFilters"/);
 assert.match(home,/setMarketFilter\(x\)/);
 assert.match(home,/payment:paymentFilter,sort:marketSort,region/);
});
test('regional preference uses official 5 examples; Hong Kong is explicitly listed only where policy supports',async()=>{
 const region=await read('lib/region-presentation.ts');
 const model=await read('lib/official-country-lists.ts');
 const row=await read('app/market-matrix-row.tsx');
 assert.match(region,/const priority=\(id==='gemini'\?/);
 assert.ok(region.includes("id==='gemini'?['HK','US','JP','SG','GB','AU']"));
 assert.match(model,/isComplete:false,productScope:'Gemini web app'/);
 assert.match(row,/regionName\(region,language\)\+' · '\+regionText/);
});
