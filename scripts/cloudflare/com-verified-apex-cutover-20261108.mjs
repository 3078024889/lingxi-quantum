#!/usr/bin/env node
// Cloudflare .com apex-only canary promotion with strict route compare-and-rollback.
// This script does not touch .cn, www, private payment flags or any other Workers route.
const account=process.env.CLOUDFLARE_ACCOUNT_ID;
const token=process.env.CLOUDFLARE_API_TOKEN;
const githubToken=process.env.GH_TOKEN;
const runId=process.env.COM_VERIFIED_CANARY_RUN;
const expectedSha=process.env.COM_VERIFIED_CANARY_SHA;
const prev="lingxifield-com-static-gateway-canary-20261107";
const next="lingxifield-com-main-20261108";
const oldPattern="lingxifield.com/*";
if(!account||!token||!githubToken||!runId||!/^[0-9a-f]{40}$/.test(expectedSha||""))
 throw Error("CLOUDFLARE_OR_CANARY_GATE_NOT_CONFIGURED");
const cloudBase="https://api.cloudflare.com/client/v4";
async function cf(path,init={}){
 const res=await fetch(cloudBase+path,{...init,
  headers:{authorization:"Bearer "+token, "content-type":"application/json",...(init.headers||{})},
  signal:AbortSignal.timeout(28000)});
 const json=await res.json().catch(()=>null);
 if(!res.ok||!json?.success)throw Error("CLOUDFLARE_REQUEST_FAILED:"+path+":HTTP_"+res.status+
   ":errors_"+JSON.stringify((json?.errors||[]).map(e=>e.code)));
 return json.result;
}
async function status(url,opts={}){
 try{
  const res=await fetch(url,{...opts,redirect:"manual",signal:AbortSignal.timeout(30000)});
  return {status:res.status,headers:res.headers};
 }catch{return {status:0,headers:new Headers()}}
}
async function probe(base,phase,attempts=3){
 const routes=["/","/siai","/tools","/sasi","/sasi/marketplace",
   "/announcements","/api/health","/api/pay/providers",
   "/api/sasi/software/catalog","/api/sasi/marketplace/listings"];
 const staticRoutes=new Set(["/","/siai","/tools","/sasi","/sasi/marketplace","/announcements"]);
 for(const path of routes){
  let good=0;
  for(let i=0;i<attempts;i++){
   const result=await status(base+path);
   const staticOK=!staticRoutes.has(path)||
    result.headers.get("x-lingxi-render-mode")==="static-edge-verified";
   console.log("COM_"+phase+"_PAGE path="+path+" attempt="+(i+1)+
     " http="+result.status+" static="+staticOK);
   if(result.status===200&&staticOK)good++;
  }
  if(good!==attempts)throw Error("COM_"+phase+"_UNSTABLE_ROUTE:"+path+":"+good+"/"+attempts);
 }
 for(const path of ["/api/sasi/marketplace/seller","/api/sasi/marketplace/my-orders"]){
  const x=await status(base+path);
  console.log("COM_"+phase+"_PRIVATE "+path+" HTTP_"+x.status);
  if(x.status!==401)throw Error("COM_"+phase+"_PRIVATE_AUTH_FAILURE:"+path);
 }
 const wasm=await status(base+"/media/ffmpeg-0.12.10/ffmpeg-core.wasm",
  {headers:{range:"bytes=0-1023"}});
 console.log("COM_"+phase+"_R2_206 http="+wasm.status);
 if(wasm.status!==206||!/^bytes 0-1023\//.test(wasm.headers.get("content-range")||""))
  throw Error("COM_"+phase+"_R2_RANGE_FAILURE");
}
const gh=await fetch("https://api.github.com/repos/3078024889/lingxi-quantum/actions/runs/"+runId,{
 headers:{authorization:"Bearer "+githubToken,accept:"application/vnd.github+json",
  "user-agent":"lingxifield-com-verified-canary-release"},
 signal:AbortSignal.timeout(20000)});
if(!gh.ok)throw Error("GITHUB_CANARY_READ_FAILED:"+gh.status);
const run=await gh.json();
if(run.head_sha!==expectedSha||run.status!=="completed"||run.conclusion!=="success")
 throw Error("EXACT_COM_CANARY_CI_NOT_SUCCESS");
console.log("COM_PINNED_SOURCE_CI_SUCCESS:"+runId);
await probe("https://"+next+".3078024889.workers.dev","CANARY");
const zones=await cf("/zones?name=lingxifield.com");
const matches=zones.filter(z=>z.name==="lingxifield.com"&&z.status==="active");
if(matches.length!==1)throw Error("CLOUDFLARE_ZONE_NOT_UNAMBIGUOUS");
const zone=matches[0].id;
const routes=await cf("/zones/"+zone+"/workers/routes");
const target=routes.filter(x=>x.pattern===oldPattern);
if(target.length!==1||target[0].script!==prev)throw Error("PRODUCTION_APEX_WILDCARD_NOT_EXPECTED");
const www=routes.filter(x=>x.pattern==="www.lingxifield.com/*");
if(www.length!==1||www[0].script!==prev)throw Error("WWW_WILDCARD_CHANGED_STOP");
for(const pattern of ["lingxifield.com/api/account/money-admin*",
 "lingxifield.com/api/tools/pass*","lingxifield.com/api/site-announcements*"]){
 const matched=routes.filter(x=>x.pattern===pattern);
 if(matched.length!==1||matched[0].script!=="lingxifield-com-admin-facade")
  throw Error("SPECIAL_ADMIN_ROUTE_CHANGED_STOP:"+pattern);
}
const routeEndpoint="/zones/"+zone+"/workers/routes/"+target[0].id;
console.log("COM_APEX_ROUTE_GUARD_ALL_FIVE_PASSED");
let changed=false, success=false;
async function update(script){
 const result=await cf(routeEndpoint,{method:"PUT",body:JSON.stringify({pattern:oldPattern,script})});
 if(result.script!==script)throw Error("ROUTE_WRITE_DID_NOT_MATCH_EXPECTED_SCRIPT");
}
try{
 await update(next);
 changed=true;
 console.log("COM_APEX_ROUTE_UPDATED_NEXT_ONLY");
 await probe("https://lingxifield.com","POSTCUTOVER",2);
 const oldWww=await status("https://www.lingxifield.com/siai");
 console.log("COM_WWW_CANONICAL_HTTP_"+oldWww.status);
 if(oldWww.status!==308)throw Error("WWW_CANONICAL_REDIRECT_CHANGED");
 const postRoutes=await cf("/zones/"+zone+"/workers/routes");
 if(postRoutes.filter(x=>x.pattern===oldPattern&&x.script===next).length!==1)
  throw Error("PRODUCTION_WORKER_ROUTE_NOT_PERSISTENT");
 success=true;
 console.log("COM_FULL_PUBLIC_WORKER_SASI_R2_RELEASE_PASS_PRODUCTION");
 console.log("COM_PAYMENT_PRIVATE_R2_AND_SELLER_PAYOUTS_STILL_FEATURE_GATED");
}finally{
 if(changed&&!success){
  console.log("COM_POSTCUTOVER_HEALTH_FAIL_ROLLBACK_BEGIN");
  try{await update(prev);console.log("COM_ROUTE_ROLLBACK_CONFIRMED")}catch(e){
   console.error("COM_ROUTE_ROLLBACK_FAILED_MANUAL_ACTION_REQUIRED:"+String(e));
   process.exitCode=1;
  }
 }
}
