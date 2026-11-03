import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {validCatalogEntry} from '../lib/catalog-engine.mjs';import {createSearchIndex} from '../lib/search-index.mjs';
const catalog=JSON.parse(await readFile(new URL('../data/catalog.json',import.meta.url),'utf8'));
test('candidate directory has valid attributed records and never pretends reviewed',()=>{
 assert.ok(catalog.length>=15);
 const ids=new Set();
 for(const x of catalog){assert.ok(validCatalogEntry(x),x.id);assert.ok(['active','unverified'].includes(x.status));if(x.repositoryUrl)assert.match(x.repositoryUrl,/^https:\/\/github\.com\//);assert.equal(x.websiteKind==='repository',x.website.startsWith('https://github.com/'));assert.ok(!ids.has(x.id));ids.add(x.id);}
});
test('problem queries return multiple independently listed tool candidates',()=>{
 const index=createSearchIndex(catalog);
 for(const q of ['image','code','audio','search'])assert.ok(index.search({q}).total>0, q);
});
test('default catalog API permits explicitly marked unverified records',async()=>{
 const src=await readFile(new URL('../app/api/v1/catalog/route.ts',import.meta.url),'utf8');
 assert.match(src,/status:sp\.get\('status'\)\?\?''/);
});
