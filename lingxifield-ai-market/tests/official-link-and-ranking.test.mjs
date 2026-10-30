import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validCatalogEntry} from '../lib/catalog-engine.mjs';
const file=async p=>readFile(new URL('../'+p,import.meta.url),'utf8');
const catalog=JSON.parse(await file('data/catalog.json'));

test('every curated catalog row has a correctly classified destination',()=>{
 assert.equal(catalog.length,15);
 for(const row of catalog){
  assert.equal(validCatalogEntry(row),true,'invalid '+row.id);
  assert.ok(['official','documentation','repository'].includes(row.websiteKind),'unknown kind '+row.id);
  assert.ok(row.repositoryUrl?.startsWith('https://github.com/'),'source code must be separately preserved for '+row.id);
  assert.equal(row.website.startsWith('https://github.com/'),row.websiteKind==='repository','source masquerades as homepage: '+row.id);
 }
});
test('clear product-site CTA and code CTA are separate when both exist',async()=>{
 const ui=await file('app/product-access-links.tsx');
 assert.ok(ui.includes("data-link-kind={kind}"));
 assert.ok(ui.includes("repo&&repo!==url"));
 assert.ok(ui.includes('GitHub 源码 ↗'));
 assert.ok(ui.includes('没有经核验的独立在线使用入口'));
});
test('final brand is globally consistent with evidence-first market labels',async()=>{
 const layout=await file('app/layout.tsx');
 const main=await file('app/market-workbench.tsx');
 const dictionary=await file('lib/market-ui-extra.ts');
 const locale=await file('lib/locale-pages.ts');
 for(const [label,content] of [['layout',layout],['workbench',main],['dictionary',dictionary],['locale',locale]]){
  assert.ok(content.includes('全球SI AI工具行情平台'),label+' must use final name');
 }
 assert.ok(main.includes('目录序号'),'unverified order must not look like a verified ranking');
});
test('first sourced ranking is limited to official HF model repository signal',async()=>{
 const api=await file('app/api/v1/hf-model-rankings/route.ts');
 const ui=await file('app/hf-model-rankings.tsx');
 assert.ok(api.includes('isGlobalProductRanking:false'));
 assert.ok(api.includes('sort=downloads'));
 assert.ok(ui.includes('不是全球 AI 平台访问量'));
 assert.ok(ui.includes('data.items.slice(0,10)'));
});
