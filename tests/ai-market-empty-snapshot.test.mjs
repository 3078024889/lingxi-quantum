import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,cpSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
const root=mkdtempSync(join(tmpdir(),"ai-market-empty-"));
try{
 mkdirSync(join(root,"scripts"),{recursive:true});
 cpSync("scripts/ai-market-snapshot-manifest.mjs",join(root,"scripts/ai-market-snapshot-manifest.mjs"));
 cpSync("scripts/ai-market-snapshot-guard.mjs",join(root,"scripts/ai-market-snapshot-guard.mjs"));
 const run=spawnSync(process.execPath,["scripts/ai-market-snapshot-manifest.mjs"],{cwd:root,encoding:"utf8"});
 test("empty snapshot folder fails rather than reporting success",()=>{
  assert.notEqual(run.status,0);
  assert.match(run.stderr,/No model snapshots found/);
 });
}finally{rmSync(root,{recursive:true,force:true});}
