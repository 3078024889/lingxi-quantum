const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),ts=require("typescript");
const source=fs.readFileSync("lib/tools/media/paid-guard.ts","utf8");
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const id="9df2140d-f934-47ab-9ebc-579627052865";
let paid=true,owner="test-user",serviceError=null,limiterError=null,limiterAllowed=true,rpcCalls=[],filters=[];
const query={
 select(){return this},
 eq(key,value){filters.push([key,value]);return this},
 async maybeSingle(){return{data:serviceError?null:{id,user_id:owner,tool_id:"video-dubbing",status:paid?"paid":"quoted",expires_at:"2026-11-30T00:00:00Z",quantity:1},error:serviceError}}
};
const admin={
 from(name){assert.equal(name,"tool_payment_quotes");return query},
 async rpc(name,args){assert.equal(name,"rate_limit_check");rpcCalls.push(args);return{data:limiterAllowed,error:limiterError}}
};
const exports={};
vm.runInNewContext(js,{
 exports,
 require(name){
  if(name==="server-only")return{};
  if(name==="@/lib/supabase/server")return{createClient:()=>({auth:{getUser:async()=>({data:{user:{id:"test-user"}}})}})};
  if(name==="@/lib/supabase/admin")return{createAdminClient:()=>admin};
  throw Error("UNEXPECTED_IMPORT:"+name);
 },
 Error,Number,String,Math,Promise
});
async function rejects(action,re){await assert.rejects(action,re)}
async function run(){
 const guard=exports.guardPaidMediaOperation;
 const verify=exports.requirePaidMediaQuote;
 assert.equal(typeof guard,"function");assert.equal(typeof verify,"function");
 const q=await verify(id,["video-dubbing","video-translate"]);
 assert.equal(q.userId,"test-user");assert.equal(q.quantity,1);
 assert.equal(filters.some(([k,v])=>k==="user_id"&&v==="test-user"),true,"quote must be filtered to actual session");
 const cases=[["translate",1,80],["translate",20,1600],["tts",1,3],["tts",3,9],["transcribe",1,2],["transcribe",25,50],["translate",1000,10000],["tts",1000,500]];
 for(const [op,units,limit]of cases){
  rpcCalls=[];const result=await guard(id,units,op);
  assert.equal(result.limit,limit);
  assert.equal(rpcCalls.length,1);
  assert.equal(rpcCalls[0].p_key,"media-paid:"+op+":"+id);
  assert.equal(rpcCalls[0].p_limit,limit);
  assert.equal(rpcCalls[0].p_window_seconds,86400);
 }
 limiterAllowed=false;
 await rejects(()=>guard(id,1,"tts"),/MEDIA_USAGE_LIMIT_REACHED/);
 limiterAllowed=true;limiterError={code:"503"};
 await rejects(()=>guard(id,1,"translate"),/MEDIA_USAGE_GUARD_UNAVAILABLE/);
 limiterError=null;paid=false;
 await rejects(()=>verify(id,["video-dubbing"]),/QUOTE_NOT_PAID/);
 paid=true;owner="different-user";
 await rejects(()=>verify(id,["audio-transcription"]),/QUOTE_NOT_FOUND/);
 owner="test-user";serviceError={code:"PGRST"};
 await rejects(()=>verify(id,["video-dubbing"]),/QUOTE_LOOKUP_UNAVAILABLE/);
 serviceError=null;
 await rejects(()=>guard("bad-id",1,"tts"),/MEDIA_QUOTE_INVALID/);
 await rejects(()=>guard(id,0,"tts"),/MEDIA_QUOTE_INVALID/);
 for(const file of ["app/api/tools/media/translate/route.ts","app/api/tools/media/tts/route.ts","app/api/tools/media/transcribe/route.ts"]){
  const src=fs.readFileSync(file,"utf8");
  const cap=file.includes("/translate/")?"translate":file.includes("/tts/")?"tts":"transcribe";
  assert.match(src,new RegExp("guardPaidMediaOperation\\(quoteId,verified\\.quantity,\\\""+cap+"\\\"\\)"));
  assert.ok(src.indexOf("await guardPaidMediaOperation(")<src.indexOf(cap==="translate"?"translateTextRemote({":cap==="tts"?"synthesizeRemote(text":"transcribeAudioRemote(x)"),"paid limiter must precede provider spend: "+file);
  assert.match(src,/MEDIA_USAGE_LIMIT_REACHED/);
  assert.match(src,/MEDIA_USAGE_GUARD_UNAVAILABLE/);
 }
 const tts=fs.readFileSync("app/api/tools/media/tts/route.ts","utf8");
 assert.match(tts,/Math\.min\(12000,Math\.max\(1200,Math\.ceil\(verified\.quantity\)\*1500\)\)/);
 console.log("MEDIA_PAID_GUARD_V154=PASS: authenticated quote, atomic per-quote limits, outage fail-closed, route cost gates, paid-unit TTS length");
}
run().catch(e=>{console.error(e);process.exitCode=1});
