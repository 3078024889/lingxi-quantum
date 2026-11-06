import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=p=>readFile(new URL('../../'+p,import.meta.url),'utf8');
test('main homepage remains SASI and AI tools entry, and SIAI is a separate route',async()=>{
 const [home,market,nav,catalog]=await Promise.all([root('app/page.tsx'),root('app/siai/page.tsx'),root('components/Nav.tsx'),root('app/siai/catalog-data.ts')]);
 assert.match(home,/HomeProblemHub/);
 assert.match(market,/SiaiRankingHome/);
 assert.match(market,/siaiLandingShouldIndex\(\)/);
 assert.match(nav,/href: "\/siai"/);
 assert.doesNotMatch(market,/from "\.\.\/lingxifield-ai-market\//);
 assert.match(market,/getSiaiDirectoryRows\(\)/);
 assert.match(catalog,/from "\.\.\/\.\.\/lingxifield-ai-market\//);
 assert.match(catalog,/getSiaiSourcePreviewRows/);
 assert.match(catalog,/curatedIds\.size!==curated\.length/);
 assert.match(catalog,/new Set\(rows\.map\(r=>r\.id\)\)\.size!==rows\.length/);
});
test('main SIAI ranking keeps Arabic RTL after removing redundant detail routes',async()=>{
 const [layout,ranking]=await Promise.all([root('app/layout.tsx'),root('components/SiaiRankingHome.tsx')]);
 assert.match(layout,/nested=seg==='siai'/);
 assert.match(layout,/root\.dir=key==='ar'\?'rtl':'ltr'/);
 assert.match(ranking,/dir=\{lang===\"ar\"\?\"rtl\":\"ltr\"\}/);
});
