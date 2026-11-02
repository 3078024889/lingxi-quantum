#!/usr/bin/env node
// V159: opt-in real R2 encrypted-attachment staging test.
// Uses only a random e2e object in a separately acknowledged non-production bucket.
// Never touches a user's note, payment, database row or existing object.
import assert from "node:assert/strict";
import {createCipheriv,createDecipheriv,createHash,createHmac,hkdfSync,randomBytes,randomUUID} from "node:crypto";
const CHUNK=1048576,MAGIC=Buffer.from("LXBURN2!"),sha=x=>createHash("sha256").update(x).digest("hex");
function keyFor(secret){return Buffer.from(hkdfSync("sha256",secret,Buffer.from("LINGXIFIELD-BURN-FILES-V2"),Buffer.from("private-attachment-aes-256-gcm"),32))}
function encrypt(plain,secret){
 const key=keyFor(secret),header=Buffer.alloc(20),parts=[];
 MAGIC.copy(header);header.writeUInt32LE(CHUNK,8);header.writeBigUInt64LE(BigInt(plain.length),12);parts.push(header);
 for(let i=0,pos=0;pos<plain.length;i++,pos+=CHUNK){
  const iv=randomBytes(12),aad=Buffer.alloc(24);header.copy(aad);aad.writeUInt32LE(i,20);
  const a=createCipheriv("aes-256-gcm",key,iv);a.setAAD(aad);
  parts.push(iv,a.update(plain.subarray(pos,pos+CHUNK)),a.final(),a.getAuthTag());
 }
 return Buffer.concat(parts);
}
function decrypt(cipher,secret){
 assert(cipher.subarray(0,8).equals(MAGIC),"BAD_HEADER");
 assert.equal(cipher.readUInt32LE(8),CHUNK,"BAD_CHUNK_SIZE");
 const length=Number(cipher.readBigUInt64LE(12));
 assert(Number.isSafeInteger(length)&&length>0,"BAD_PLAINTEXT_SIZE");
 assert.equal(cipher.length,20+length+Math.ceil(length/CHUNK)*28,"BAD_CIPHERTEXT_SIZE");
 const key=keyFor(secret),parts=[];let remaining=length,pos=20;
 for(let i=0;remaining>0;i++){
  const n=Math.min(CHUNK,remaining),iv=cipher.subarray(pos,pos+12);pos+=12;
  const enc=cipher.subarray(pos,pos+n);pos+=n;
  const tag=cipher.subarray(pos,pos+16);pos+=16;
  const aad=Buffer.alloc(24);cipher.subarray(0,20).copy(aad);aad.writeUInt32LE(i,20);
  const a=createDecipheriv("aes-256-gcm",key,iv);a.setAAD(aad);a.setAuthTag(tag);
  parts.push(a.update(enc),a.final());remaining-=n;
 }
 return Buffer.concat(parts);
}
function signedTransport(){
 const endpoint=new URL((process.env.R2_ENDPOINT||"").replace(/\/+$/,""));
 assert.equal(endpoint.protocol,"https:","TLS_REQUIRED");
 assert(/^[a-zA-Z0-9-]+\.r2\.cloudflarestorage\.com$/.test(endpoint.hostname),"OFFICIAL_R2_ENDPOINT_REQUIRED");
 assert(endpoint.pathname==="/"&&!endpoint.search&&!endpoint.hash&&!endpoint.username,"R2_ENDPOINT_INVALID");
 const bucket=process.env.R2_BUCKET_PRIVATE_BURN,id=process.env.R2_ACCESS_KEY_ID,secret=process.env.R2_SECRET_ACCESS_KEY;
 assert(bucket&&id&&secret,"R2_CREDENTIALS_MISSING");
 const enc=x=>encodeURIComponent(x).replace(/[!'()*]/g,c=>"%"+c.charCodeAt(0).toString(16).toUpperCase());
 const h=(key,s)=>createHmac("sha256",key).update(s).digest();
 const sign=(method,key)=>{
  const date=new Date().toISOString().replace(/[:-]|\.\d{3}/g,""),ymd=date.slice(0,8),scope=ymd+"/auto/s3/aws4_request";
  const uri="/"+[bucket,...key.split("/")].map(enc).join("/");
  const queryFields={"X-Amz-Algorithm":"AWS4-HMAC-SHA256","X-Amz-Credential":id+"/"+scope,"X-Amz-Date":date,"X-Amz-Expires":"120","X-Amz-SignedHeaders":"host"};
  const query=Object.keys(queryFields).sort().map(k=>enc(k)+"="+enc(queryFields[k])).join("&");
  const canonical=[method,uri,query,"host:"+endpoint.host+"\n","host","UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign=["AWS4-HMAC-SHA256",date,scope,sha(canonical)].join("\n");
  const k=h(h(h(h("AWS4"+secret,ymd),"auto"),"s3"),"aws4_request");
  return endpoint.origin+uri+"?"+query+"&X-Amz-Signature="+createHmac("sha256",k).update(stringToSign).digest("hex");
 };
 const request=async(method,key,body)=>{
  const options={method,redirect:"error",cache:"no-store",signal:AbortSignal.timeout(25000)};
  if(body){options.body=body;options.headers={"Content-Type":"application/vnd.lingxifield.burn-encrypted"}}
  const response=await fetch(sign(method,key),options);
  const result={status:response.status,size:Number(response.headers.get("content-length")||0)};
  if(method==="GET"&&response.status===200)result.body=Buffer.from(await response.arrayBuffer());
  else await response.body?.cancel();
  return result;
 };
 return {put:(k,v)=>request("PUT",k,v),head:k=>request("HEAD",k),get:k=>request("GET",k),del:k=>request("DELETE",k)};
}
function mockTransport(leaveFile=false){
 const store=new Map();
 return {put:async(k,v)=>{store.set(k,Buffer.from(v));return {status:200}},head:async k=>store.has(k)?{status:200,size:store.get(k).length}:{status:404},
  get:async k=>store.has(k)?{status:200,body:Buffer.from(store.get(k))}:{status:404},
  del:async k=>{if(!leaveFile)store.delete(k);return {status:204}}};
}
async function verify(transport){
 const objectKey="__lingxifield_staging_privacy_e2e/"+randomUUID()+".encrypted";
 const plain=randomBytes(CHUNK+147),secret=randomBytes(32),cipher=encrypt(plain,secret);
 assert.equal(cipher.length,20+plain.length+2*28);
 let uploaded=false,verified=false;
 try{
  const put=await transport.put(objectKey,cipher);
  assert([200,201,204].includes(put.status),"R2_PUT_FAILED_"+put.status);uploaded=true;
  const head=await transport.head(objectKey);
  assert.equal(head.status,200,"R2_HEAD_AFTER_UPLOAD_FAILED");
  assert.equal(head.size,cipher.length,"R2_SIZE_MISMATCH");
  const get=await transport.get(objectKey);
  assert.equal(get.status,200,"R2_GET_AFTER_UPLOAD_FAILED");
  assert.equal(sha(get.body),sha(cipher),"R2_CIPHERTEXT_MISMATCH");
  assert(decrypt(get.body,secret).equals(plain),"R2_DECRYPT_MISMATCH");
  assert.throws(()=>decrypt(get.body,randomBytes(32)),"WRONG_KEY_ACCEPTED");
  const altered=Buffer.from(get.body);altered[42]^=1;
  assert.throws(()=>decrypt(altered,secret),"TAMPER_ACCEPTED");
  const del=await transport.del(objectKey);
  assert([200,202,204,404].includes(del.status),"R2_DELETE_FAILED_"+del.status);
  const afterHead=await transport.head(objectKey),afterGet=await transport.get(objectKey);
  assert.equal(afterHead.status,404,"DELETE_NOT_CONFIRMED_HEAD_"+afterHead.status);
  assert.equal(afterGet.status,404,"DELETE_NOT_CONFIRMED_GET_"+afterGet.status);
  verified=true;
  return {encryptedChunks:2,cipherBytes:cipher.length,decrypt:"PASS",wrongKey:"REJECTED",tamper:"REJECTED",deleted:"HEAD_404_GET_404"};
 }finally{
  if(uploaded&&!verified)try{await transport.del(objectKey)}catch{}
 }
}
async function main(){
 if(process.argv[2]==="--self-test"){
  const outcome=await verify(mockTransport());
  await assert.rejects(verify(mockTransport(true)),/DELETE_NOT_CONFIRMED_HEAD_200/);
  console.log("R2_STAGING_V159_SELF_TEST_PASS",JSON.stringify(outcome));
  console.log("R2_REMOTE_NOT_CONTACTED");return;
 }
 assert.equal(process.argv[2],"--staging","USAGE: --self-test or --staging");
 const bucket=process.env.R2_BUCKET_PRIVATE_BURN||"";
 assert.equal(process.env.R2_STAGING_LIFECYCLE_APPROVED,"yes","STAGING_APPROVAL_REQUIRED");
 assert(bucket&&bucket===process.env.R2_STAGING_BUCKET_ACK,"STAGING_BUCKET_EXACT_MATCH_REQUIRED");
 assert(/(stage|staging|sandbox|test|e2e)/i.test(bucket),"PRODUCTION_BUCKET_REFUSED");
 const result=await verify(signedTransport());
 console.log("R2_STAGING_V159_REAL_PASS",JSON.stringify(result));
 console.log("No production data or payment touched. One-view/TTL database flow requires separate validation.");
}
main().catch(error=>{console.error("R2_STAGING_V159_FAILED",error.message);process.exitCode=1});
