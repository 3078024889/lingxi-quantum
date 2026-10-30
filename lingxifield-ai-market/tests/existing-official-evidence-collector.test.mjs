import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('all existing seed and curated products have explicit official source candidates',async()=>{
 const list=JSON.parse(await read('data/existing-product-official-sources.json'));
 const catalog=JSON.parse(await read('data/catalog.json'));
 const data=await read('lib/data.ts');
 const known=[...new Set([...catalog.map(x=>x.id),...[...data.matchAll(/\{id:'([^']+)'/g)].map(x=>x[1])])];
 assert.equal(list.sources.length,known.length);
 assert.deepEqual(new Set(list.sources.map(x=>x.id)),new Set(known));
 assert.ok(list.sources.every(x=>new URL(x.url).protocol==='https:'&&x.reviewRequired===true));
});
test('collector stores only candidate evidence and honors source HTTP validators',async()=>{
 const code=await read('scripts/collect-existing-official-evidence.mjs');
 for(const term of ['If-None-Match','If-Modified-Since','response.status===304','redirect:\'manual\'','REPOSITORY_IDENTITY_MISMATCH','candidate_unverified','CHANGED_REVIEW_REQUIRED','collection-report.json'])assert.ok(code.includes(term),term);
 assert.ok(!code.includes('createAdminClient'));
 assert.ok(!code.includes('verification_status:\'verified\''));
});
