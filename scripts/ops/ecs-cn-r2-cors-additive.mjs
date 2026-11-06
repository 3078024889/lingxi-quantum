#!/usr/bin/env node
// LINGXIFIELD .cn ONLY: R2 bucket CORS additive repair using existing S3 credentials.
// Requires explicit flag, preserves existing CORS rules and does not touch objects,
// customers, Nginx, production environment, systemd, payments, or other buckets.
import {readFileSync,existsSync,mkdirSync,writeFileSync} from "node:fs";
import {createHash,createHmac,randomUUID,createHash as hash} from "node:crypto";
import {request} from "node:https";
import {parseEnv} from "node:util";

const mode=process.argv[2];
if(process.argv.length!==3||!["--inspect-read-only","--apply-cn-cors-only"].includes(mode)){
 console.log("CN_R2_CORS_REQUIRES_EXPLICIT_MODE");process.exit(2);
}
if(process.getuid?.()!==0){console.log("CN_R2_CORS_ROOT_REQUIRED");process.exit(2)}
const env=parseEnv(readFileSync("/etc/lingxifield/staging.env","utf8"));
const gate=env.NEXT_PUBLIC_SITE_URL==="https://lingxifield.cn"&&
 env.NEXT_PUBLIC_SUPABASE_URL==="https://sxsgdpqojepgbbrxrzlq.supabase.co"&&
 ["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"].every(x=>env[x]==="false");
if(!gate){console.log("CN_R2_CORS_STAGE_ISOLATION_FAILED");process.exit(3)}
const account=String(env.R2_ACCOUNT_ID||"").trim().toLowerCase();
const access=String(env.R2_ACCESS_KEY_ID||"");
const secret=String(env.R2_SECRET_ACCESS_KEY||"");
const bucket=String(env.R2_BUCKET_PRIVATE_BURN||"");
let endpoint;
try{endpoint=new URL(String(env.R2_ENDPOINT||""))}catch{console.log("CN_R2_CORS_ENDPOINT_INVALID");process.exit(3)}
const validHosts=[account+".r2.cloudflarestorage.com",
 ...["eu","us","fedramp"].map(x=>account+"."+x+".r2.cloudflarestorage.com")];
