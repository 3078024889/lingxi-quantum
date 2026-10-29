import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('model bulk collector preserves previous snapshot before replacement',async()=>{
 const s=await read('scripts/collect-modelsdev-bulk.mjs');
 assert.ok(s.includes('modelsdev-previous.json'));
 assert.ok(s.indexOf('modelsdev-previous.json')<s.indexOf("writeFile(dest+'.tmp',body)"));
});
test('pipeline automatically invokes model price delta comparison when a prior snapshot exists',async()=>{
 const s=await read('scripts/run-source-pipeline.mjs');
 assert.ok(s.includes('compare-model-prices.mjs'));
 assert.ok(s.includes('AI_MARKET_PREVIOUS_MODELS_FILE'));
});
test('history API does not fabricate changes when no previous snapshot exists',async()=>{
 const s=await read('app/api/v1/models/changes/route.ts');
 assert.ok(s.includes('no_comparable_snapshots'));
 assert.ok(s.includes('third_party_aggregated_change_not_publisher_confirmed'));
});
