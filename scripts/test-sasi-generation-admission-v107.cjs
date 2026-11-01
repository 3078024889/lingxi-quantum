#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict"),crypto=require("node:crypto");
function compile(file,imports={}){
 const out={exports:{}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{
  module:out,exports:out.exports,require(name){if(name in imports)return imports[name];throw Error("UNEXPECTED_IMPORT:"+name)},Request,Response,Headers,TextDecoder,TextEncoder,AbortController,crypto:crypto.webcrypto,console,process
 });
 return out.exports;
}
const parser=compile("lib/sasi-kernel/runtime/generation-request.ts");
const bounded=compile("lib/security/bounded-request-json.ts");
const parse=parser.parseSasiGenerationInput;
assert.equal(parse({kind:"video",prompt:"A short cinematic video",duration:8}).duration,8);
assert.equal(parse({kind:"image",prompt:"A sample image"}).kind,"image");
assert.equal(parse({kind:"video",prompt:"A sample clip",duration:"12"}).duration,12);
for(const bad of [
 null,[],{},{kind:"audio",prompt:"Hi"},{kind:"video",prompt:{}},
 {kind:"image",prompt:"x"},{kind:"image",prompt:"x".repeat(4001)},
 {kind:"video",prompt:"Valid",duration:1},{kind:"video",prompt:"Valid",duration:31},
 {kind:"video",prompt:"Valid",duration:"Infinity"},{kind:"video",prompt:"Valid",duration:6.5},
 {kind:"image",prompt:"Valid",style:"X".repeat(181)},{kind:"image",prompt:"Valid",ratio:"4:3"}
])assert.throws(()=>parse(bad),/INVALID_GENERATION_REQUEST/);
let authenticated=true,origin=true,guard={ok:true},writes=0,executions=0,taskFails=0;
const route=compile("app/api/sasi/generation/submit/route.ts",{
 "next/server":{NextResponse:{json:(body,opts={})=>({body,status:opts.status||200,headers:opts.headers})}},
 "@/lib/supabase/server":{createClient:()=>({auth:{getUser:async()=>({data:{user:authenticated?{id:"user-1"}:null}})}})},
 "@/lib/supabase/admin":{createAdminClient:()=>({id:"admin"})},
 "@/lib/sasi/request-security":{isSameOriginMutation:()=>origin},
 "@/lib/security/bounded-request-json":bounded,
 "@/lib/security/abuse-guard":{enforceAbuseGuard:async()=>guard},
 "@/lib/sasi-kernel/runtime/generation-request":parser,
 "@/lib/sasi-kernel/runtime/plan":{buildSasiExecutionPlan:()=>({nodes:[{nodeId:"n1"}]})},
 "@/lib/sasi-kernel/runtime/task-store":{createRuntimeTask:async()=>{writes++},failRuntimeTask:async()=>{taskFails++}},
 "@/lib/sasi-kernel/runtime/executor":{executeSasiPlan:async()=>{executions++;return {status:"succeeded",output:{kind:"fixture"}}}}
});
const req=(body,headers={})=>new Request("https://test.invalid/api/sasi/generation/submit",{method:"POST",headers:{"content-type":"application/json",...headers},body:JSON.stringify(body)});
(async()=>{
 origin=false;assert.equal((await route.POST(req({kind:"video",prompt:"Scene",duration:8}))).status,403);origin=true;
 authenticated=false;assert.equal((await route.POST(req({kind:"video",prompt:"Scene",duration:8}))).status,401);authenticated=true;
 assert.equal((await route.POST(req({kind:"video",prompt:"Scene",duration:8},{"content-length":"20000"}))).status,413);
 assert.equal((await route.POST(req({kind:"video",prompt:"Scene",duration:-1}))).status,400);
 guard={ok:false,status:429,error:"RATE_LIMITED"};
 assert.equal((await route.POST(req({kind:"video",prompt:"Scene",duration:8}))).status,429);
 assert.equal(writes,0);assert.equal(executions,0);
 guard={ok:false,status:503,error:"ABUSE_GUARD_UNAVAILABLE"};
 assert.equal((await route.POST(req({kind:"video",prompt:"Scene",duration:8}))).status,503);
 guard={ok:true};
 const good=await route.POST(req({kind:"video",prompt:"Scene",duration:8,ratio:"16:9"}));
 assert.equal(good.status,200);assert.equal(good.body.ok,true);
 assert.equal(writes,1);assert.equal(executions,1);assert.equal(taskFails,0);
 assert.equal(good.headers["Cache-Control"],"private, no-store");
 console.log("SASI_GENERATION_ADMISSION_GATE=PASS: strict input, 12KB bounded upload, origin/auth/quotas precede worker, no unauthorized writes");
})().catch(error=>{console.error(error);process.exitCode=1});
