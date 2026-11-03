import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=p=>readFile(new URL('../../'+p,import.meta.url),'utf8');
test('main homepage remains SASI and AI tools entry, and SIAI is a separate route',async()=>{
 const [home,market,nav]=await Promise.all([root('app/page.tsx'),root('app/siai/page.tsx'),root('components/Nav.tsx')]);
 assert.match(home,/HomeProblemHub/);
 assert.match(market,/SiaiRankingHome/);
 assert.match(market,/siaiSeoEnabled\(\)/);
 assert.match(nav,/href: "\/siai"/);
 assert.doesNotMatch(market,/from "\.\.\/lingxifield-ai-market\//);
 assert.match(market,/from "\.\.\/\.\.\/lingxifield-ai-market\//);
});
test('nested nine-language SIAI detail routes identify Arabic RTL even below /siai',async()=>{
 const layout=await root('app/layout.tsx');
 assert.match(layout,/nested=seg==='siai'/);
 assert.match(layout,/root\.dir=key==='ar'\?'rtl':'ltr'/);
});
