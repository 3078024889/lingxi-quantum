import test from 'node:test';import assert from 'node:assert/strict';import{answerVerifiedQuestion}from'./integration-read.mjs';
const data={entities:[{id:'product-1',name:'Real-reviewed tool',status:'verified',entity_type:'product',official_website:'https://example.org/tool',verified_by:'admin',verified_at:'2026-10-29T10:00:00Z'}],
capabilities:[{entity_id:'product-1',capability_key:'video-subtitles',evidence_id:1,verified_by:'admin',verified_at:'2026-10-29T10:00:00Z'}],
evidence:[{id:1,checked:true,source_url:'https://example.org/capabilities'}]};
test('verified evidence can drive search',()=>assert.equal(answerVerifiedQuestion('生成字幕',data).results.length,1));
test('unchecked evidence blocks recommendation',()=>assert.equal(answerVerifiedQuestion('生成字幕',{...data,evidence:[{...data.evidence[0],checked:false}]}).results.length,0));
test('unverified entity blocks recommendation',()=>assert.equal(answerVerifiedQuestion('生成字幕',{...data,entities:[{...data.entities[0],status:'candidate'}]}).results.length,0));
test('verified repo cannot masquerade as a product',()=>assert.equal(answerVerifiedQuestion('生成字幕',{...data,entities:[{...data.entities[0],entity_type:'model'}]}).results.length,0));
test('pricing not inferred',()=>assert.equal(answerVerifiedQuestion('生成字幕',data).results[0].price,null));
