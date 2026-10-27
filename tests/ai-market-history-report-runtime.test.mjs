import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,cpSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
test("historical price report compares observed costs and rejects reversed dates",()=>{
 const dir=mkdtempSync(join(tmpdir(),"ai-history-"));
 try{
  mkdirSync(join(dir,"scripts"));mkdirSync(join(dir,"reports/ai-market"),{recursive:true});
  for(const f of ["ai-market-history-report.mjs","ai-market-snapshot-guard.mjs"])cpSync("scripts/"+f,join(dir,"scripts",f));
  const base={source:"https://openrouter.ai/api/v1/models",redistributionStatus:"review-required",modelCount:1,models:[{id:"vendor/model",context_length:4096,pricing:{prompt:"0.000001",completion:"0.000002"}}]};
  writeFileSync(join(dir,"old.json"),JSON.stringify({...base,observedAt:"2026-10-25T00:00:00Z"}));
  writeFileSync(join(dir,"new.json"),JSON.stringify({...base,observedAt:"2026-10-26T00:00:00Z",models:[{...base.models[0],pricing:{prompt:"0.0000005",completion:"0.000002"}}]}));
  const run=(a,b)=>spawnSync(process.execPath,["scripts/ai-market-history-report.mjs",a,b],{cwd:dir,encoding:"utf8"});
  const ok=run("old.json","new.json");assert.equal(ok.status,0,ok.stderr);
  const report=JSON.parse(readFileSync(join(dir,"reports/ai-market/price-changes.json"),"utf8"));
  assert.equal(report.changedPrices,1);assert.equal(report.changes[0].changePct,-50);
  assert.equal(report.publicationStatus,"internal-review-only");
  const bad=run("new.json","old.json");assert.notEqual(bad.status,0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
