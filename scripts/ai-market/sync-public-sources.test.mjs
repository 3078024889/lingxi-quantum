import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fetchJsonBounded,collectSource,commitPrivateSource,runSync} from './sync-public-sources.mjs';
const hf=[{id:'Qwen/Qwen3-8B',downloads:37,likes:2,sha:'abc',lastModified:'2026-10-30T02:00:00Z'}];
const fake=async()=>new Response(JSON.stringify(hf),{status:200,headers:{'content-type':'application/json'}});
test('official endpoint allowlist and correct raw evidence hash',async()=>{
 const r=await fetchJsonBounded('hf-models',{fetcher:fake});assert.ok(r.digest.match(/^[a-f0-9]{64}$/));
 await assert.rejects(()=>fetchJsonBounded('evil',{fetcher:fake}),/UNKNOWN_SOURCE/);
});
test('source failure is recorded and never silently reported successful',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'market-test-'));
 try{const result=await runSync({sources:['hf-models','hf-spaces'],dir,fetcher:async u=>{
  if(String(u).includes('spaces'))throw Error('blocked');
  return fake();
 }});
 assert.equal(result.sources.length,1);assert.equal(result.errors.length,1);
 const persisted=JSON.parse(await readFile(join(dir,'sync-report.json'),'utf8'));
 assert.equal(persisted.publicationApproved,false);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('retrieved candidate evidence persists with no approval and no fake site visits',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'market-test-'));
 try{const r=await collectSource('hf-models',{dir,fetcher:fake});
 assert.equal(r.count,1);
 const raw=JSON.parse(await readFile(join(dir,'hf-models.json'),'utf8'));
 assert.equal(raw.records[0].reviewStatus,'candidate');
 assert.equal(raw.records[0].facts.downloads,37);
 assert.equal(raw.records[0].facts.monthlySiteVisits,undefined);
 }finally{await rm(dir,{recursive:true,force:true});}
});
test('database sync is bounded to batches of 100 and acknowledges only nonpublished records',async()=>{
 const rows=Array.from({length:205},(_,i)=>({upstreamId:'a/'+i,source:'hf-models',contentSha256:'a'.repeat(64),sourceUrl:'https://huggingface.co/a/'+i,reviewStatus:'candidate',facts:{}}));
 const seen=[];
 const report=await commitPrivateSource('hf-models',rows,{url:'https://example.supabase.co',key:'test-secret',fetcher:async(u,options)=>{
  const obj=JSON.parse(options.body);seen.push(obj.p_records.length);
  return new Response(JSON.stringify({source:'hf-models',seen:obj.p_records.length,inserted:obj.p_records.length,changed:0,unchanged:0,publicationApproved:false}),{status:200,headers:{'content-type':'application/json'}});
 }});
 assert.deepEqual(seen,[100,100,5]);assert.equal(report.inserted,205);
});
