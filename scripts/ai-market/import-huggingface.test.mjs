import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,rm,readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {runCandidateImport} from './import-huggingface.mjs';
test('end-to-end import does not publish',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'lingxi-hf-import-'));
 try{
  const file=join(dir,'items.json');
  const fetcher=async()=>({ok:true,json:async()=>[{id:'org/model'}]});
  const first=await runCandidateImport({file,fetcher});
  const second=await runCandidateImport({file,fetcher});
  assert.equal(first.stats.added,1);
  assert.equal(second.stats.total,1);
  assert.equal(second.publicationApproved,false);
  assert.equal(JSON.parse(await readFile(file,'utf8'))[0].status,'candidate');
 }finally{await rm(dir,{recursive:true,force:true});}
});
