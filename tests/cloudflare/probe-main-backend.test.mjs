import test from "node:test";
import assert from "node:assert/strict";
import {validateProbeOrigin,probeMainBackend} from "../../scripts/cloudflare/probe-main-backend.mjs";

const origin="https://lingxifield.com";
function mockResponse(path,{disabled=false,leak=false,cacheable=false}={}) {
  if(disabled && (path==="/api/sasi/account"||path==="/api/tools/jobs"))
    return new Response('{"error":"PUBLIC_PREVIEW_BACKEND_DISABLED"}',{status:503,headers:{"content-type":"application/json"}});
  const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),
    {status,headers:{"content-type":"application/json",...headers}});
  if(path==="/api/health") return json({ok:true,service:"lingxifield"},200,{"cache-control":cacheable?"public,max-age=30":"no-store"});
  if(path==="/api/public/siai-widget") return json({publisher:"LINGXIFIELD",total:1,rows:[{id:"one"}]});
  if(path==="/api/sasi/capabilities") return json({stats:{count:1},matches:[]});
  if(path==="/api/sasi/account") return json(leak?{wallet:{balance:100}}:{error:"AUTH_REQUIRED"},leak?200:401);
  if(path==="/api/tools/jobs") return json({error:"请先登录"},401);
  return new Response("<!doctype html><html>LINGXIFIELD</html>",{headers:{"content-type":"text/html;charset=utf-8"}});
}
const fake=(opts={},observed=[])=>async (url,init)=>{
  observed.push({url,init});
  return mockResponse(new URL(url).pathname,opts);
};

test("target allowlist rejects open redirect, credentials and unintended hosts",()=>{
  assert.equal(validateProbeOrigin(origin),origin);
  assert.equal(validateProbeOrigin("https://lingxifield.cn"),"https://lingxifield.cn");
  assert.equal(validateProbeOrigin("https://example.3078024889.workers.dev"),"https://example.3078024889.workers.dev");
  for(const invalid of ["https://globalsiai.com","http://lingxifield.cn",
    "https://lingxifield.com/secret","https://lingxifield.com?token=a",
    "https://a:b@lingxifield.com","https://lingxifield.com:444",
    "https://workers.dev.attacker.net"]) assert.throws(()=>validateProbeOrigin(invalid));
});
test("normal public and unauthorized-only contracts pass; release is still unverified",async()=>{
  const observed=[];
  const result=await probeMainBackend(origin,{fetcher:fake({},observed)});
  assert.equal(result.anonymousBackendReady,true);
  assert.equal(result.releaseReady,false);
  assert.equal(result.exactShaVerified,false);
  assert.equal(result.checks.length,9);
  assert(observed.every(x=>x.init.method==="GET" && x.init.redirect==="manual" && x.init.cache==="no-store"));
});
test("public-only Cloudflare preview returning 503 is never deemed operational",async()=>{
  const result=await probeMainBackend(origin,{fetcher:fake({disabled:true})});
  assert.equal(result.anonymousBackendReady,false);
  assert.equal(result.checks.find(x=>x.path==="/api/sasi/account").reason,"BACKEND_DISABLED_OR_UNAVAILABLE");
  assert.equal(result.checks.find(x=>x.path==="/api/tools/jobs").status,503);
});
test("public access to private account is a contract/security failure",async()=>{
  const result=await probeMainBackend(origin,{fetcher:fake({leak:true})});
  assert.equal(result.anonymousBackendReady,false);
  assert.equal(result.checks.find(x=>x.path==="/api/sasi/account").reason,"HTTP_STATUS_MISMATCH");
});
test("cacheable health checks fail closed",async()=>{
  const result=await probeMainBackend(origin,{fetcher:fake({cacheable:true})});
  assert.equal(result.anonymousBackendReady,false);
  assert.equal(result.checks.find(x=>x.path==="/api/health").reason,"INVALID_CONTRACT_OR_CACHE_POLICY");
});
test("redirects and transport errors are not hidden as successful GETs",async()=>{
  const redirected=await probeMainBackend(origin,{fetcher:async()=>new Response(null,{status:302,headers:{location:"https://globalsiai.com"}})});
  assert.equal(redirected.anonymousBackendReady,false);
  const down=await probeMainBackend(origin,{fetcher:async()=>{throw Error("offline");}});
  assert(down.checks.every(x=>!x.ok && x.reason==="NETWORK_OR_RESPONSE_ERROR"));
});
