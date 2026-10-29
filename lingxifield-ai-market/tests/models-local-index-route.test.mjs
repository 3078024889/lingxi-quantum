import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const api=await readFile(new URL('../app/api/v1/models/route.ts',import.meta.url),'utf8');
const pipeline=await readFile(new URL('../scripts/run-source-pipeline.mjs',import.meta.url),'utf8');
test('model API prefers verified-shape local bulk index before upstream fetch',()=>{
 assert.ok(api.includes("models-index.json"));
 assert.ok(api.indexOf("models-index.json")<api.indexOf("await fetch(upstream"));
 assert.ok(api.includes("AI_MARKET_SNAPSHOT_DIR"));
 assert.ok(api.includes("third_party_aggregated_unverified_against_provider"));
});
test('pipeline produces models index after collection and when existing index missing',()=>{
 assert.ok(pipeline.includes("models-index.json"));
 assert.ok(pipeline.includes("build-model-index.mjs"));
 assert.ok(pipeline.includes("!indexExists"));
});
