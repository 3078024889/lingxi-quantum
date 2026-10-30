import test from 'node:test';import assert from 'node:assert/strict';
import {classifyRedirect,readBoundedResponse,unmodifiedState} from '../lib/evidence-http.mjs';
test('redirect resolved but never automatically followed',()=>{
 assert.deepEqual(classifyRedirect('https://a.example/pricing','/plans'),{status:'REDIRECT_REVIEW',reason:'SAME_HOST_REVIEW',target:'https://a.example/plans'});
 assert.equal(classifyRedirect('https://a.example','http://a.example').reason,'UNSAFE_TARGET');
 assert.equal(classifyRedirect('https://a.example','https://evil.example').reason,'CROSS_HOST_REVIEW');
});
test('bounded byte stream stops oversized responses without Content-Length',async()=>{
 const r=new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(3));c.enqueue(new Uint8Array(3));c.close()}}));
 assert.equal((await readBoundedResponse(r,4)).status,'TOO_LARGE');
});
test('stream accepts small utf8 and rejects advertised large',async()=>{
 let x=await readBoundedResponse(new Response('中文'),20);assert.equal(x.raw,'中文');
 x=await readBoundedResponse(new Response('12345',{headers:{'content-length':'999'}}),20);assert.equal(x.status,'TOO_LARGE');
});
test('304 requires a previous content hash',()=>{
 assert.equal(unmodifiedState({}),'NOT_MODIFIED_WITHOUT_BASELINE');assert.equal(unmodifiedState({hash:'abc'}),'UNCHANGED');
});
