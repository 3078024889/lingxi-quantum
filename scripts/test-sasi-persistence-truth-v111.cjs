#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),crypto=require("node:crypto");
const src=fs.readFileSync("lib/sasi-kernel/runtime/executor.ts","utf8");
const compiled=ts.transpileModule(src,{fileName:"executor.ts",reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}); 
assert.equal((compiled.diagnostics||[]).filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
let workerResult="succeeded", workerCalls=0;
const sandbox={exports:{}};
vm.runInNewContext(compiled.outputText,{
 module:sandbox,exports:sandbox.exports,crypto:crypto.webcrypto,Date,Promise,Error,Math,String,Number,
 require(name){
  if(name==="server-only")return {};
  if(name==="@/lib/sasi-kernel/worker/client")return {submitWorkerTask:async()=>{workerCalls++;return {status:workerResult,output:{name:"fixture"}}}};
  throw Error("UNKNOWN_DEPENDENCY:"+name);
 }
},{timeout:2000});
const {executeSasiPlan}=sandbox.exports;
const plan={nodes:[{nodeId:"n1",capabilityId:"video-render",fallbackIds:[],maxRetries:0}]};
function fakeDb(failOn){
 const data={writes:[],events:[]};
 return {data,from(table){
  return {
   insert(payload){assert.equal(table,"sasi_task_events");data.events.push(payload);return Promise.resolve({error:null})},
   update(patch){return {
    eq(field,value){if(field==="user_id")assert.equal(value,"u1");return this},
    then(done,fail){data.writes.push({table,patch});const broken=table==="sasi_tasks"&&failOn(patch);return Promise.resolve({error:broken?{code:"TEST_DB_DENIED"}:null}).then(done,fail)}
   }}
  };
 }};
}
(async()=>{
 workerCalls=0;
 let db=fakeDb(()=>false),out=await executeSasiPlan(db,{taskId:"t1",userId:"u1",plan,input:{prompt:"sample"}});
 assert.equal(out.status,"succeeded");
 assert.equal(workerCalls,1);
 assert.equal(db.data.events.at(-1).event_type,"task.succeeded");
 assert(db.data.writes.some(x=>x.table==="sasi_tasks"&&x.patch.state==="succeeded"));
 db=fakeDb(p=>p.progress===1&&p.state===undefined);
 await assert.rejects(executeSasiPlan(db,{taskId:"t1",userId:"u1",plan,input:{prompt:"sample"}}),/SASI_TASK_UPDATE_FAILED:TEST_DB_DENIED/);
 assert.equal(db.data.events.some(e=>e.event_type==="task.succeeded"),false,"do not emit success after progress persistence failure");
 db=fakeDb(p=>p.state==="succeeded");
 await assert.rejects(executeSasiPlan(db,{taskId:"t1",userId:"u1",plan,input:{prompt:"sample"}}),/SASI_TASK_UPDATE_FAILED:TEST_DB_DENIED/);
 assert.equal(db.data.events.some(e=>e.event_type==="task.succeeded"),false,"do not emit success after final state write failure");
 workerResult="failed";
 db=fakeDb(()=>false);
 out=await executeSasiPlan(db,{taskId:"t1",userId:"u1",plan,input:{prompt:"sample"}});
 assert.equal(out.status,"failed");
 assert(db.data.writes.some(x=>x.table==="sasi_tasks"&&x.patch.state==="failed"));
 db=fakeDb(p=>p.state==="failed");
 await assert.rejects(executeSasiPlan(db,{taskId:"t1",userId:"u1",plan,input:{prompt:"sample"}}),/SASI_TASK_UPDATE_FAILED:TEST_DB_DENIED/);
 console.log("SASI_PERSISTENCE_TRUTH_GATE=PASS: completed, progress-failed, final-failed, and worker-failed branches are honest");
})().catch(e=>{console.error(e);process.exitCode=1});
