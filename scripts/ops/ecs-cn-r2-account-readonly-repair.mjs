#!/usr/bin/env node
// CN 3189 R2 account-ID mismatch: authenticated read-only proof then optional
// minimal, atomic staging.env R2_ACCOUNT_ID correction. Never touches production
// environment, payment flags, database, nginx, R2 objects, or service processes.
import fs from "node:fs";
import path from "node:path";
import {createHash,createHmac,randomUUID} from "node:crypto";
import {request as httpsRequest} from "node:https";
import {parseEnv} from "node:util";

const flag=process.argv[2];
if(!["--inspect-read-only","--repair-stage-id-after-auth"].includes(flag)||process.argv.length!==3){
 console.log("CN_R2_ACCOUNT_PRECHECK_REQUIRES_EXPLICIT_FLAG");process.exit(2);
}
if(process.getuid?.()!==0){console.log("CN_R2_ACCOUNT_CHECK_REQUIRES_ROOT");process.exit(2)}
const envPath="/etc/lingxifield/staging.env";
let stat,source,env;
try{
 stat=fs.lstatSync(envPath);
 if(!stat.isFile()||stat.isSymbolicLink())throw new Error("NOT_REGULAR");
 source=fs.readFileSync(envPath,"utf8");
 env=parseEnv(source);
}catch{console.log("CN_R2_STAGE_ENV_NOT_READABLE");process.exit(2)}
const stageOk=env.NEXT_PUBLIC_SITE_URL==="https://lingxifield.cn"&&
 env.NEXT_PUBLIC_SUPABASE_URL==="https://sxsgdpqojepgbbrxrzlq.supabase.co"&&
 ["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"]
 .every(k=>env[k]==="false");
if(!stageOk){console.log("CN_R2_STAGING_PAYMENT_OR_SITE_ISOLATION_FAILED");process.exit(3)}
const cfgId=String(env.R2_ACCOUNT_ID||"").trim().toLowerCase();
const urlStr=String(env.R2_ENDPOINT||"").trim();
let endpoint;
try{endpoint=new URL(urlStr)}catch{console.log("CN_R2_ENDPOINT_URL_INVALID");process.exit(3)}
const match=/^([a-f0-9]{32})(?:\.(eu|us|fedramp))?\.r2\.cloudflarestorage\.com$/.exec(endpoint.hostname);
const shapeOk=endpoint.protocol==="https:"&&!endpoint.username&&!endpoint.password&&
 (!endpoint.port||endpoint.port==="443")&&endpoint.pathname==="/"&&!endpoint.search&&!endpoint.hash;
console.log("CN_R2_ENDPOINT_HOST_ACCOUNT_SHAPE="+(match?"VALID_32_HEX":"INVALID"));
console.log("CN_R2_ENDPOINT_ORIGIN_SHAPE="+(shapeOk?"PASS":"FAIL"));
console.log("CN_R2_STAGE_ACCOUNT_ID_MATCH="+(match&&cfgId===match[1]?"PASS":"FAIL"));
console.log("CN_R2_ENDPOINT_JURISDICTION="+(match?(match[2]||"default"):"unverified"));
if(!match||!shapeOk){console.log("CN_R2_NO_CONFIG_CHANGE_ENDPOINT_UNVERIFIED");process.exit(4)}
const access=String(env.R2_ACCESS_KEY_ID||""),secret=String(env.R2_SECRET_ACCESS_KEY||""),
 bucket=String(env.R2_BUCKET_PRIVATE_BURN||"").trim();
