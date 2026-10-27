import test from "node:test";
import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {mkdtempSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
test("release audit stays blocked without verified external gates",()=>{
 const root=mkdtempSync(join(tmpdir(),"ai-release-"));
 try{
  const output=join(root,"audit.json");
  const r=spawnSync(process.execPath,["scripts/ai-market-release-audit.mjs"],{encoding:"utf8",env:{...process.env,AI_MARKET_RELEASE_REPORT:output}});
  assert.equal(r.status,0,r.stderr);
  const report=JSON.parse(readFileSync(output,"utf8"));
  assert.equal(report.ready,false);
  assert.equal(report.publication,"review-only");
  assert.ok(report.blockers.some(x=>x.includes("publicRedistributionRights")));
  const strict=spawnSync(process.execPath,["scripts/ai-market-release-audit.mjs","--require-release"],{encoding:"utf8",env:{...process.env,AI_MARKET_RELEASE_REPORT:output}});
  assert.equal(strict.status,2,strict.stderr);
 }finally{rmSync(root,{recursive:true,force:true});}
});
