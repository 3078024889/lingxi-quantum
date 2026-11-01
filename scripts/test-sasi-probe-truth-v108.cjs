#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict"),ts=require("typescript");
const file="app/api/sasi/connections/test/route.ts";
const raw=fs.readFileSync(file,"utf8");
const build=ts.transpileModule(raw,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let latest=null,probes=0,guarded=0;
const db={from(name){
 assert.equal(name,"sasi_provider_connections");
 return {
  select(){return this},eq(){return this},maybeSingle:async()=>({data:{encrypted_credential:"encrypted-fixture",last_checked_at:null,base_url:"https://trusted.example/v1",model_id:""},error:null}),
  update(patch){latest=patch;return {eq(){return this},then(resolve){return Promise.resolve({error:null}).then(resolve)}}}
 };
}};
const mocks={
 "next/server":{NextResponse:{json:(body,opts={})=>({body,status:opts.status||200,headers:opts.headers})}},
 "@/lib/supabase/server":{createClient:()=>({auth:{getUser:async()=>({data:{user:{id:"user-1"}}})}})},
 "@/lib/supabase/admin":{createAdminClient:()=>db},
 "@/lib/sasi/credential-vault":{decryptProviderKey:()=>"mock-key",validByokProvider:provider=>provider==="openai"},
 "@/lib/sasi/request-security":{isSameOriginMutation:()=>true},
 "@/lib/security/abuse-guard":{enforceAbuseGuard:async()=>{guarded++;return {ok:true}}},
 "@/lib/security/provider-json-probe":{providerJsonProbe:async()=>{probes++;return {ok:true,status:200,payload:{data:[{id:"text-model-1"}]}}}},
 "@/lib/sasi/gateway/ssrf-guard":{validateProviderBaseUrl:url=>({pass:true,normalized:url})},
 "@/lib/sasi/intelligence/provider-defaults":{chooseTextModel:()=>"text-model-1",defaultBaseUrl:()=>"https://trusted.example/v1",providerPublicCapabilities:()=>["text"]},
 "@/lib/security/bounded-request-json":{boundedRequestJson:async request=>JSON.parse(await request.text())}
};
const m={exports:{}};
vm.runInNewContext(build,{module:m,exports:m.exports,require(name){assert(name in mocks,"missing mock "+name);return mocks[name]},Request,Response,Headers,TextEncoder,TextDecoder,Date,Error,Number,console});
const req=()=>new Request("https://site.example/api/sasi/connections/test",{method:"POST",body:JSON.stringify({provider:"openai"})});
(async()=>{
 const x=await m.exports.POST(req());
 assert.equal(x.status,200);
 assert.equal(x.body.healthStatus,"healthy");
 assert.equal(x.body.verificationLevel,"catalog-probe");
 assert.equal(x.body.generationVerifiedByThisCheck,false);
 assert.equal(probes,1);assert.equal(guarded,2);
 assert.equal(Object.hasOwn(latest,"last_success_at"),false,"GET /models must never claim a completed generation");
 assert.equal(latest.health_status,"healthy");
 assert.equal(latest.discovered_models[0],"text-model-1");
 const page=fs.readFileSync("app/sasi/ConnectionCenter.tsx","utf8");
 assert.match(page,/PROBE_VERIFIED\[lang\]/);
 assert.match(page,/PROBE_EXPLAINED\[lang\]/);
 for(const lang of ["zh","en","ja","ko","fr","de","es","pt","ar"])assert(page.includes(lang+':"'),"missing translated status "+lang);
 console.log("SASI_PROBE_TRUTH_GATE=PASS: catalog probe succeeds without stamping a generated output; nine-locale customer status");
})().catch(error=>{console.error(error);process.exitCode=1});
