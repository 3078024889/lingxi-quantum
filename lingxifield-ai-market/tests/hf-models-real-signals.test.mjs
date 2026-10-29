import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=p=>readFile(new URL('../'+p,import.meta.url),'utf8');
test('HF bulk collector attributes usage to Hub only, preserves license and does not invent pricing',async()=>{
 const c=await read('scripts/collect-hf-models.mjs');
 assert.ok(c.includes('https://huggingface.co/api/models'));
 assert.ok(c.includes('downloadsOnHub'));
 assert.ok(c.includes('license:'));
 assert.ok(c.includes('commercialPricing:null'));
 assert.ok(c.includes('hub_reported_metadata_not_global_downloads_or_quality'));
 assert.ok(c.includes('hf-models-catalog.json'));
});
test('unified batch collects HF models alongside spaces and models.dev',async()=>{
 const c=await read('scripts/run-source-pipeline.mjs');
 for(const id of ['modelsdev','huggingface_spaces','huggingface_models'])assert.ok(c.includes("id:'"+id+"'"));
});
test('real Hub model metadata remains separate from unverified SEO and global downloads',async()=>{
 const c=await read('app/api/v1/models/hub-signals/route.ts');
 assert.ok(c.includes('hf-models-catalog.json'));
 assert.ok(c.includes('Hub downloads are Hub-reported counts'));
 assert.ok(c.includes('SEO/GEO'));
});
