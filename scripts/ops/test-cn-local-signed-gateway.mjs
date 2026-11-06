import test from "node:test";
import assert from "node:assert/strict";
import {createHmac} from "node:crypto";
import {localSignedGatewayConfigured,localSignedGatewayResponse} from "../../lib/tools/document/local-signed-gateway.ts";

const SECRET="x".repeat(48);
const CN={
 NEXT_PUBLIC_SITE_URL:"https://lingxifield.cn",
 LINGXIFIELD_DOCUMENT_GATEWAY_SECRET:SECRET
};
const makeFile=(name="report.docx")=>new File([Buffer.from("DOCX local-gateway signed test")],name,{
 type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
});
test("must fail closed for com and Vercel regardless of configured secret",async()=>{
 for(const env of [
  {...CN,NEXT_PUBLIC_SITE_URL:"https://lingxifield.com"},
  {...CN,VERCEL:"1"},
  {...CN,LINGXIFIELD_DOCUMENT_GATEWAY_SECRET:"short"},
  {...CN,LINGXIFIELD_DOCUMENT_GATEWAY_SECRET:""}
 ]){
  assert.equal(localSignedGatewayConfigured(env),false);
  const response=await localSignedGatewayResponse(makeFile(),AbortSignal.timeout(5000),{
   env,fetcher:async()=>{throw Error("UNAUTHORIZED_NETWORK_ATTEMPT")}
  });
  assert.equal(response,null);
 }
});
test("signs the exact v1 HMAC gateway ticket and targets only loopback port 3100",async()=>{
 const f=makeFile("报告-2026.docx"),nowMs=1772890000000;
 let calls=0;
 const response=await localSignedGatewayResponse(f,AbortSignal.timeout(5000),{
  env:CN,nowMs,
  fetcher:async(url,init)=>{
   calls++;
   assert.equal(url,"http://127.0.0.1:3100/convert");
   assert.equal(init.method,"POST");
   assert.equal(init.redirect,"error");
   assert.equal(init.cache,"no-store");
   assert.ok(init.signal);
   const h=init.headers;
   assert.equal(h["x-lingxifield-ticket-version"],"v1");
   assert.equal(decodeURIComponent(h["x-lingxifield-filename"]),f.name);
   assert.equal(h["x-lingxifield-size"],String(f.size));
   assert.equal(h["x-lingxifield-exp"],String(Math.floor(nowMs/1000)+300));
   assert.match(h["x-lingxifield-nonce"],/^[0-9a-f-]{36}$/i);
   assert.deepEqual(Buffer.from(init.body),Buffer.from(await f.arrayBuffer()));
   const p=["v1",h["x-lingxifield-exp"],h["x-lingxifield-nonce"],f.size,f.name,f.type].join("\n");
   const sig=createHmac("sha256",SECRET).update(p).digest("base64url");
   assert.equal(h["x-lingxifield-token"],sig);
   return new Response("%PDF-1.7\n%%EOF",{status:200});
  }
 });
 assert.equal(calls,1);
 assert.equal(response.status,200);
});
test("does not let malicious newline or long filenames reach the gateway",async()=>{
 for(const name of ["unsafe\n.docx","path/escape.docx","a".repeat(241)+".docx"]){
  await assert.rejects(()=>localSignedGatewayResponse(makeFile(name),AbortSignal.timeout(5000),{
   env:CN,fetcher:async()=>{throw Error("SHOULD_NOT_CALL_GATEWAY")}
  }),/DOCUMENT_GATEWAY_FILENAME_INVALID/);
 }
});
test("gateway rejection is explicit and does not return an unchecked PDF",async()=>{
 await assert.rejects(()=>localSignedGatewayResponse(makeFile(),AbortSignal.timeout(5000),{
  env:CN,fetcher:async()=>new Response("busy",{status:503})
 }),/DOCUMENT_GATEWAY_HTTP_503/);
});
