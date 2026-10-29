import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';import{tmpdir}from'node:os';import{join}from'node:path';
import {createBatch,saveBatch,createEvidence}from'./data-center-batch.mjs';
test('official model source stores only candidates',async()=>{
 const batch=await createBatch({source:'huggingface-models',fetcher:async()=>({ok:true,json:async()=>[{id:'team/model'}]})});
 assert.equal(batch.records.length,1);assert.equal(batch.records[0].status,'candidate');assert.equal(batch.publicationApproved,false);
});
test('evidence hashes are sha256',()=>assert.match(createEvidence([{id:'x',source:'x',sourceUrl:'https://a',observedAt:'now'}])[0].sha256,/^[0-9a-f]{64}$/));
test('invalid source rejected',async()=>assert.rejects(createBatch({source:'untrusted'}),/UNKNOWN_SOURCE/));
test('snapshot persistent and deduplicated',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lingxi-a-'));
 try{
  const file=join(dir,'a.json'),fetcher=async()=>({ok:true,json:async()=>[{id:'team/model'}]});
  const batch=await createBatch({fetcher});await saveBatch({file,batch});await saveBatch({file,batch});
  const saved=JSON.parse(await readFile(file,'utf8'));assert.equal(saved.records.length,1);assert.equal(saved.publicationApproved,false);
 }finally{await rm(dir,{recursive:true,force:true});}
});
