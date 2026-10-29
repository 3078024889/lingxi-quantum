import test from'node:test';import assert from'node:assert/strict';import{candidateFromModel,collect}from'./fetch-hf-candidates.mjs';
test('public metadata is never elevated to verified market data',()=>{const c=candidateFromModel({id:'team/model',downloads:100,likes:4});assert.equal(c.status,'candidate');assert.equal(c.verification,'public_metadata_unreviewed');assert.equal(c.metadata.downloads,100)});
test('private or malformed model repositories excluded',()=>{assert.equal(candidateFromModel({id:'team/private',private:true}),null);assert.equal(candidateFromModel({id:'../secret'}),null)});
test('bounded official API request',async()=>{let host='';const r=await collect({limit:2,fetcher:async url=>{host=url.hostname;return{ok:true,json:async()=>[{id:'team/model'}]}}});assert.equal(host,'huggingface.co');assert.equal(r.candidates.length,1);assert.equal(r.candidates[0].status,'candidate')});
test('limit rejects large jobs on low RAM machine',async()=>await assert.rejects(collect({limit:100000}),/INVALID_LIMIT/));

test('network TLS resets produce actionable error rather than an unhandled exception',async()=>{
 let attempts=0;
 await assert.rejects(collect({fetcher:async()=>{attempts++;const error=Error('fetch failed');error.cause={code:'ECONNRESET'};throw error;}}),/HF_NETWORK_UNAVAILABLE: ECONNRESET/);
 assert.equal(attempts,3);
});
