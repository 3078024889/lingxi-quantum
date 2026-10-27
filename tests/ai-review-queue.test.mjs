import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
const run=(records)=>{const dir=mkdtempSync(join(tmpdir(),"ai-review-"));const input=join(dir,"in.json"),output=join(dir,"out.json");try{writeFileSync(input,JSON.stringify(records));const r=spawnSync(process.execPath,["scripts/ai-discovery/review-queue.mjs",input,output],{encoding:"utf8"});return {code:r.status,output:r.status===0?JSON.parse(readFileSync(output,"utf8")):null};}finally{rmSync(dir,{recursive:true,force:true});}};
const pending={id:"test-1",name:"Test Product",official_url:"https://example.com",status:"pending"};
test("pending review remains pending",()=>{const r=run([pending]);assert.equal(r.code,0);assert.equal(r.output[0].status,"pending");});
test("cannot approve without reviewer evidence",()=>assert.notEqual(run([{...pending,status:"approved"}]).code,0));
test("rejects unsafe URL",()=>assert.notEqual(run([{...pending,official_url:"http://127.0.0.1"}]).code,0));
test("rejects duplicate ids",()=>assert.notEqual(run([pending,pending]).code,0));
test("approved decision records reviewer and date",()=>{const r=run([{...pending,status:"approved",reviewer:"editor",reviewed_at:"2026-10-26T00:00:00Z"}]);assert.equal(r.code,0);assert.equal(r.output[0].reviewer,"editor");});

test("rejects loopback, private and IPv6 literal hosts",()=>{for(const host of ["https://127.0.0.1","https://172.16.0.1","https://[::1]","https://metadata.internal"])assert.notEqual(run([{...pending,official_url:host}]).code,0,host);});
test("rejects invalid URL gracefully",()=>assert.notEqual(run([{...pending,official_url:"not-a-url"}]).code,0));

test("never overwrites an existing review export",()=>{const dir=mkdtempSync(join(tmpdir(),"ai-review-"));try{const input=join(dir,"in.json"),output=join(dir,"out.json");writeFileSync(input,JSON.stringify([pending]));writeFileSync(output,"KEEP_EXISTING");const r=spawnSync(process.execPath,["scripts/ai-discovery/review-queue.mjs",input,output],{encoding:"utf8"});assert.notEqual(r.status,0);assert.equal(readFileSync(output,"utf8"),"KEEP_EXISTING");}finally{rmSync(dir,{recursive:true,force:true});}});
