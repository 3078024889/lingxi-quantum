#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const id="4d7b808e-a311-4b97-954c-816b0ff1b8d2";
let guard={ok:true},writes=0;
const json=(body,opts={})=>({body,status:opts.status||200,headers:opts.headers||{}});
function compile(file,dependencies={}){
 const mod={exports:{}},src=fs.readFileSync(file,"utf8");
 const compiled=ts.transpileModule(src,{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(compiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,"syntax: "+file);
 vm.runInNewContext(compiled.outputText,{module:mod,exports:mod.exports,require(name){
  if(name in dependencies)return dependencies[name];throw Error("UNEXPECTED_IMPORT:"+name);
 },Request,Response,Headers,TextDecoder,TextEncoder,Uint8Array,Date,Error,Number,console});
 return mod.exports;
}
const bounded=compile("lib/security/bounded-request-json.ts");
const user={id:"user-1"};
const db={
 from(table){
  assert.equal(table,"sasi_conversation_threads");
  return {update(payload){writes++;return this},eq(){return this},select(){return this},maybeSingle:async()=>({data:{id},error:null})};
 }
};
const deps={
 "next/server":{NextResponse:{json}},
 "@/lib/supabase/server":{createClient:()=>({auth:{getUser:async()=>({data:{user}})}})},
 "@/lib/supabase/admin":{createAdminClient:()=>db},
 "@/lib/sasi/request-security":{isSameOriginMutation:()=>true},
 "@/lib/security/bounded-request-json":bounded,
 "@/lib/security/abuse-guard":{enforceAbuseGuard:async()=>guard},
 "@/lib/sasi/core/conversation-store":{saveConversationTurn:async()=>{writes++;}},
};
const history=compile("app/api/sasi/conversations/route.ts",deps);
const workspace=compile("app/api/sasi/conversations/workspace/route.ts",deps);
function req(body,headers={}){
 return new Request("https://local.test/api/sasi/conversations",{method:"POST",headers:{"content-type":"application/json",...headers},body:typeof body==="string"?body:JSON.stringify(body)});
}
const validHistory={threadId:id,requestId:id,question:"Question",answer:"Answer"};
const validWorkspace={threadId:id,workspace:{mode:"chat"}};
(async()=>{
 for(const [name,route,valid] of [["history",history,validHistory],["workspace",workspace,validWorkspace]]){
  writes=0;
  guard={ok:false,status:503,error:"ABUSE_GUARD_UNAVAILABLE"};
  let response=await route.POST(req(valid));
  assert.equal(response.status,503,name+" guard fail-closed must remain 503");
  assert.equal(response.body.error,"ABUSE_GUARD_UNAVAILABLE");
  guard={ok:false,status:429,error:"RATE_LIMITED"};
  response=await route.POST(req(valid));
  assert.equal(response.status,429);
  assert.equal(response.body.error,"RATE_LIMITED");
  assert.equal(writes,0,"blocked request must not write");
  guard={ok:true};
  response=await route.POST(req(valid,{"content-length":"900000"}));
  assert.equal(response.status,413,name+" oversized request");
  assert.equal(response.body.error,"REQUEST_TOO_LARGE");
  response=await route.POST(req("not valid json"));
  assert.equal(response.status,400,name+" invalid JSON");
  assert.equal(writes,0);
  response=await route.POST(req(valid));
  assert.equal(response.status,name==="history"?201:200,name+" valid request");
  assert.equal(response.body.ok,true);
  assert.equal(writes,1);
 }
 console.log("SASI_HISTORY_STATUS_GATE=PASS: 503 guard unavailable, 429 actual limit, 413 oversize, 400 malformed, valid writes");
})().catch(e=>{console.error(e);process.exitCode=1});
