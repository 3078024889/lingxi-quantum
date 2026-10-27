import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,cpSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
test("health validates source snapshots, rejects stale and corrupted history",()=>{
 const root=mkdtempSync(join(tmpdir(),"ai-store-health-"));
 try{
  mkdirSync(join(root,"scripts"));for(const f of ["ai-market-store-health.mjs","ai-market-snapshot-guard.mjs"])cpSync("scripts/"+f,join(root,"scripts",f));
  const dir=join(root,"store");mkdirSync(dir);
  const date=new Date().toISOString(),day=date.slice(0,10);
  const doc={source:"https://openrouter.ai/api/v1/models",redistributionStatus:"review-required",observedAt:date,modelCount:1,models:[{id:"vendor/model",context_length:4096,pricing:{prompt:"0.000001",completion:null}}]};
  writeFileSync(join(dir,"openrouter-"+day+".json"),JSON.stringify(doc));
  const write=(observedAt,modelCount=1)=>writeFileSync(join(dir,"history.json"),JSON.stringify({source:"openrouter",publicationStatus:"internal-review-only",observations:[{observedAt,modelCount}],series:{"vendor/model":[{observedAt,prompt:0.000001,completion:null}]}}));
  const run=()=>spawnSync(process.execPath,["scripts/ai-market-store-health.mjs"],{cwd:root,env:{...process.env,AI_MARKET_STORE_DIR:dir},encoding:"utf8"});
  write(date);let r=run();assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/healthy/);
  write(date,2);r=run();assert.notEqual(r.status,0);assert.match(r.stderr,/mismatch/);
  write("2020-01-01T00:00:00Z");r=run();assert.notEqual(r.status,0);assert.match(r.stderr,/stale or invalid/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
