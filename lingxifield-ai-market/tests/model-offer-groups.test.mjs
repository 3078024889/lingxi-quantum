import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('grouping retains all offers and only merges exact identifiers',async()=>{
 const code=await read('scripts/group-model-offers.mjs');
 assert.ok(code.includes("r.modelId.trim().toLowerCase()"));
 assert.ok(code.includes('exact_case_insensitive_model_id_only'));
 assert.ok(code.includes('offers:[]'));
 assert.ok(code.includes('totalOffers'));
 assert.ok(!code.includes('unlink('));
});
test('pipeline builds distinct model offer groups',async()=>{
 const code=await read('scripts/run-source-pipeline.mjs');
 assert.ok(code.includes('group-model-offers.mjs'));
 assert.ok(code.includes("source:'model_offers'"));
});
