#!/usr/bin/env node
/* Self-hosted Node Next.js runtime acceptance, intentionally no payments/users. */
import {pathToFileURL} from "node:url";
export async function smokeStandalone(input,{fetcher=fetch}={}){
 const u=new URL(input);
 if(u.protocol!=="http:"||!["127.0.0.1","localhost"].includes(u.hostname)||
    u.username||u.password||u.pathname!=="/"||u.search||u.hash)
    throw Error("STANDALONE_LOOPBACK_ONLY");
 const checks=[];
 for(const [path,kind] of [
  ["/api/health","health"],["/","homepage"],["/siai","ranking"],
  ["/tools","tools"],["/api/public/siai-widget","directory"]
 ]){
  const response=await fetcher(new URL(path,u).toString(),{
   redirect:"manual",signal:AbortSignal.timeout(24000)});
  let ok=false;
  if(kind==="health"){
   const data=await response.json().catch(()=>null);
   ok=response.status===200&&data?.ok===true&&data?.service==="lingxifield";
  }else if(kind==="directory"){
   const data=await response.json().catch(()=>null);
   ok=response.status===200&&Array.isArray(data?.rows)&&data.rows.length>=30;
  }else{
   const body=await response.text();
   ok=response.status===200&&body.length>500&&
      !response.headers.get("location")&&/<html/i.test(body);
  }
  checks.push({path,status:response.status,ok});
 }
 return {status:checks.every(x=>x.ok)?"passed":"failed",checks,
   isSelfContainedNodeRuntime:true,authNotVerified:true,paymentsNotVerified:true,productionReady:false};
}
async function main(args=process.argv.slice(2)){
 if(!args[0])throw Error("LOOPBACK_URL_REQUIRED");
 const result=await smokeStandalone(args[0]);
 console.log(JSON.stringify(result,null,2));
 if(result.status!=="passed")process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)
 main().catch(e=>{console.error("COM_NODE_SMOKE_FAILED",e.message);process.exitCode=1});
