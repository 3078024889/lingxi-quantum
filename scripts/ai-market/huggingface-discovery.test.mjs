import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverHuggingFace,normalizeHubItem} from './huggingface-discovery.mjs';
test('valid model is a candidate, not ranked',()=>{
 const item=normalizeHubItem({id:'org/model',tags:['text-generation']},'models','2026-10-29T00:00:00Z');
 assert.equal(item.status,'candidate');assert.equal(item.sourceUrl,'https://huggingface.co/org/model');
});
test('spaces URL uses spaces prefix',()=>{
 const item=normalizeHubItem({id:'org/demo'},'spaces','2026-10-29T00:00:00Z');
 assert.equal(item.sourceUrl,'https://huggingface.co/spaces/org/demo');
});
test('reject invalid repository identifiers',()=>assert.equal(normalizeHubItem({id:'bad/path/extra'},'models','x'),null));
test('reject excessive batch size',async()=>await assert.rejects(discoverHuggingFace({limit:200}),/INVALID_LIMIT/));
test('upstream 429 does not invent data',async()=>await assert.rejects(discoverHuggingFace({fetcher:async()=>({ok:false,status:429})}),/HUB_UPSTREAM_429/));
test('candidate ingest never approves publication',async()=>{
 const result=await discoverHuggingFace({fetcher:async()=>({ok:true,json:async()=>[{id:'org/model'}]})});
 assert.equal(result.publicationApproved,false);assert.equal(result.candidates.length,1);
});
test('reject nonarray upstream result',async()=>await assert.rejects(discoverHuggingFace({fetcher:async()=>({ok:true,json:async()=>({error:'x'})})}),/INVALID_HUB_RESPONSE/));
