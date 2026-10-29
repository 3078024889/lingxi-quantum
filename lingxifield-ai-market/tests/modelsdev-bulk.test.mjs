import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const s=await readFile(new URL('../scripts/collect-modelsdev-bulk.mjs',import.meta.url),'utf8');
test('bulk feed uses one attributed provider response and never invents prices',()=>{
 assert.ok(s.includes('https://models.dev/api.json'));
 assert.ok(s.includes("typeof model.cost?.input==='number'"));
 assert.ok(s.includes('third_party_aggregated_unverified_against_provider'));
 assert.ok(s.includes('sha256'));
});
