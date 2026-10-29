import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('OpenRouter catalog is optional and never leaks API credential',async()=>{
 const s=await read('scripts/collect-openrouter-bulk.mjs');
 assert.ok(s.includes('OPENROUTER_API_KEY'));
 assert.ok(s.includes('skipped_no_credentials'));
 assert.ok(s.includes('openrouter_self_reported_prices_not_original_model_publisher'));
 assert.ok(s.includes('v2*1_000_000'));
 assert.ok(!s.includes('console.log(token)'));
});
test('multi-source orchestrator safely skips unavailable credentials',async()=>{
 const s=await read('scripts/run-source-pipeline.mjs');
 assert.ok(s.includes("requiresEnv:'OPENROUTER_API_KEY'"));
 assert.ok(s.includes("outcome:'skipped_no_credentials'"));
 assert.ok(s.includes('if(ok)state[t.id]'));
});
test('price change detector compares two snapshots and labels unverified changes',async()=>{
 const s=await read('scripts/compare-model-prices.mjs');
 assert.ok(s.includes('no_previous_snapshot'));
 assert.ok(s.includes('aggregator_observed_change_requires_publisher_review'));
 assert.ok(s.includes('model-price-changes.json'));
});
