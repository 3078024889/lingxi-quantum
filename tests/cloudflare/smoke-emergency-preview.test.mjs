import test from "node:test";
import assert from "node:assert/strict";
import {previewOrigin,smokePreview} from "../../scripts/cloudflare/smoke-emergency-preview.mjs";
test("Only accepts actual Cloudflare workers.dev HTTPS preview origins",()=>{
 const url="https://com-public-recovery-lingxifield-public-preview-only.demo.workers.dev/";
 assert.equal(previewOrigin(url),url.slice(0,-1));
 for(const u of ["https://lingxifield.com","https://demo.workers.dev",
  "http://preview.worker.demo.workers.dev","https://preview.worker.demo.workers.dev.evil.com",
  "https://user:password@preview.worker.demo.workers.dev",
  "https://preview.worker.demo.workers.dev/secret"]){
  assert.throws(()=>previewOrigin(u));
 }
});
test("Remote smoke requires 200 public routes and no private payment entry",async()=>{
 const base="https://preview.worker.demo.workers.dev/";
 const good=async(url)=>{
  const pathname=new URL(url).pathname;
  if(pathname==="/api/health")return Response.json({ok:true,service:"lingxifield"});
  if(pathname.startsWith("/api/"))return Response.json({error:"PUBLIC_PREVIEW_BACKEND_DISABLED"},{
   status:503,headers:{"cache-control":"private, no-store"}});
  return new Response("<html>LINGXIFIELD SIAI PDF</html>",{status:200});
 };
 const ok=await smokePreview(base,{fetcher:good});
 assert.equal(ok.status,"passed");assert.equal(ok.checks.length,8);
 const weak=await smokePreview(base,{fetcher:async(url,init)=>{
  if(new URL(url).pathname==="/api/pay/create")return Response.json({redirect:"checkout"},{status:200});
  return good(url,init);
 }});
 assert.equal(weak.status,"failed");
});
