#!/usr/bin/env node
// Read-only Linux readiness gate for Aliyun CN staging port 3189.
// Never emits secret values or modifies 3188, DNS, Nginx, Supabase or customer data.
import fs from "node:fs";
import http from "node:http";
import {parseEnv} from "node:util";
import {execFileSync} from "node:child_process";

if(process.argv.length!==3||process.argv[2]!=="--read-only"){
 console.log("CN_STAGE_READINESS_REQUIRES_EXPLICIT_READ_ONLY_FLAG");process.exit(2);
}
if(process.getuid?.()!==0){console.log("CN_STAGE_READINESS_NEEDS_LOCAL_ROOT_CONFIG");process.exit(2)}
function show(name,prop){
 try{return execFileSync("systemctl",["show",name,"-p",prop,"--value"],{encoding:"utf8",timeout:5000}).trim()}
 catch{return ""}
}
function active(name){
 try{return execFileSync("systemctl",["is-active",name],{encoding:"utf8",timeout:5000}).trim()==="active"}
 catch{return false}
}
const check=(name,pass)=>{console.log(name+"="+(pass?"PASS":"FAIL"));if(!pass)process.exitCode=1;};
function request(method,port,pathname,timeoutMs=8000,headers={}){
 return new Promise((resolve,reject)=>{
  const req=http.request({hostname:"127.0.0.1",port,path:pathname,method,timeout:timeoutMs,headers},res=>{
   const chunks=[];let size=0;
   if(pathname==="/api/tools/engine/health"){
    res.on("data",part=>{size+=part.length;if(size>262144){req.destroy(new Error("ENGINE_RESPONSE_TOO_LARGE"));return;}chunks.push(part)});
   }else{res.resume()}
   res.on("end",()=>resolve({status:res.statusCode||0,body:Buffer.concat(chunks).toString("utf8")}));
   res.on("error",reject);
  });
  req.on("timeout",()=>req.destroy(new Error("LOCAL_HEALTH_TIMEOUT")));
  req.on("error",reject);
  req.end();
 });
}
const path="/etc/lingxifield/staging.env";
if(!fs.existsSync(path)){console.log("CN_STAGING_ENV_MISSING");process.exit(2)}
let env;
try{env=parseEnv(fs.readFileSync(path,"utf8"))}
catch{console.log("CN_STAGING_ENV_PARSE_FAILED");process.exit(2)}
check("CN_STAGE_CONFIG_SITE",env.NEXT_PUBLIC_SITE_URL==="https://lingxifield.cn");
check("CN_STAGE_CONFIG_SUPABASE",env.NEXT_PUBLIC_SUPABASE_URL==="https://sxsgdpqojepgbbrxrzlq.supabase.co");
check("CN_STAGE_PAYMENTS_DISABLED",["ALIPAY_ENABLED","WECHAT_MINI_VPAY_TOPUPS_ENABLED","WECHAT_MINI_VPAY_TOOLS_ENABLED"].every(k=>env[k]==="false"));
check("CN_3188_SYSTEMD_ACTIVE",active("lingxifield-ecs"));
check("CN_3189_SYSTEMD_ACTIVE",active("lingxifield-cn-stage"));
check("CN_3189_RELEASE_PATH",show("lingxifield-cn-stage","WorkingDirectory")==="/opt/lingxifield/releases/cn-pr199");
check("CN_3189_STAGING_ENV_ISOLATED",show("lingxifield-cn-stage","EnvironmentFiles").includes("/etc/lingxifield/staging.env"));
const ipv4DropIn="/etc/systemd/system/lingxifield-cn-stage.service.d/90-cn-ipv4first.conf";
const ipv4ConfigPresent=fs.existsSync(ipv4DropIn)&&fs.readFileSync(ipv4DropIn,"utf8").includes("--dns-result-order=ipv4first");
check("CN_3189_IPV4_DROPIN_PRESENT",ipv4ConfigPresent);
check("CN_3189_SERVER_BINARY",fs.existsSync("/opt/lingxifield/releases/cn-pr199/server.js"));
for(const route of ["/api/health","/","/tools","/siai"]){
 try{const r=await request("GET",3189,route,18000);check("CN_STAGE_HTTP_"+route.replace(/[^a-z0-9]/gi,"_"),r.status===200)}
 catch{check("CN_STAGE_HTTP_"+route.replace(/[^a-z0-9]/gi,"_"),false)}
}
try{const r=await request("GET",3189,"/api/tools/jobs");check("CN_STAGE_JOBS_NO_AUTH",r.status===401)}
catch{check("CN_STAGE_JOBS_NO_AUTH",false)}
try{
 const r=await request("GET",3189,"/api/tools/engine/health",130000);
 const data=JSON.parse(r.body);
 const expected=["sharp-libvips","mammoth","exceljs","readability","dompurify","turndown"];
 const available=new Set((data.engines||[]).filter(x=>x.available===true).map(x=>x.id));
 check("CN_STAGE_ENGINES_SIX",r.status===200&&expected.every(id=>available.has(id)));
 console.log("CN_STAGE_ENGINE_AVAILABLE_COUNT="+available.size);
}catch{check("CN_STAGE_ENGINES_SIX",false)}
try{const r=await request("GET",3100,"/health");check("CN_DOC_GATEWAY_HEALTH",r.status===200)}
catch{check("CN_DOC_GATEWAY_HEALTH",false)}
try{
 const r=await request("POST",3100,"/convert",12000,{"x-lingxifield-ext":"docx","content-length":"0"});
 console.log("CN_DOC_GATEWAY_NOAUTH_DOCX_HTTP="+r.status);
 check("CN_DOC_GATEWAY_UNAUTHORIZED_REJECTED",r.status===401);
}catch{check("CN_DOC_GATEWAY_UNAUTHORIZED_REJECTED",false)}
console.log("CN_SASI_COMPUTE_CONFIGURATION="+
 (env.SASI_COMPUTE_WORKER_URL&&env.SASI_COMPUTE_WORKER_SECRET?"PRESENT_UNVERIFIED":"MISSING_OR_DISABLED"));
console.log("CN_R2_BROWSER_PUT_GET_DELETE=REQUIRES_SEPARATE_TRANSACTIONAL_PROBE");
console.log("CN_REAL_PROVIDER_GENERATION_AND_PAYMENT_CALLBACKS=NOT_VERIFIED");
console.log("CN_PUBLIC_3188_SWITCH=NOT_ATTEMPTED");
if(process.exitCode){console.log("CN_STAGE_READINESS_READ_ONLY_FAILED");}
else{console.log("CN_STAGE_READINESS_READ_ONLY_PASS");}
