import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,cpSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
test("health check rejects stale history and accepts recent internal data",()=>{
 const root=mkdtempSync(join(tmpdir(),"ai-store-health-"));
 try{
  mkdirSync(join(root,"scripts"));cpSync("scripts/ai-market-store-health.mjs",join(root,"scripts/ai-market-store-health.mjs"));
  const dir=join(root,"store");mkdirSync(dir);
  const date=new Date().toISOString(),day=date.slice(0,10);
  writeFileSync(join(dir,"openrouter-"+day+".json"),"{}");
  const write=(observedAt)=>writeFileSync(join(dir,"history.json"),JSON.stringify({source:"openrouter",publicationStatus:"internal-review-only",observations:[{observedAt}],series:{"vendor/model":[{observedAt,prompt:0.00001,completion:null}]}}));
  const run=()=>spawnSync(process.execPath,["scripts/ai-market-store-health.mjs"],{cwd:root,env:{...process.env,AI_MARKET_STORE_DIR:dir},encoding:"utf8"});
  write(date);let r=run();assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/"healthy"/);
  write("2020-01-01T00:00:00Z");r=run();assert.notEqual(r.status,0);assert.match(r.stderr,/stale or invalid/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
