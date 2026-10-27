import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,cpSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
test("audit builds per-model chronological observations from two snapshots",()=>{
 const root=mkdtempSync(join(tmpdir(),"ai-series-"));
 try{
  mkdirSync(join(root,"scripts"));mkdirSync(join(root,"reports/ai-market"),{recursive:true});
  for(const f of ["ai-market-snapshot-audit.mjs","ai-market-snapshot-guard.mjs"])cpSync("scripts/"+f,join(root,"scripts",f));
  for(const [date,price] of [["2026-10-25","0.000001"],["2026-10-26","0.0000005"]]){
   const data={source:"https://openrouter.ai/api/v1/models",observedAt:date+"T01:00:00Z",redistributionStatus:"review-required",modelCount:1,models:[{id:"vendor/model",context_length:8192,pricing:{prompt:price,completion:null}}]};
   writeFileSync(join(root,"reports/ai-market/openrouter-"+date+".json"),JSON.stringify(data));
  }
  const result=spawnSync(process.execPath,["scripts/ai-market-snapshot-audit.mjs"],{cwd:root,encoding:"utf8"});
  assert.equal(result.status,0,result.stderr);
  const output=JSON.parse(readFileSync(join(root,"reports/ai-market/history-audit.json"),"utf8"));
  assert.equal(output.observations.length,2);
  assert.deepEqual(output.series["vendor/model"].map(x=>x.prompt),[0.000001,0.0000005]);
  assert.equal(output.publicationStatus,"internal-review-only");
 }finally{rmSync(root,{recursive:true,force:true});}
});
