import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../../'+p,import.meta.url),'utf8');
test('main SIAI route keeps the compact ranking readable while preserving sourced creators in comparison and detail',()=>{
 const home=read('components/SiaiRankingHome.tsx'),route=read('app/siai/page.tsx'),catalog=read('app/siai/catalog-data.ts'),sitemap=read('app/sitemap.ts');
 assert.ok(route.includes('getSiaiDirectoryRows()'));
 assert.ok(catalog.includes('creator:publisher.creator'));
 assert.ok(catalog.includes('companyPresentationFor(id,platform.company)'));
 assert.ok(home.includes('p.creator?.role==="founder"?t.founder'));
 assert.ok(home.includes('<Source href={p.creator?.source||null} label={t.source}/>'));
 assert.ok(home.includes('<div><dt>{t.listed}</dt><dd>{listingFor(p)}'));
 assert.ok(home.includes('<div><dt>{t.founded}</dt><dd>{p.year||"—"}'));
 assert.ok(home.includes('listingFor(p)'));
 assert.ok(home.includes('p.creator?.source||null'));
 assert.ok(!home.includes('p.kind==="company"?(p.legal||"—")'));
 assert.ok(home.includes('p.legal&&<div>'));
 assert.ok(home.includes('[t.founder,(p:SiaiHomeRow)'));
 assert.ok(home.includes('siai-detail-backdrop'));
 assert.ok(home.includes('claimUrl(p)'));
 assert.ok(!existsSync(new URL('../../app/siai/[lang]/[id]/page.tsx',import.meta.url)));
 assert.ok(!sitemap.includes('siaiProductPath'));

 for(const lang of ['zh','en','ja','ko','fr','de','es','pt','ar']){
  assert.ok(home.includes(lang+':{title:'),lang+' main');
  }
});
