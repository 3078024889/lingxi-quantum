#!/usr/bin/env node
/* Read-only HTTP smoke against a local, disposable Cloudflare public-only preview. */
import {pathToFileURL} from "node:url";
const pages=[["/","LINGXIFIELD"],["/siai","SIAI"],["/tools","PDF"]];
const blocked=[
 ["GET","/api/sasi/account"],["POST","/api/pay/create"],
 ["POST","/api/sasi/byok/image"],["POST","/api/sasi/byok/video"],
];
async function request(base,method,path,fetcher){
 const u=new URL(path,base);
 if(!["127.0.0.1","localhost"].includes(u.hostname))throw Error("NOT_A_LOCAL_PREVIEW");
 const response=await fetcher(u.toString(),{method,redirect:"manual",signal:AbortSignal.timeout(12000),
   headers:method==="POST"?{"content-type":"application/json"}:{}});
 return response;
}
export async function smokeEmergencyLocal(base,{fetcher=fetch}={}){
 const url=new URL(base);if(!["localhost","127.0.0.1"].includes(url.hostname)||url.protocol!=="http:")
   throw Error("LOCAL_HTTP_ONLY");
 const report={base,status:"failed",checks:[]};
 for(const [path,needle] of pages){
   const response=await request(base,"GET",path,fetcher);
   const text=await response.text();
   const ok=response.status===200&&text.includes(needle)&&
     !response.headers.get("location");
   report.checks.push({path,status:response.status,ok,kind:"public"});
 }
 const health=await request(base,"GET","/api/health",fetcher);
 let json;try{json=await health.json();}catch{json=null;}
 report.checks.push({path:"/api/health",status:health.status,
   ok:health.status===200&&json?.ok===true&&json?.service==="lingxifield",
   kind:"health"});
 for(const [method,path] of blocked){
   const response=await request(base,method,path,fetcher);
   let body;try{body=await response.json()}catch{body={}};
   const ok=response.status===503&&
     body.error==="PUBLIC_PREVIEW_BACKEND_DISABLED"&&
     response.headers.get("cache-control")?.includes("no-store");
   report.checks.push({path,method,status:response.status,ok,kind:"must-fail-closed"});
 }
 report.status=report.checks.every(x=>x.ok)?"passed":"failed";
 report.publicOnly=true;
 report.productionReady=false;
 report.cloudflareDeployed=false;
 return report;
}
async function main(args){
 const base=args[0];if(!base)throw Error("LOCAL_ORIGIN_REQUIRED");
 const report=await smokeEmergencyLocal(base);
 console.log(JSON.stringify(report,null,2));
 return report.status==="passed"?0:1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 main(process.argv.slice(2)).then(code=>process.exitCode=code)
   .catch(e=>{console.error("LOCAL_PREVIEW_SMOKE_FAILED",e.message);process.exitCode=1;});
}
