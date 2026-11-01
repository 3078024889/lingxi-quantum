#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
function compile(path,imports={}){
 const output={exports:{}};const raw=fs.readFileSync(path,"utf8");
 const js=ts.transpileModule(raw,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 vm.runInNewContext(js,{exports:output.exports,module:output,require(id){if(id in imports)return imports[id];throw Error("UNKNOWN_MODULE:"+id)},Request,Response,Headers,Uint8Array,TextDecoder,Date,Error,Number,console});
 return output.exports;
}
const bounded=compile("lib/security/bounded-request-json.ts");
let writes=0,ownerChecks=0;
const id="d6d4433b-01c9-4af5-830f-347b058994fa";
const db={
 from(name){assert.equal(name,"sasi_projects");return {
  select(){return this},eq(){return this},maybeSingle:async()=>{ownerChecks++;return{data:{id},error:null}},
  update(patch){writes++;assert.equal(patch.title,"New title");return{eq(){return this},select(){return this},single:async()=>({data:{id,kind:"video",title:patch.title,language:"en",current_version:1,created_at:"a",updated_at:"b"},error:null})}}
 }}
};
const client={auth:{getUser:async()=>({data:{user:{id:"u1"}}})},from:()=>db.from("sasi_projects")};
const route=compile("app/api/sasi/projects/[id]/route.ts",{
 "next/server":{NextResponse:{json:(body,opts={})=>({body,status:opts.status||200})}},
 "@/lib/sasi/request-security":{isSameOriginMutation:()=>true},
 "@/lib/supabase/admin":{createAdminClient:()=>db,isSupabaseAdminConfigured:()=>true},
 "@/lib/supabase/server":{createClient:()=>client},
 "@/lib/security/bounded-request-json":bounded
});
const props={params:Promise.resolve({id})};
const request=(value,headers={})=>new Request("https://safe.example/api/sasi/projects/"+id,{method:"PATCH",headers:{"content-type":"application/json",...headers},body:typeof value==="string"?value:JSON.stringify(value)});
(async()=>{
 let r=await route.PATCH(request({title:"x".repeat(9000)}),props);
 assert.equal(r.status,413);assert.equal(r.body.error,"PROJECT_REQUEST_TOO_LARGE");
 r=await route.PATCH(request({title:"short"},{"content-length":"999999"}),props);
 assert.equal(r.status,413);
 for(const value of ["null","[]","oops","{}"]){
  r=await route.PATCH(request(value),props);
  assert.equal(r.status,400,"reject malformed: "+value);
 }
 assert.equal(writes,0,"invalid request must never update the project");
 r=await route.PATCH(request({title:" New    title "}),props);
 assert.equal(r.status,200);assert.equal(r.body.project.title,"New title");
 assert.equal(writes,1);assert(ownerChecks>0);
 console.log("SASI_PROJECT_PATCH_BOUNDS_GATE=PASS: streamed 8KiB limit, malformed JSON, null/array, valid owner update");
})().catch(e=>{console.error(e);process.exitCode=1});
