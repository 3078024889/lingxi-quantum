import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeSource,diffSource,evidenceHash} from './source-delta.mjs';
const hf={id:'Qwen/Qwen3-8B',downloads:128,likes:10,lastModified:'2026-10-29T01:00:00.000Z',sha:'abcdef',private:false};
test('canonical hashing ignores JSON property insertion order',()=>assert.equal(evidenceHash({z:1,a:{y:3,x:2}}),evidenceHash({a:{x:2,y:3},z:1})));
test('Hugging Face model downloads are repository counts not global platform traffic',()=>{
 const out=normalizeSource('hf-models',[hf]);assert.equal(out.length,1);
 assert.equal(out[0].facts.downloads,128);assert.equal(out[0].scope,'Hugging Face model repositories only');
 assert.equal(out[0].reviewStatus,'candidate');assert.equal(out[0].sourceUrl,'https://huggingface.co/Qwen/Qwen3-8B');
});
test('unverified model price from aggregator remains an aggregator claim',()=>{
 const out=normalizeSource('modelsdev',{openai:{models:{'gpt-4o':{name:'GPT-4o',cost:{input:2.5,output:10},limit:{context:128000}}}}});
 assert.equal(out[0].facts.costSource.input,2.5);assert.equal(out[0].sourceClass,'independent_aggregator');
 assert.equal(out[0].reviewStatus,'candidate');
});
test('OpenRouter price remains in exact provider unit (per token)',()=>{
 const out=normalizeSource('openrouter',{data:[{id:'x/model',name:'Model',pricing:{prompt:'0.000001',completion:'0.000003'}}]});
 assert.equal(out[0].facts.inputPricePerToken,'0.000001');
 assert.equal(out[0].facts.providerScope,'openrouter_only');
});
test('real change detected and absent items not declared deleted',()=>{
 const [a]=normalizeSource('hf-models',[hf]);
 const [b]=normalizeSource('hf-models',[{...hf,downloads:129}]);
 const diff=diffSource([a], [b]);assert.equal(diff.changed.length,1);
 assert.equal(diff.added.length,0);assert.equal(diff.publicationApproved,false);
 assert.equal(diffSource([a],[]).missingNotDeleted.length,1);
});
test('invalid records ignored, duplicate upstream IDs reject whole batch',()=>{
 assert.equal(normalizeSource('hf-models',[{...hf,private:true}]).length,0);
 assert.throws(()=>normalizeSource('hf-models',[hf,hf]),/DUPLICATE/);
 assert.throws(()=>normalizeSource('modelsdev',{} ,{limit:0}),/INVALID_LIMIT/);
});
