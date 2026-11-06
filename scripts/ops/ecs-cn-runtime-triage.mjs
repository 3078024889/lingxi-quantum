#!/usr/bin/env node
// Read-only ECS CN 3189 diagnosis. Do not print environment values, URLs, tokens or bodies.
import fs from "node:fs";
import http from "node:http";
import {parseEnv} from "node:util";
import {execFileSync} from "node:child_process";

if(process.argv.length!==3||process.argv[2]!=="--read-only"){
 console.log("CN_TRIAGE_REQUIRES_READ_ONLY_FLAG");process.exit(2);
}
const path="/etc/lingxifield/staging.env";
if(!fs.existsSync(path)){console.log("CN_STAGE_ENV_MISSING");process.exit(2)}
let env;
try{env=parseEnv(fs.readFileSync(path,"utf8"))}
catch{console.log("CN_STAGE_ENV_INVALID");process.exit(2)}
const r2id=String(env.R2_ACCOUNT_ID||"").trim().toLowerCase();
let ep=null;
try{ep=new URL(String(env.R2_ENDPOINT||""))}catch{}
const canonicalHosts=[r2id+".r2.cloudflarestorage.com",
 ...["eu","us","fedramp"].map(r=>r2id+"."+r+".r2.cloudflarestorage.com")];
const hostMatch=Boolean(r2id&&ep&&canonicalHosts.includes(ep.hostname));
const endpointForm=Boolean(ep&&ep.protocol==="https:"&&
 !ep.username&&!ep.password&&(!ep.port||ep.port==="443")&&ep.pathname==="/"&&
 !ep.search&&!ep.hash);
let jurisdiction="unknown";
if(hostMatch){
 jurisdiction=ep.hostname===canonicalHosts[0]?"default":
 ["eu","us","fedramp"].find(r=>ep.hostname===r2id+"."+r+".r2.cloudflarestorage.com")||"unknown";
}
const hostKind=!ep?"invalid_url":hostMatch?"matched_official":
 ep.hostname.endsWith(".r2.cloudflarestorage.com")?"r2_official_account_mismatch":
 "custom_or_unexpected";
console.log("CN_R2_ACCOUNT_PRESENT="+Boolean(r2id));
console.log("CN_R2_ACCOUNT_HEX32="+/^[a-f0-9]{32}$/.test(r2id));
console.log("CN_R2_ENDPOINT_KIND="+hostKind);
console.log("CN_R2_ENDPOINT_FORM_VALID="+endpointForm);
console.log("CN_R2_ENDPOINT_JURISDICTION="+jurisdiction);
console.log("CN_R2_CREDENTIALS_PRESENT="+["R2_ACCESS_KEY_ID","R2_SECRET_ACCESS_KEY"].every(k=>Boolean(env[k])&&env[k]!=="[SENSITIVE]"));
console.log("CN_R2_BUCKET_PRESENT="+Boolean(env.R2_BUCKET_PRIVATE_BURN));
function show(n,p){try{return execFileSync("systemctl",["show",n,"-p",p,"--value"],{encoding:"utf8",timeout:5000}).trim()}catch{return ""}}
const unit="lingxifield-cn-stage";
console.log("CN_3189_IPV4_RUNTIME_CONFIGURED="+show(unit,"Environment").includes("--dns-result-order=ipv4first"));
console.log("CN_3189_MAINPID_PRESENT="+(Number(show(unit,"MainPID"))>0));
console.log("CN_3189_RESTART_COUNT="+(Number(show(unit,"NRestarts"))||0));
console.log("CN_3189_MEMORY_BYTES="+(Number(show(unit,"MemoryCurrent"))||0));
console.log("CN_3188_MEMORY_BYTES="+(Number(show("lingxifield-ecs","MemoryCurrent"))||0));
function get(port,path,method="GET"){
 return new Promise((resolve,reject)=>{
  const req=http.request({hostname:"127.0.0.1",port,path,method,timeout:15000},res=>{
   const h=res.headers,parts=[];let size=0;
   res.on("data",chunk=>{size+=chunk.length;if(size>32768){req.destroy(new Error("RESPONSE_TOO_LARGE"));return}parts.push(chunk)});
   res.on("end",()=>resolve({status:res.statusCode||0,headers:h,body:Buffer.concat(parts).toString("utf8")}));
   res.on("error",reject);
  });
  req.on("timeout",()=>req.destroy(new Error("TIMEOUT")));
  req.on("error",reject);
  req.end();
 });
}
async function check(label,port,path,method){
 try{
  const r=await get(port,path,method);
  console.log(label+"_HTTP="+r.status);
  if(label==="CN_DOC_HEALTH"){
   let j={};try{j=JSON.parse(r.body)}catch{}
   console.log("CN_DOC_HEALTH_SHAPE="+
    (j.ok===true?"lingxifield_converter_or_compatible":
     j.status==="up"||j.status==="healthy"?"other_gateway":
     r.body.trim()==="OK"?"plain_ok":"unknown"));
   console.log("CN_DOC_GOTENBERG_HEADER_PRESENT="+Boolean(r.headers["x-gotenberg-version"]));
  }
 }catch(e){console.log(label+"_ERROR="+(e.code||"CONNECTION_FAILED"))}
}
await check("CN_SIAI_FIRST",3189,"/siai","GET");
await check("CN_SIAI_SECOND",3189,"/siai","GET");
await check("CN_STAGE_HEALTH",3189,"/api/health","GET");
await check("CN_DOC_HEALTH",3100,"/health","GET");
await check("CN_DOC_POST_CONVERT_NO_AUTH",3100,"/convert","POST");
console.log("CN_TRIAGE_READ_ONLY_COMPLETE_NO_SECRET_VALUES");
