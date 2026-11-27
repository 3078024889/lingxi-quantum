import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const source=readFileSync(new URL("../lib/tools/media/free-acceptance.ts",import.meta.url),"utf8");
function gate({enabled=true,user={id:"signed-in-user"},guard={ok:true}}={}){
 const exports={},calls=[];
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{
  exports,Set,process:{env:{NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE:String(enabled)}},
  require:name=>name==="server-only"?{}:name.endsWith("supabase/server")?{createClient:()=>({auth:{getUser:async()=>{calls.push("auth");return {data:{user},error:null}}}})}:
   {enforceAbuseGuard:async(req,options)=>{calls.push(options);return guard}}
 });
 return {run:exports.authorizeFreeMediaAcceptance,calls};
}
test("disabled acceptance leaves paid delivery unchanged",async()=>{
 const g=gate({enabled:false});assert.equal(await g.run({},"video-dubbing"),null);assert.equal(g.calls.length,0);
});
test("free media requires an authenticated account and valid tool",async()=>{
 const g=gate({user:null});assert.equal((await g.run({},"video-dubbing")).status,401);
 const invalid=gate();assert.equal((await invalid.run({},"unknown-tool")).status,400);assert.equal(invalid.calls.length,0);
});
test("free media retains account and IP abuse protection without a daily receipt",async()=>{
 const g=gate();assert.equal((await g.run({},"video-dubbing")).ok,true);
 const guard=g.calls[1];assert.equal(guard.userId,"signed-in-user");assert.equal(guard.scope,"media-acceptance");assert(guard.ipLimit>guard.accountLimit);
 const failed=gate({guard:{ok:false,status:503,error:"ABUSE_GUARD_UNAVAILABLE"}});assert.equal((await failed.run({},"video-translate")).status,503);
});
