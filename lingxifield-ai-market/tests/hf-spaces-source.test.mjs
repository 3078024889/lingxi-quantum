import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
test('Hugging Face Spaces collector only uses public source and leaves unknown commercial fields unknown',async()=>{
 const code=await read('scripts/collect-hf-spaces.mjs');
 assert.ok(code.includes('https://huggingface.co/api/spaces'));
 assert.ok(code.includes('hf-spaces-catalog.json'));
 assert.ok(code.includes('pricing:null,freeQuota:null'));
 assert.ok(code.includes('chinaAvailability:null'));
 assert.ok(code.includes('public_repository_metadata_not_usage_or_quality'));
});
test('pipeline includes HF Spaces and retains other adapters',async()=>{
 const code=await read('scripts/run-source-pipeline.mjs');
 assert.ok(code.includes("id:'huggingface_spaces'"));
 assert.ok(code.includes("id:'modelsdev'"));
 assert.ok(code.includes("id:'github'"));
});
test('product discovery API uses local source and warns against false traffic or quality metrics',async()=>{
 const code=await read('app/api/v1/products/discover/route.ts');
 assert.ok(code.includes('hf-spaces-catalog.json'));
 assert.ok(code.includes('Space likes are Hugging Face signals only'));
 assert.ok(code.includes('nextCursor'));
});