if(!/^[a-f0-9]{32}$/.test(account)||!validHosts.includes(endpoint.hostname)||
 endpoint.protocol!=="https:"||endpoint.pathname!=="/"||endpoint.search||endpoint.hash||
 endpoint.username||endpoint.password||!access||!secret||
 !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)||bucket.includes("..")){
 console.log("CN_R2_CORS_ACCOUNT_CREDENTIALS_OR_BUCKET_INVALID");process.exit(3);
}
const sha=s=>createHash("sha256").update(s).digest("hex");
const sign=(key,data)=>createHmac("sha256",key).update(data).digest();
function signedHeaders(method,body){
 const amz=new Date().toISOString().replace(/[:-]|\.\d{3}/g,"");
 const date=amz.slice(0,8),scope=date+"/auto/s3/aws4_request";
 const bh=sha(body||"");
 const canonicalUri="/"+encodeURIComponent(bucket);
 const query="cors=";
 const canonicalHeaders="host:"+endpoint.host+"\n"+"x-amz-content-sha256:"+bh+"\n"+"x-amz-date:"+amz+"\n";
 const requestString=[method,canonicalUri,query,canonicalHeaders,"host;x-amz-content-sha256;x-amz-date",bh].join("\n");
 const toSign=["AWS4-HMAC-SHA256",amz,scope,sha(requestString)].join("\n");
 const key=sign(sign(sign(sign("AWS4"+secret,date),"auto"),"s3"),"aws4_request");
 const signature=createHmac("sha256",key).update(toSign).digest("hex");
 return {"x-amz-date":amz,"x-amz-content-sha256":bh,
  authorization:"AWS4-HMAC-SHA256 Credential="+access+"/"+scope+
   ", SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature="+signature};
}
async function call(method,body=""){
 return await new Promise((resolve,reject)=>{
  const signed=signedHeaders(method,body);
  const headers={...signed};
  if(method==="PUT"){
   headers["content-type"]="application/xml";
   headers["content-length"]=Buffer.byteLength(body);
   headers["content-md5"]=hash("md5").update(body).digest("base64");
  }
  const req=request(endpoint.origin+"/"+encodeURIComponent(bucket)+"?cors",{
   method,family:4,timeout:15000,headers
  },res=>{
   const data=[];let n=0;
   res.on("data",d=>{n+=d.length;if(n>131072){req.destroy(new Error("RESPONSE_TOO_LARGE"));return;}data.push(d)});
   res.on("end",()=>resolve({status:res.statusCode||0,body:Buffer.concat(data).toString("utf8")}));
   res.on("error",reject);
  });
  req.on("timeout",()=>req.destroy(Object.assign(new Error("TIMEOUT"),{code:"ETIMEDOUT"})));
  req.on("error",reject);
  req.end(method==="PUT"?body:undefined);
 });
}
const safeCode=body=>(/<Code>([A-Za-z0-9]+)<\/Code>/.exec(body)||[])[1]||"UNKNOWN";
function inspect(xml){
 const prefixMatch=/<(\w+:)?CORSConfiguration(?:\s|>)/.exec(xml);
 if(!prefixMatch||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error("UNSUPPORTED_CORS_XML");
 const prefix=prefixMatch[1]||"";
 const closing="</"+prefix+"CORSConfiguration>";
 if(!xml.includes(closing))throw Error("UNSUPPORTED_CORS_XML");
 return {prefix,closing,previousRules:(xml.match(/<(?:(?:\w+):)?CORSRule(?:\s|>)/g)||[]).length};
}
const ruleId="lingxifield-cn-browser-direct-v1";
function rule(prefix){
 const tag=(name,value)=>"<"+prefix+name+">"+value+"</"+prefix+name+">";
 return "<"+prefix+"CORSRule>"+tag("ID",ruleId)+
 tag("AllowedOrigin","https://lingxifield.cn")+
 ["GET","PUT","HEAD"].map(x=>tag("AllowedMethod",x)).join("")+
 tag("AllowedHeader","content-type")+
 ["ETag","Content-Type","Content-Length"].map(x=>tag("ExposeHeader",x)).join("")+
 tag("MaxAgeSeconds","600")+"</"+prefix+"CORSRule>";
}
let before;
try{before=await call("GET")}
catch(e){console.log("CN_R2_CORS_GET_NETWORK_ERROR="+(["ETIMEDOUT","ENETUNREACH","ECONNRESET"].includes(e.code)?e.code:"REQUEST_FAILED"));process.exit(4)}
console.log("CN_R2_CORS_READ_HTTP="+before.status);
if(before.status===404)console.log("CN_R2_CORS_READ_ERROR="+safeCode(before.body));
if(before.status!==200&&!(before.status===404&&safeCode(before.body)==="NoSuchCORSConfiguration")){
 console.log("CN_R2_CORS_NO_CHANGE_READ_UNSUPPORTED_OR_FORBIDDEN");process.exit(4);
}
const oldXml=before.status===200?before.body:"";
if(oldXml.length>65536){console.log("CN_R2_CORS_POLICY_TOO_LARGE_NO_CHANGE");process.exit(4)}
let format=null;
if(oldXml){
 try{format=inspect(oldXml)}catch{console.log("CN_R2_CORS_XML_UNSUPPORTED_NO_CHANGE");process.exit(4)}
}
const ruleExists=oldXml.includes(ruleId);
console.log("CN_R2_CORS_EXISTING_RULE_COUNT="+(format?format.previousRules:0));
console.log("CN_R2_CORS_CN_RULE_ALREADY_PRESENT="+ruleExists);
if(mode==="--inspect-read-only"){
 console.log("CN_R2_CORS_READ_ONLY_COMPLETE");process.exit(0);
}
if(ruleExists){console.log("CN_R2_CORS_RULE_PRESENT_RECHECK_PREFLIGHT");process.exit(0)}
if(format&&format.previousRules>=95){console.log("CN_R2_CORS_TOO_MANY_RULES_ABORT");process.exit(5)}
const newXml=oldXml
 ?oldXml.replace(format.closing,rule(format.prefix)+format.closing)
 :'<?xml version="1.0" encoding="UTF-8"?>'+
  '<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">'+rule("")+'</CORSConfiguration>';
const check=await call("GET");
if(check.status!==before.status||check.body!==before.body){
 console.log("CN_R2_CORS_CHANGED_DURING_REVIEW_ABORT");process.exit(5);
}
const backupDir="/root/lingxifield-cn-r2-cors-backups";
mkdirSync(backupDir,{recursive:true,mode:0o700});
const backup=backupDir+"/before-cn-cors-"+Date.now()+"-"+randomUUID()+".xml";
writeFileSync(backup,oldXml,{flag:"wx",mode:0o600});
console.log("CN_R2_CORS_PREVIOUS_POLICY_BACKUP_SAVED");
let applied;
try{applied=await call("PUT",newXml)}
catch(e){console.log("CN_R2_CORS_PUT_NETWORK_ERROR="+(["ETIMEDOUT","ECONNRESET"].includes(e.code)?e.code:"REQUEST_FAILED"));process.exit(6)}
console.log("CN_R2_CORS_APPLY_HTTP="+applied.status);
if(![200,204].includes(applied.status)){
 console.log("CN_R2_CORS_APPLY_ERROR="+safeCode(applied.body));
 console.log("CN_R2_CORS_APPLY_NOT_CONFIRMED");process.exit(6);
}
let after;
try{after=await call("GET")}catch{console.log("CN_R2_CORS_POSTVERIFY_NETWORK_ERROR");process.exit(7)}
if(after.status!==200||!after.body.includes(ruleId)){
 console.log("CN_R2_CORS_POSTVERIFY_FAILED");process.exit(7);
}
if(oldXml&&(!after.body.includes("<"+format.prefix+"CORSConfiguration")||
 (inspect(after.body).previousRules<=format.previousRules))){
 console.log("CN_R2_CORS_EXISTING_RULES_PRESERVATION_CHECK_FAILED");process.exit(7);
}
console.log("CN_R2_CORS_CN_RULE_ADDED_AND_READBACK_VERIFIED");
console.log("CN_R2_CORS_EXISTING_POLICY_PRESERVED");
console.log("CN_R2_CORS_3188_AND_COM_UNTOUCHED");
