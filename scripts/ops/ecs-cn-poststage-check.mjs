#!/usr/bin/env node
// LINGXIFIELD CN private staging checks (read-only; secrets never printed).
// Run as root: node scripts/ops/ecs-cn-poststage-check.mjs
import {readFileSync} from "node:fs";
import {parseEnv} from "node:util";
import {createHash,createHmac,randomUUID} from "node:crypto";
import {lookup} from "node:dns/promises";
import {request as httpsRequest} from "node:https";

const file="/etc/lingxifield/staging.env";
let env;
try { env=parseEnv(readFileSync(file,"utf8")); }
catch { console.log("STAGING_ENV_UNREADABLE");process.exit(2); }
const bad=v=>!String(v||"").trim() || String(v).trim()==="[SENSITIVE]";
const required=["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY","SUPABASE_SERVICE_ROLE_KEY"];
const missing=required.filter(k=>bad(env[k]));
if(missing.length){console.log("MISSING_REQUIRED_NAMES="+missing.join(","));process.exit(3);}
if(env.NEXT_PUBLIC_SUPABASE_URL!=="https://sxsgdpqojepgbbrxrzlq.supabase.co"){
 console.log("SUPABASE_PROJECT_MISMATCH");process.exit(4);
}
if(env.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn"){
 console.log("SITE_URL_MISMATCH");process.exit(4);
}
console.log("STAGING_ENV_PROJECT_AND_SITE_NAMES_MATCH");

