#!/usr/bin/env node
/* Verify PUBLIC ONLY Cloudflare Worker Preview, never prod or private URLs. */
import {pathToFileURL} from "node:url";
const publicRoutes=[["/","LINGXIFIELD"],["/siai","SIAI"],["/tools","PDF"]];
const closedRoutes=[["GET","/api/sasi/account"],["POST","/api/pay/create"],
 ["POST","/api/sasi/byok/image"],["POST","/api/sasi/byok/video"]];

export function previewOrigin(input){
 let u;try{u=new URL(input)}catch{throw Error("INVALID_PREVIEW_URL")}
 const parts=u.hostname.split(".");
 if(u.protocol!=="https:"||u.username||u.password||u.port||u.search||u.hash||
    u.pathname!=="/"||parts.length<4||parts.at(-2)!=="workers"||parts.at(-1)!=="dev"||
    !parts.every(p=>/^[a-z0-9][a-z0-9-]*$/.test(p)))throw Error("WORKERS_DEV_PREVIEW_ONLY");
 return u.origin;
}
export async function smokePreview(input,{fetcher=fetch}={}){
 const origin=previewOrigin(input),checks=[];
 async function check(path,method="GET"){
  const url=new URL(path,origin);
  const res=await fetcher(url.toString(),{method,redirect:"manual",
   signal:AbortSignal.timeout(18000),
   headers:method==="POST"?{"Content-Type":"application/json"}:{}});
  if(method==="GET"&&path==="/api/health"){
   const body=await res.json().catch(()=>({}));
   return res.status===200&&body.ok===true&&body.service==="lingxifield";
  }
  if(path.startsWith("/api/")){
   const body=await res.json().catch(()=>({}));
   return res.status===503&&body.error==="PUBLIC_PREVIEW_BACKEND_DISABLED"&&
      (res.headers.get("cache-control")||"").includes("no-store");
  }
  const html=await res.text();
  const marker=publicRoutes.find(item=>item[0]===path)?.[1]||"";
  return res.status===200&&html.includes(marker);
 }
 for(const [path] of publicRoutes)checks.push({path,ok:await check(path)});
 checks.push({path:"/api/health",ok:await check("/api/health")});
 for(const [method,path] of closedRoutes)checks.push({path,method,ok:await check(path,method)});
 return {origin,checks,status:checks.every(c=>c.ok)?"passed":"failed",publicOnly:true,
   productionReady:false,noDnsChange:true};
}
async function main(args=process.argv.slice(2)){
 if(!args[0])throw Error("PREVIEW_URL_REQUIRED");
 const report=await smokePreview(args[0]);console.log(JSON.stringify(report,null,2));
 return report.status==="passed"?0:1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 main().then(x=>{process.exitCode=x;}).catch(e=>{console.error("PREVIEW_HTTP_PROOF_FAILED",e.message);process.exitCode=1;});
}
