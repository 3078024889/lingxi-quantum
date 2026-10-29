import test from 'node:test';
import assert from 'node:assert/strict';
import {importCandidatesToSupabase} from './supabase-candidate-import.mjs';
const row=(name)=>({candidateKey:'hf:models:org/'+name,source:'huggingface_hub',sourceUrl:'https://huggingface.co/org/'+name,kind:'model_repository',name,publisher:'org',status:'candidate',upstreamId:'org/'+name});
function fakeClient(existing=[]){
 const operations=[];
 return {operations,from(){
  return {
   select(){return {in:async()=>({data:existing,error:null})};},
   insert(x){operations.push(['insert',x]);return Promise.resolve({error:null});},
   update(x){operations.push(['update',x]);return {eq(){return {eq:async()=>({error:null})}}};},
  };
 }};
}
test('dry run makes no writes',async()=>{
 const client=fakeClient();
 const x=await importCandidatesToSupabase({candidates:[row('one')],client});
 assert.equal(x.inserted,1);assert.equal(client.operations.length,0);
});
test('commit inserts candidates, not verified products',async()=>{
 const client=fakeClient();
 const x=await importCandidatesToSupabase({candidates:[row('one')],client,dryRun:false});
 assert.equal(x.inserted,1);assert.equal(client.operations[0][1][0].verification_status,'candidate');
});
test('never updates reviewed records',async()=>{
 const client=fakeClient([{candidate_key:'hf:models:org/one',verification_status:'verified'}]);
 const x=await importCandidatesToSupabase({candidates:[row('one')],client,dryRun:false});
 assert.equal(x.skipped,1);assert.equal(client.operations.length,0);
});
test('rejects missing database client',async()=>await assert.rejects(importCandidatesToSupabase({candidates:[row('one')]}),/CLIENT_REQUIRED/));
test('rejects invalid upstream record before database call',async()=>{
 const client=fakeClient();
 await assert.rejects(importCandidatesToSupabase({candidates:[{...row('one'),sourceUrl:'https://other.com'}],client}),/SOURCE_URL_MISMATCH/);
 assert.equal(client.operations.length,0);
});