const budgetMs=12000;
async function callIpv4(url,init={}){
 return new Promise((resolve,reject)=>{
  const req=httpsRequest(url,{method:init.method||"HEAD",family:4,timeout:budgetMs,headers:init.headers||{}},response=>{
   response.resume();
   response.once("end",()=>resolve(response.statusCode||0));
  });
  req.once("timeout",()=>req.destroy(Object.assign(new Error("READ_ONLY_TIMEOUT"),{code:"ETIMEDOUT"})));
  req.once("error",reject);
  req.end();
 });
}
async function call(url,init={}){
 const resp=await fetch(url,{...init,redirect:"error",signal:AbortSignal.timeout(budgetMs)});
 const status=resp.status;
 await resp.body?.cancel();
 return status;
}
// Report only an allowlisted error code, never a URL, token or error message.
const SAFE_NETWORK_CODES=new Set([
 "ENOTFOUND","EAI_AGAIN","ECONNREFUSED","ECONNRESET","ETIMEDOUT",
 "EHOSTUNREACH","ENETUNREACH","UND_ERR_CONNECT_TIMEOUT","UND_ERR_SOCKET",
 "UND_ERR_HEADERS_TIMEOUT","CERT_HAS_EXPIRED","UNABLE_TO_VERIFY_LEAF_SIGNATURE",
 "DEPTH_ZERO_SELF_SIGNED_CERT","ERR_TLS_CERT_ALTNAME_INVALID","ABORT_ERR"
]);
function networkErrorCode(error){
 if(error?.name==="TimeoutError")return "TIMEOUT";
 let cause=error;
 for(let i=0;i<5&&cause;i++){
  if(SAFE_NETWORK_CODES.has(cause.code))return cause.code;
  cause=cause.cause??(Array.isArray(cause.errors)?cause.errors[0]:null);
 }
 return "UNKNOWN";
}
async function probe(name,fn){
 try { console.log(name+"="+await fn()); }
 catch(error) { console.log(name+"=REQUEST_ERROR_"+networkErrorCode(error)); }
}
async function dnsSummary(url){
 const host=new URL(url).hostname,addresses=await lookup(host,{all:true});
 return "RESOLVED_IPV4_"+addresses.filter(x=>x.family===4).length+"_IPV6_"+addresses.filter(x=>x.family===6).length;
}
const local="http://127.0.0.1:3189";
await probe("CN_STAGE_HEALTH_HTTP",()=>call(local+"/api/health"));
await probe("CN_STAGE_ANON_JOBS_HTTP",()=>call(local+"/api/tools/jobs"));
await probe("SUPABASE_DNS",()=>dnsSummary(env.NEXT_PUBLIC_SUPABASE_URL));
await probe("SUPABASE_ANON_AUTH_HTTP",()=>call(env.NEXT_PUBLIC_SUPABASE_URL+"/auth/v1/health",{
 headers:{apikey:env.NEXT_PUBLIC_SUPABASE_ANON_KEY}
}));
await probe("SUPABASE_ADMIN_READ_HTTP",()=>call(
 env.NEXT_PUBLIC_SUPABASE_URL+"/rest/v1/ops_runtime_heartbeats?select=key&limit=0",{
 headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,accept:"application/json"}
}));
await probe("DOCUMENT_GATEWAY_LOCAL_HTTP",()=>call("http://127.0.0.1:3100/health"));
async function sasi(){
 const r=await fetch(local+"/api/sasi/generation/readiness",{signal:AbortSignal.timeout(18000)});
 if(r.status!==200){await r.body?.cancel();return "HTTP_"+r.status;}
 const d=await r.json();
 const state=String(d?.worker?.status||"UNKNOWN");
 return state.replace(/[^A-Z0-9_-]/gi,"").slice(0,32);
}
await probe("SASI_WORKER_STATUS",sasi);
console.log("SASI_COMPUTE_URL_CONFIGURED="+(!bad(env.SASI_COMPUTE_WORKER_URL)));
console.log("SASI_COMPUTE_SECRET_CONFIGURED="+(!bad(env.SASI_COMPUTE_WORKER_SECRET)));
console.log("R2_CONFIG_PRESENT="+["R2_ENDPOINT","R2_ACCOUNT_ID","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY","R2_BUCKET_PRIVATE_BURN"].every(k=>!bad(env[k])));
const enc=v=>encodeURIComponent(v).replace(/[!'()*]/g,ch=>"%"+ch.charCodeAt(0).toString(16).toUpperCase());
const hash=v=>createHash("sha256").update(v).digest("hex");
const hmac=(key,value)=>createHmac("sha256",key).update(value).digest();
async function r2HeadMissingObject(requester=call){
 const names=["R2_ENDPOINT","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY","R2_BUCKET_PRIVATE_BURN"];
 if(names.some(x=>bad(env[x])))return "NOT_CONFIGURED";
 const ep=new URL(env.R2_ENDPOINT);
 if(ep.protocol!=="https:" || ep.username || ep.password || ep.search)return "ENDPOINT_INVALID";
 const uri="/"+[env.R2_BUCKET_PRIVATE_BURN,"lingxi-readiness-probe","missing-"+randomUUID()].map(enc).join("/");
 const now=new Date().toISOString().replace(/[:-]|\.\d{3}/g,"");
 const day=now.slice(0,8);
 const scope=day+"/auto/s3/aws4_request";
 const q={
  "X-Amz-Algorithm":"AWS4-HMAC-SHA256",
  "X-Amz-Credential":env.R2_ACCESS_KEY_ID+"/"+scope,
  "X-Amz-Date":now,
  "X-Amz-Expires":"45",
  "X-Amz-SignedHeaders":"host"
 };
 const qs=Object.keys(q).sort().map(k=>enc(k)+"="+enc(q[k])).join("&");
 const canonical=["HEAD",uri,qs,"host:"+ep.host+"\n","host","UNSIGNED-PAYLOAD"].join("\n");
 const signInput=["AWS4-HMAC-SHA256",now,scope,hash(canonical)].join("\n");
 const kDate=hmac("AWS4"+env.R2_SECRET_ACCESS_KEY,day);
 const kRegion=hmac(kDate,"auto");
 const kService=hmac(kRegion,"s3");
 const signingKey=hmac(kService,"aws4_request");
 const sig=createHmac("sha256",signingKey).update(signInput).digest("hex");
 const url=ep.origin+uri+"?"+qs+"&X-Amz-Signature="+sig;
 const status=await requester(url,{method:"HEAD"});
 return "HTTP_"+status+(status===404?"_EXPECTED_MISSING_OBJECT":"");
}
if(!bad(env.R2_ENDPOINT)){
 await probe("R2_DNS",()=>dnsSummary(env.R2_ENDPOINT));
 await probe("R2_UNSIGNED_ENDPOINT_HEAD",async()=> {
  const ep=new URL(env.R2_ENDPOINT);
  if(ep.protocol!=="https:"||ep.username||ep.password)return "ENDPOINT_INVALID";
  return "HTTP_"+await call(ep.origin,{method:"HEAD"});
 });
}
await probe("R2_SIGNED_READONLY_HEAD",r2HeadMissingObject);
await probe("R2_SIGNED_IPV4_HEAD",()=>r2HeadMissingObject(callIpv4));
if(process.argv.includes("--engines")){
 await probe("TOOL_ENGINE_HEALTH",async()=>{
  const r=await fetch(local+"/api/tools/engine/health",{signal:AbortSignal.timeout(20000)});
  if(!r.ok){await r.body?.cancel();return "HTTP_"+r.status;}
  const j=await r.json();

  const engines=Array.isArray(j?.engines)?j.engines:[];
  for(const item of engines){
   const id=String(item?.id||"").replace(/[^a-z0-9-]/g,"").slice(0,50);
   if(!id)continue;
   const runtime=String(item?.runtime||"").replace(/[^a-z0-9-]/g,"").slice(0,32);
   const reason=String(item?.reason||"");
   let code="EXECUTION_ERROR";
   if(item?.available)code="OK";
   else if(/NOT_CONFIGURED|NOT_SET|COMMAND_NOT_CONFIGURED/i.test(reason))code="NOT_CONFIGURED";
   else if(/ENOENT|Cannot find package|No module named|ModuleNotFoundError|ERR_MODULE_NOT_FOUND|MODULE_NOT_FOUND/i.test(reason))code="DEPENDENCY_OR_PATH_MISSING";
   else if(/TIMEOUT|AbortError|ETIMEDOUT/i.test(reason))code="TIMEOUT";
   else if(/ENGINE_EXIT_[0-9]+/i.test(reason))code="COMMAND_EXIT_NONZERO";
   else if(/HTTP_[0-9]{3}/i.test(reason))code="HTTP_UNAVAILABLE";
   console.log("ENGINE_"+id+"="+(item?.available?"AVAILABLE":"UNAVAILABLE")+"_RUNTIME_"+runtime+"_CAUSE_"+code);
  }
  return "AVAILABLE_"+Number(j?.summary?.available||0)+"_CHECKED_"+Number(j?.summary?.checked||0);
 });
}
console.log("CHECKS_FINISHED_NO_DB_WRITE_NO_FILE_MUTATION");
