import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('main LINGXIFIELD homepage exposes SIAI rankings above the long tool catalog',()=>{
 const home=read('components/HomeProblemHub.tsx'),nav=read('components/Nav.tsx');
 const route=read('app/siai/page.tsx'),catalog=read('app/siai/catalog-data.ts');
 assert.match(home,/data-testid="home-global-siai-entry"/);
 assert.ok(home.indexOf('data-testid="home-global-siai-entry"')<home.indexOf('data-home-tool-catalog'));
 assert.ok(home.includes('href:"/siai",icon:"products"'));
 assert.match(nav,/href: "\/siai", key: "home"/);
 assert.match(route,/getSiaiDirectoryRows\(\)/);
 assert.match(catalog,/getCuratedRows\(\)/);
 assert.match(catalog,/rows\.length!==curated\.length\+preview\.length/);
 assert.match(catalog,/curatedIds\.size!==curated\.length/);
 assert.match(route,/SiaiRankingHome rows=\{rows\}/);
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar'])
  assert.ok(home.includes(lang+':{title:'),lang+' homepage SIAI entry');
});
