#!/usr/bin/env node
// CN staging ONLY. Destructive *only* to a freshly generated R2 probe object.
// Never touches customer objects, live config, orders, DB, routes or systemd.
import {readFileSync} from "node:fs";
import {parseEnv} from "node:util";
import {createHash,createHmac,randomBytes,randomUUID,timingSafeEqual} from "node:crypto";
import {request as httpsRequest} from "node:https";

if(!process.argv.includes("--ack-create-delete-probe")){
 console.log("R2_LIFECYCLE_REQUIRES_EXPLICIT_ACK");process.exit(2);
}
const env=parseEnv(readFileSync("/etc/lingxifield/staging.env","utf8"));
const required=["R2_ACCOUNT_ID","R2_ENDPOINT","R2_BUCKET_PRIVATE_BURN","R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY"];
for(const name of required)if(!env[name]||env[name].trim()==="[SENSITIVE]"){
 console.log("R2_CONFIG_MISSING_"+name);process.exit(3);
}
if(env.NEXT_PUBLIC_SITE_URL!=="https://lingxifield.cn"||
 env.NEXT_PUBLIC_SUPABASE_URL!=="https://sxsgdpqojepgbbrxrzlq.supabase.co"||
 ["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"].some(k=>env[k]!=="false")){
 console.log("CN_STAGE_ONLY_PROJECT_GUARD_FAILED");process.exit(4);
}
const ep=new URL(env.R2_ENDPOINT);
if(ep.protocol!=="https:"||ep.username||ep.password||ep.pathname!=="/"||ep.search||ep.hash
   ||ep.hostname!==env.R2_ACCOUNT_ID+".r2.cloudflarestorage.com"){
 console.log("R2_ENDPOINT_ACCOUNT_VALIDATION_FAILED");process.exit(5);
}
const bucket=env.R2_BUCKET_PRIVATE_BURN;
if(!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)||bucket.includes("..")){
 console.log("R2_BUCKET_FORMAT_INVALID");process.exit(5);
}
const key="lingxifield-cn-readiness-probe/"+randomUUID()+".bin";
const payload=randomBytes(512);
const enc=s=>encodeURIComponent(s).replace(/[!'()*]/g,c=>"%"+c.charCodeAt(0).toString(16).toUpperCase());
const hash=s=>createHash("sha256").update(s).digest("hex");
const hmac=(k,s)=>createHmac("sha256",k).update(s).digest();
function presign(method){
 const timestamp=new Date().toISOString().replace(/[:-]|\.\d{3}/g,""),day=timestamp.slice(0,8);
 const scope=day+"/auto/s3/aws4_request";
 const uri="/"+[bucket,...key.split("/")].map(enc).join("/");
 const params={
  "X-Amz-Algorithm":"AWS4-HMAC-SHA256",
  "X-Amz-Credential":env.R2_ACCESS_KEY_ID+"/"+scope,
  "X-Amz-Date":timestamp,
  "X-Amz-Expires":"90",
  "X-Amz-SignedHeaders":"host"
 };
 const query=Object.keys(params).sort().map(k=>enc(k)+"="+enc(params[k])).join("&");
 const canonical=[method,uri,query,"host:"+ep.host+"\n","host","UNSIGNED-PAYLOAD"].join("\n");
 const msg=["AWS4-HMAC-SHA256",timestamp,scope,hash(canonical)].join("\n");
 const sigKey=hmac(hmac(hmac(hmac("AWS4"+env.R2_SECRET_ACCESS_KEY,day),"auto"),"s3"),"aws4_request");
 const sig=createHmac("sha256",sigKey).update(msg).digest("hex");
 return ep.origin+uri+"?"+query+"&X-Amz-Signature="+sig;
}
const allowedCodes=new Set(["ENOTFOUND","EAI_AGAIN","ENETUNREACH","EHOSTUNREACH","ETIMEDOUT","ECONNRESET","ECONNREFUSED"]);
function safeError(e){let x=e;for(let i=0;i<4&&x;i++,x=x.cause)if(allowedCodes.has(x.code))return x.code;return "REQUEST_FAILED";}
const ORIGIN="https://lingxifield.cn";
const header=(h,n)=>String(h?.[n]||"").toLowerCase();
function corsOrigin(h){return header(h,"access-control-allow-origin")===ORIGIN}
function corsToken(h,n,token){
 const tokens=header(h,n).split(",").map(s=>s.trim());
 return tokens.includes(token.toLowerCase());
}
async function preflightPut(){
 const url=presign("PUT");
 return new Promise((resolve,reject)=>{
  const req=httpsRequest(url,{
   method:"OPTIONS",family:4,timeout:12000,headers:{
    origin:ORIGIN,"access-control-request-method":"PUT",
    "access-control-request-headers":"content-type"
   }
  },res=>{
   res.resume();
   res.on("end",()=>resolve({code:res.statusCode||0,headers:res.headers}));
   res.on("error",reject);
  });
  req.on("timeout",()=>req.destroy(Object.assign(new Error("TIMEOUT"),{code:"ETIMEDOUT"})));
  req.on("error",reject);
  req.end();
 });
}
async function send(method,body,additionalHeaders={}){
 const url=presign(method);
 return new Promise((resolve,reject)=>{
  const req=httpsRequest(url,{
   method,family:4,timeout:15000,headers:{...(body?{"content-type":"application/octet-stream","content-length":body.length}:{}),...additionalHeaders}
  },res=>{
   const chunks=[];let size=0;
   res.on("data",part=>{size+=part.length;if(size>32768){req.destroy(Object.assign(new Error("RESPONSE_TOO_LARGE"),{code:"E2BIG"}));return;}chunks.push(part)});
   res.on("end",()=>resolve({code:res.statusCode??0,data:Buffer.concat(chunks),headers:res.headers}));
   res.on("error",reject);
  });
  req.on("timeout",()=>req.destroy(Object.assign(new Error("TIMEOUT"),{code:"ETIMEDOUT"})));
  req.on("error",reject);
  req.end(body);
 });
}
let created=false,ok=false,cleanup=false;
try{
 // Browser upload needs CORS preflight even when the signed URL is valid.
 // Never create an object if the private bucket would reject .cn browser uploads.
 const cors=await preflightPut();
 const corsPut=[200,204].includes(cors.code)&&corsOrigin(cors.headers)&&
  corsToken(cors.headers,"access-control-allow-methods","put")&&
  corsToken(cors.headers,"access-control-allow-headers","content-type");
 console.log("R2_PROBE_CORS_PUT_PREFLIGHT="+(corsPut?"PASS":"FAIL"));
 if(!corsPut)throw Error("CORS_PUT_NOT_ALLOWED");
 // Only this random key can ever be written/deleted; no LIST operations.
 created=true;
 const put=await send("PUT",payload);
 console.log("R2_PROBE_PUT_HTTP="+put.code);
 if(![200,201].includes(put.code))throw Error("PUT_REJECTED");
 const head=await send("HEAD",null,{origin:ORIGIN});
 console.log("R2_PROBE_HEAD_HTTP="+head.code);
 if(head.code!==200)throw Error("HEAD_FAILED");
 const corsHead=corsOrigin(head.headers);
 console.log("R2_PROBE_CORS_HEAD="+(corsHead?"PASS":"FAIL"));
 if(!corsHead)throw Error("CORS_HEAD_NOT_ALLOWED");
 const get=await send("GET",null,{origin:ORIGIN});
 console.log("R2_PROBE_GET_HTTP="+get.code);
 if(get.code!==200||get.data.length!==payload.length)throw Error("GET_FAILED");
 const corsGet=corsOrigin(get.headers);
 console.log("R2_PROBE_CORS_GET="+(corsGet?"PASS":"FAIL"));
 if(!corsGet)throw Error("CORS_GET_NOT_ALLOWED");
 if(!timingSafeEqual(createHash("sha256").update(get.data).digest(),createHash("sha256").update(payload).digest()))
  throw Error("CONTENT_MISMATCH");
 console.log("R2_PROBE_SHA256_MATCH=true");
 ok=true;
}catch(e){
 console.log("R2_PROBE_TEST_ERROR="+(e.message?.match(/^(PUT_REJECTED|HEAD_FAILED|GET_FAILED|CONTENT_MISMATCH|CORS_PUT_NOT_ALLOWED|CORS_HEAD_NOT_ALLOWED|CORS_GET_NOT_ALLOWED)$/)?.[1]||safeError(e)));
}finally{
 if(created){
  try{
   const del=await send("DELETE");
   console.log("R2_PROBE_DELETE_HTTP="+del.code);
   if([200,204].includes(del.code)){
    const gone=await send("HEAD");
    console.log("R2_PROBE_POST_DELETE_HEAD_HTTP="+gone.code);
    cleanup=gone.code===404;
   }
  }catch(e){console.log("R2_PROBE_CLEANUP_ERROR="+safeError(e))}
 }
}
console.log("R2_PROBE_LIFECYCLE_PASS="+(ok&&cleanup));
if(!ok||!cleanup)process.exitCode=1;
