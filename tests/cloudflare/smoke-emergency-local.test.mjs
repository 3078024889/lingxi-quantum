import test from "node:test";
import assert from "node:assert/strict";
import {smokeEmergencyLocal} from "../../scripts/cloudflare/smoke-emergency-local.mjs";
test("fails closed against wrong auth response, never counts 200 as usable backend",async()=>{
 const good=async (url,request)=>{
  const path=new URL(url).pathname;
  if(path==="/api/health")return Response.json({ok:true,service:"lingxifield"});
  if(path.startsWith("/api/"))return Response.json({error:"PUBLIC_PREVIEW_BACKEND_DISABLED"},{
    status:503,headers:{"cache-control":"private, no-store"}});
  return new Response(`<title>LINGXIFIELD SIAI PDF</title>`,{status:200});
 };
 const pass=await smokeEmergencyLocal("http://127.0.0.1:8787",{fetcher:good});
 assert.equal(pass.status,"passed");
 assert.equal(pass.checks.length,8);
 const broken=await smokeEmergencyLocal("http://localhost:8787",{fetcher:async (url,req)=>{
  if(new URL(url).pathname==="/api/pay/create")return Response.json({ok:true});
  return good(url,req);
 }});
 assert.equal(broken.status,"failed");
 assert(broken.checks.some(c=>c.path==="/api/pay/create"&&!c.ok));
});
test("rejects nonlocal and remote preview targets",async()=>{
 for(const bad of ["https://lingxifield.com","https://127.0.0.1:8787",
  "http://example.com:8787","http://127.0.0.1.evil.com:8787"])
  await assert.rejects(()=>smokeEmergencyLocal(bad,{fetcher:async()=>new Response("x")}));
});
