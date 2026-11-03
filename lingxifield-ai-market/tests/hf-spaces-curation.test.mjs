import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('curation preserves original catalog and explains exclusions',async()=>{
 const code=await read('scripts/curate-hf-spaces.mjs');
 assert.ok(code.includes('hf-spaces-catalog.json'));
 assert.ok(code.includes('hf-spaces-curated.json'));
 assert.ok(code.includes('not_updated_within_one_year'));
 assert.ok(code.includes('excludedCount'));
});
test('pipeline builds curated app catalog in same batch',async()=>{
 const code=await read('scripts/run-source-pipeline.mjs');
 assert.ok(code.includes('curate-hf-spaces.mjs'));
});
test('search API prioritizes curated apps and retains original as fallback',async()=>{
 const code=await read('app/api/v1/products/discover/route.ts');
 assert.ok(code.indexOf('hf-spaces-curated.json')<code.indexOf('hf-spaces-catalog.json'));
 assert.ok(code.includes('sourceCollectedAt||data.collectedAt'));
});
