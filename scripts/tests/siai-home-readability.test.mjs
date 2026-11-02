import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');

test('both SIAI tables keep full data in detail while compact previews prevent tall rows',()=>{
 const home=read('components/SiaiRankingHome.tsx');
 const css=read('app/siai-home.css');
 const market=read('lingxifield-ai-market/app/globals.css');
 for(const prop of ['strength','price','free','region','payment','models','commercial']){
  assert.ok(home.includes('title={p.'+prop+'}')||prop==='strength'&&home.includes('title={p.strength||p.about}'),prop+' full fact title missing');
 }
 assert.match(home,/expanded===p\.id/);
 assert.match(home,/<Source href=\{p\.priceSource\}/);
 assert.match(home,/p\.commercialSource/);
 assert.match(css,/siai-cell-preview.*-webkit-box/);
 assert.match(css,/-webkit-line-clamp:4/);
 assert.match(market,/Compact legacy market matrix/);
 assert.match(market,/marketOverviewPrice>strong/);
 assert.doesNotMatch(market,/\.marketV36Model,\.marketV36Business/);
});
test('multilingual category selector reuses shared locale vocabulary',()=>{
 const home=read('components/SiaiRankingHome.tsx');
 const vocab=read('lingxifield-ai-market/lib/market-home-i18n.ts');
 assert.match(home,/import \{localizedCategory\}/);
 assert.match(home,/localizedCategory\(lang,c\)/);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])assert.ok(home.includes(lang+':{title:'),lang);
 assert.match(vocab,/export function localizedCategory/);
});
test('market table supports safe sticky columns and scroll without compacting the legal fact cell',()=>{
 const css=read('app/siai-home.css'),market=read('lingxifield-ai-market/app/globals.css');
 assert.match(css,/\.siai-home-table-scroll\{[^}]*overflow-x:auto/);
 assert.match(css,/inset-inline-start:45px/);
 assert.match(css,/@media\(max-width:550px\)/);
 assert.match(market,/marketPublisherFactStackCompact\{background:transparent!important;border:0!important/);
 assert.match(market,/\.marketPublisherFactStackCompact\{min-width:0!important/);
});
