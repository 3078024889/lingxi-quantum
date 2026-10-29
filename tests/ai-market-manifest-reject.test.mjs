import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,rmSync,cpSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
const root=mkdtempSync(join(tmpdir(),"ai-market-invalid-"));
try{
 mkdirSync(join(root,"scripts"),{recursive:true});
 cpSync("scripts/ai-market-snapshot-manifest.mjs",join(root,"scripts/ai-market-snapshot-manifest.mjs"));
 cpSync("scripts/ai-market-snapshot-guard.mjs",join(root,"scripts/ai-market-snapshot-guard.mjs"));
 mkdirSync(join(root,"reports/ai-market"),{recursive:true});
 writeFileSync(join(root,"reports/ai-market/openrouter-2026-10-27.json"),JSON.stringify({source:"unknown",observedAt:"2020-01-01",modelCount:0,models:[]}));
 const result=spawnSync(process.execPath,["scripts/ai-market-snapshot-manifest.mjs"],{cwd:root,encoding:"utf8"});
 test("manifest rejects invalid upstream snapshots",()=>{assert.notEqual(result.status,0);assert.match(result.stderr,/unexpected source|invalid or stale timestamp/);});
}finally{rmSync(root,{recursive:true,force:true});}