if(!access||!secret||access==="[SENSITIVE]"||secret==="[SENSITIVE]"||
 !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)){
 console.log("CN_R2_STAGING_CREDENTIALS_OR_BUCKET_INVALID");process.exit(4);
}
const enc=s=>encodeURIComponent(s).replace(/[!'()*]/g,c=>"%"+c.charCodeAt(0).toString(16).toUpperCase());
const hmac=(key,msg)=>createHmac("sha256",key).update(msg).digest();
const sha=s=>createHash("sha256").update(s).digest("hex");
const stamp=new Date().toISOString().replace(/[:-]|\.\d{3}/g,"");
const day=stamp.slice(0,8),scope=day+"/auto/s3/aws4_request";
const key="lingxifield-cn-readiness-probe/no-such-key-"+randomUUID();
const uri="/"+[bucket,...key.split("/")].map(enc).join("/");
const q={
 "X-Amz-Algorithm":"AWS4-HMAC-SHA256",
 "X-Amz-Credential":access+"/"+scope,
 "X-Amz-Date":stamp,
 "X-Amz-Expires":"60",
 "X-Amz-SignedHeaders":"host"
};
const query=Object.keys(q).sort().map(k=>enc(k)+"="+enc(q[k])).join("&");
const canonical=["GET",uri,query,"host:"+endpoint.host+"\n","host","UNSIGNED-PAYLOAD"].join("\n");
const toSign=["AWS4-HMAC-SHA256",stamp,scope,sha(canonical)].join("\n");
const keySig=hmac(hmac(hmac(hmac("AWS4"+secret,day),"auto"),"s3"),"aws4_request");
const signature=createHmac("sha256",keySig).update(toSign).digest("hex");
const signed=endpoint.origin+uri+"?"+query+"&X-Amz-Signature="+signature;
async function getMissing(){
 return await new Promise((resolve,reject)=>{
  const req=httpsRequest(signed,{method:"GET",family:4,timeout:14000},res=>{
   const chunks=[];let total=0;
   res.on("data",data=>{
    total+=data.length;
    if(total>16384){req.destroy(new Error("R2_RESPONSE_TOO_LARGE"));return}
    chunks.push(data);
   });
   res.on("end",()=>{
    const response=Buffer.concat(chunks).toString("utf8");
    const code=/<Code>([a-zA-Z0-9]+)<\/Code>/.exec(response)?.[1]||"UNKNOWN";
    resolve({status:res.statusCode||0,code});
   });
   res.on("error",reject);
  });
  req.on("timeout",()=>req.destroy(Object.assign(new Error("TIMEOUT"),{code:"ETIMEDOUT"})));
  req.on("error",reject);
  req.end();
 });
}
let result;
try{result=await getMissing()}
catch(e){
 console.log("CN_R2_SIGNED_GET_ERROR="+(["ETIMEDOUT","ENETUNREACH","ECONNRESET","EAI_AGAIN"].includes(e.code)?e.code:"REQUEST_FAILED"));
 process.exit(5);
}
console.log("CN_R2_SIGNED_GET_HTTP="+result.status);
console.log("CN_R2_SIGNED_GET_RESULT="+result.code);
if(result.status!==404||result.code!=="NoSuchKey"){
 console.log("CN_R2_AUTHENTICATED_BUCKET_PROOF_FAILED_NO_CONFIG_CHANGE");process.exit(5);
}
console.log("CN_R2_AUTHENTICATED_BUCKET_PROOF_PASS");
if(flag==="--inspect-read-only"){
 console.log("CN_R2_STAGE_ACCOUNT_INSPECT_COMPLETE_NO_CHANGES");
 process.exit(0);
}
if(cfgId===match[1]){
 console.log("CN_R2_STAGE_ACCOUNT_ID_ALREADY_CORRECT");
 process.exit(0);
}
const lines=source.split(/\r?\n/);
const rows=lines.map((line,i)=>/^\s*R2_ACCOUNT_ID\s*=/.test(line)?i:-1).filter(i=>i>=0);
if(rows.length!==1){console.log("CN_R2_ACCOUNT_CONFIG_DUPLICATE_OR_MISSING_NO_CHANGE");process.exit(6)}
if((stat.mode&0o077)!==0){console.log("CN_R2_STAGE_ENV_PERMISSIONS_TOO_OPEN_NO_CHANGE");process.exit(6)}
const dest=path.dirname(envPath);
const backup=path.join(dest,"staging.env.before-r2-account-"+new Date().toISOString().replace(/[^0-9]/g,"").slice(0,14)+"-"+process.pid);
const tmp=path.join(dest,".staging-r2-"+process.pid+"-"+randomUUID());
let touched=false;
try{
 fs.copyFileSync(envPath,backup,fs.constants.COPYFILE_EXCL);
 fs.chmodSync(backup,0o600);
 lines[rows[0]]="R2_ACCOUNT_ID="+match[1];
 const next=lines.join(source.includes("\r\n")?"\r\n":"\n");
 const fd=fs.openSync(tmp,"wx",0o600);
 try{fs.writeFileSync(fd,next,"utf8");fs.fsyncSync(fd)}finally{fs.closeSync(fd)}
 fs.chownSync(tmp,stat.uid,stat.gid);
 fs.chmodSync(tmp,stat.mode&0o777);
 fs.renameSync(tmp,envPath);
 touched=true;
}catch{console.log("CN_R2_STAGE_ACCOUNT_WRITE_FAILED_NO_PROD_CHANGE");process.exit(7)}
finally{if(fs.existsSync(tmp))fs.unlinkSync(tmp)}
if(touched){
 const nextEnv=parseEnv(fs.readFileSync(envPath,"utf8"));
 if(nextEnv.R2_ACCOUNT_ID!==match[1]||nextEnv.R2_ENDPOINT!==env.R2_ENDPOINT){
  console.log("CN_R2_STAGE_ACCOUNT_POSTVERIFY_FAILED");process.exit(7);
 }
 console.log("CN_R2_STAGING_ACCOUNT_ID_REPAIRED_BACKUP_CREATED");
 console.log("CN_R2_STAGING_ACCOUNT_ID_MATCH=PASS");
 console.log("CN_R2_PRODUCTION_ENV_AND_3188_UNTOUCHED");
}
