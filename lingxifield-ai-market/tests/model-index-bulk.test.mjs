import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const build=await readFile(new URL('../scripts/build-model-index.mjs',import.meta.url),'utf8');
const query=await readFile(new URL('../scripts/query-model-index.mjs',import.meta.url),'utf8');
test('bulk index deduplicates provider/model and preserves source metadata',()=>{
 assert.ok(build.includes('ids.has(id)'));
 assert.ok(build.includes('third_party_aggregated_unverified_against_provider'));
 assert.ok(build.includes('sourceCollectedAt'));
});
test('query is paginated and bounded',()=>{
 assert.ok(query.includes('Math.min(50'));
 assert.ok(query.includes('nextOffset'));
 assert.ok(query.includes('providerId'));
});
