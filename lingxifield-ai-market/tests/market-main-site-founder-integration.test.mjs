import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('main SIAI route shows human creators in ranking and comparison, keeps corporations in details',()=>{
 const home=read('components/SiaiRankingHome.tsx'),route=read('app/siai/page.tsx'),detail=read('app/siai/[lang]/[id]/page.tsx');
 assert.ok(route.includes('creator:publisher.creator'));
 assert.ok(home.includes("p.creator?.role==='founder'"));
 assert.ok(home.includes('p.creator?.source||null'));
 assert.ok(!home.includes('p.kind==="company"?(p.legal||"—")'));
 assert.ok(home.includes('p.legal&&<div>'));
 assert.ok(home.includes('[t.founder,(p:SiaiHomeRow)'));
 assert.ok(detail.includes("publisher.creator?.role==='founder'"));
 assert.ok(detail.includes('items.slice(0,6)'));
 assert.ok(detail.includes('items.slice(6)'));
 assert.ok(detail.includes("legal:'法律注册名称'"));
 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.ok(home.includes(lang+':{title:'),lang+' main');
  assert.ok(detail.includes(lang+':{back:'),lang+' detail');
 }
});
