import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('source model data remains intact; curated view documents exclusion reasons',async()=>{
 const s=await read('scripts/curate-model-index.mjs');
 assert.ok(s.includes('models-index.json'));
 assert.ok(s.includes('models-curated.json'));
 assert.ok(s.includes('excludedCount'));
 assert.ok(s.includes('no_comparable_specification'));
 assert.ok(!s.includes('unlink('));
});
test('model API exposes all records when requested and defaults to curated',async()=>{
 const s=await read('app/api/v1/models/route.ts');
 assert.ok(s.includes("sp.get('scope')==='all'"));
 assert.ok(s.includes('models-curated.json'));
 assert.ok(s.includes('models-index.json'));
});
test('pipeline builds curated view after bulk index',async()=>{
 const s=await read('scripts/run-source-pipeline.mjs');
 assert.ok(s.includes('curate-model-index.mjs'));
});
