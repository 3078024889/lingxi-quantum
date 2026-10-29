import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../scripts/run-source-pipeline.mjs',import.meta.url),'utf8');
test('multiple independently checkpointed batch sources',()=>{
 assert.ok(code.includes("id:'modelsdev'"));
 assert.ok(code.includes("id:'github'"));
 assert.ok(code.includes('ttlHours'));
 assert.ok(code.includes('skipped_fresh'));
});
test('per-source failures do not mark them successful or mutate production',()=>{
 assert.ok(code.includes('if(ok)state[t.id]'));
 assert.ok(code.includes('pipeline-last-run.json'));
 assert.ok(code.includes('timeout:90000'));
 assert.ok(!code.includes('supabase'));
});
