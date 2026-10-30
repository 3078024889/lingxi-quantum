import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('one-shot batch runner provides source-by-source evidence and explicit gaps',async()=>{
 const source=await read('scripts/run-all-sources-and-audit.mjs');
 for(const key of ['run-source-pipeline.mjs','hf-models-catalog.json','hf-spaces-catalog.json','products-unified.json','model-offer-groups.json','collection-coverage-audit.json','not_collected']){
  assert.ok(source.includes(key),key);
 }
});
test('one-shot runner does not silently report success after failed sources',async()=>{
 const source=await read('scripts/run-all-sources-and-audit.mjs');
 assert.ok(source.includes("if(run.status!==0||staging?.status==='failed')process.exitCode"));
 assert.ok(source.includes('disclaimer:'));
});
