import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,cpSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
test("ingestion persists, deduplicates, refuses overwrite and exports historical observations",()=>{
 const root=mkdtempSync(join(tmpdir(),"ai-ingest-"));
 try{
  mkdirSync(join(root,"scripts"));for(const name of ["ai-market-ingest.mjs","ai-market-store-export.mjs","ai-market-snapshot-guard.mjs"])cpSync("scripts/"+name,join(root,"scripts",name));
  const env={...process.env,AI_MARKET_STORE_DIR:join(root,"store")};
  const run=(script,...args)=>spawnSync(process.execPath,["scripts/"+script,...args],{cwd:root,env,encoding:"utf8"});
  const doc={source:"https://openrouter.ai/api/v1/models",redistributionStatus:"review-required",observedAt:"2026-10-25T01:00:00Z",modelCount:1,models:[{id:"vendor/model",context_length:4096,pricing:{prompt:"0.000001",completion:null}}]};
  writeFileSync(join(root,"one.json"),JSON.stringify(doc));
  let r=run("ai-market-ingest.mjs","one.json");assert.equal(r.status,0,r.stderr);
  r=run("ai-market-ingest.mjs","one.json");assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/already-present/);
  writeFileSync(join(root,"changed.json"),JSON.stringify({...doc,models:[{...doc.models[0],pricing:{prompt:"0.000002",completion:null}}]}));
  r=run("ai-market-ingest.mjs","changed.json");assert.notEqual(r.status,0);assert.match(r.stderr,/Conflicting snapshot/);
  writeFileSync(join(root,"two.json"),JSON.stringify({...doc,observedAt:"2026-10-26T01:00:00Z"}));
  r=run("ai-market-ingest.mjs","two.json");assert.equal(r.status,0,r.stderr);
  r=run("ai-market-store-export.mjs");assert.equal(r.status,0,r.stderr);
  const history=JSON.parse(readFileSync(join(root,"store/history.json"),"utf8"));
  assert.equal(history.series["vendor/model"].length,2);assert.equal(history.publicationStatus,"internal-review-only");
  assert.equal(readdirSync(join(root,"store")).filter(x=>x.endsWith(".json")).length,3);
 }finally{rmSync(root,{recursive:true,force:true});}
});
