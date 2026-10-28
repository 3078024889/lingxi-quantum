import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,cpSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
test("manifest runs with a valid isolated snapshot",()=>{
const root=mkdtempSync(join(tmpdir(),"ai-market-test-"));
try{
 mkdirSync(join(root,"scripts"),{recursive:true});
 cpSync("scripts/ai-market-snapshot-manifest.mjs",join(root,"scripts/ai-market-snapshot-manifest.mjs"));
 cpSync("scripts/ai-market-snapshot-guard.mjs",join(root,"scripts/ai-market-snapshot-guard.mjs"));
 mkdirSync(join(root,"reports/ai-market"),{recursive:true});
 const doc={source:"https://openrouter.ai/api/v1/models",observedAt:new Date().toISOString(),redistributionStatus:"review-required",modelCount:1,models:[{id:"vendor/model",context_length:4096,pricing:{prompt:"0",completion:"0.000002"}}]};
 writeFileSync(join(root,"reports/ai-market/openrouter-"+doc.observedAt.slice(0,10)+".json"),JSON.stringify(doc));
 const result=spawnSync(process.execPath,["scripts/ai-market-snapshot-manifest.mjs"],{cwd:root,encoding:"utf8"});
 assert.equal(result.status,0,result.stderr);const m=JSON.parse(readFileSync(join(root,"reports/ai-market/manifest.json"),"utf8"));assert.equal(m.snapshots.length,1);assert.equal(m.publicationStatus,"internal-review-only");
}finally{rmSync(root,{recursive:true,force:true});}
});
