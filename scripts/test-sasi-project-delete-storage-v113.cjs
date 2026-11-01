#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript"),assert=require("node:assert/strict");
const path="app/api/sasi/projects/[id]/route.ts",s=fs.readFileSync(path,"utf8");
const js=ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
let failAssets=false,failDeliveries=false,deletions=0,removals=0;
const projectId="62bd88f4-f05f-4b5d-9bc8-5935806f2c99";
const client={auth:{getUser:async()=>({data:{user:{id:"owner-1"}}})},from(name){
 assert.equal(name,"sasi_projects");
 return {select(){return this},eq(){return this},maybeSingle:async()=>({data:{id:projectId,user_id:"owner-1"},error:null})};
}};
const admin={
 from(name){
  const builder={
   select(){return this},
   eq(field,value){if(field==="user_id")assert.equal(value,"owner-1");return this},
   in(){return this},
   limit:async()=>({data:[],error:null}),
   then(done,fail){
    let error=name==="sasi_assets"&&failAssets||name==="sasi_deliveries"&&failDeliveries?{code:"DB_READ_FAILED"}:null;
    const data=name==="sasi_assets"?[{bucket_id:"private-uploads",object_path:"owner-1/a.png"}]:name==="sasi_deliveries"?[]:[];
    return Promise.resolve({data,error}).then(done,fail);
   },
   delete(){
    assert.equal(name,"sasi_projects");
    return{eq(field,value){if(field==="user_id")assert.equal(value,"owner-1");return this},
     then(done,fail){deletions++;return Promise.resolve({error:null}).then(done,fail)}};
   }
  };
  return builder;
 },
 storage:{from(bucket){assert.equal(bucket,"private-uploads");return {remove:async paths=>{removals++;assert.deepEqual(Array.from(paths),["owner-1/a.png"]);return {error:null}}}}}
};
const moduleValue={exports:{}};
const mock={
 "next/server":{NextResponse:{json:(body,opts={})=>({status:opts.status||200,body})}},
 "@/lib/sasi/request-security":{isSameOriginMutation:()=>true},
 "@/lib/security/bounded-request-json":{boundedRequestJson:async()=>({})},
 "@/lib/supabase/admin":{createAdminClient:()=>admin,isSupabaseAdminConfigured:()=>true},
 "@/lib/supabase/server":{createClient:()=>client}
};
vm.runInNewContext(js,{module:moduleValue,exports:moduleValue.exports,require(id){if(id in mock)return mock[id];throw Error("MOCK_MISSING:"+id)},Request,Date,Error,Map,Promise},{timeout:2000});
const run=()=>moduleValue.exports.DELETE(new Request("https://example.invalid/api/sasi/projects/"+projectId,{method:"DELETE"}),{params:Promise.resolve({id:projectId})});
(async()=>{
 failAssets=true;
 let res=await run();assert.equal(res.status,503);assert.equal(res.body.error,"PROJECT_STORAGE_INVENTORY_FAILED");
 assert.equal(deletions,0);assert.equal(removals,0);
 failAssets=false;failDeliveries=true;
 res=await run();assert.equal(res.status,503);assert.equal(deletions,0);assert.equal(removals,0);
 failDeliveries=false;
 res=await run();assert.equal(res.status,200);assert.equal(res.body.deleted,true);
 assert.equal(deletions,1);assert.equal(removals,1);
 console.log("SASI_DELETE_STORAGE_INVENTORY_GATE=PASS: both failed inventory queries abort deletion; successful inventory permits cleanup");
})().catch(e=>{console.error(e);process.exitCode=1});
