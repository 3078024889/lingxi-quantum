import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function route({enabled=true,user={id:"owner"},origin=true,guard={ok:true},invalid=false}={}){
 const exports={},calls=[];
 const dependencies={
  "next/server":{NextResponse:{json:(body,options)=>({body,...options})}},
  "@/lib/supabase/server":{createClient:()=>({auth:{getUser:async()=>({data:{user},error:null})}})},
  "@/lib/sasi/request-security":{isSameOriginMutation:()=>origin},
  "@/lib/security/bounded-request-json":{boundedRequestJson:async(req,limit)=>{assert.equal(limit,32000);return {groups:[[{food_id:1,grams:100}]]}}},
  "@/lib/security/abuse-guard":{enforceAbuseGuard:async(req,options)=>{calls.push(options);return guard}},
  "@/lib/tools/food/analysis-input":{parseFoodGroups:groups=>{if(invalid)throw Error("INVALID_FOOD_ITEMS");return groups}},
  "@/lib/tools/food/analysis-server":{resolveFoodMeal:async items=>{calls.push(items);return {total:{kcal:120},items}}}
 };
 vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../app/api/tools/food/acceptance/route.ts",import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,process:{env:{NEXT_PUBLIC_TOOL_FREE_ACCEPTANCE:String(enabled)}},require:name=>{assert(name in dependencies,name);return dependencies[name]}});
 return {run:exports.POST,calls};
}
test("food acceptance is closed by default and rejects cross-origin or anonymous calls",async()=>{
 for(const [options,status] of [[{enabled:false},404],[{origin:false},403],[{user:null},401]]){
  const r=route(options);assert.equal((await r.run({})).status,status);assert.equal(r.calls.length,0);
 }
});
test("invalid inputs and unavailable abuse guards never resolve food data",async()=>{
 const invalid=route({invalid:true});assert.equal((await invalid.run({})).status,400);assert.equal(invalid.calls.length,0);
 const denied=route({guard:{ok:false,status:503,error:"ABUSE_GUARD_UNAVAILABLE"}});assert.equal((await denied.run({})).status,503);assert.equal(denied.calls.length,1);
});
test("repeated free calculations retain account/IP protection without quotes or daily counters",async()=>{
 const r=route();for(let n=0;n<3;n++){const response=await r.run({});assert.equal(response.status,200);assert.equal(response.body.total.kcal,120);assert.equal(response.headers["Cache-Control"],"private, no-store");}
 assert.equal(r.calls.length,6);assert.equal(r.calls[0].userId,"owner");assert.equal(r.calls[1][0].grams,100);
});
