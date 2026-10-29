import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const api=await readFile(new URL('../app/api/v1/search/route.ts',import.meta.url),'utf8');
test('main search API invokes natural language discovery fallback only for empty exact search',()=>{
 assert.match(api,/result\.total===0\?discoverCatalog\(entries,q/);
 assert.match(api,/kind:candidateItems\.length\?'task_relevance_suggestions'/);
 assert.match(api,/rankingVerified:false/);
});
test('fallback retains category filtering and never manufactures total count',()=>{
 assert.match(api,/x\.category===category/);
 assert.match(api,/total:candidateItems\.length/);
});
