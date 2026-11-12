#!/usr/bin/env node
/**
 * Staging-only R2 large PUBLIC asset auditor/uploader.
 * Never touches user uploads, private storage, DNS, Worker routes or production DB.
 * --audit is read-only. A single R2-baseline video is verified through the
 * production/canary Worker binding and is never overwritten by bulk upload.
 */
import {createReadStream} from "node:fs";
import {readFile,stat,mkdtemp,rm} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {spawnSync} from "node:child_process";
import {largePublicAssets} from "./large-public-assets.mjs";
const root=resolve(".");
const manifest=JSON.parse(await readFile(join(root,"cloudflare-offload-report.json"),"utf8"));
const cfg=JSON.parse(await readFile(join(root,"wrangler.jsonc"),"utf8"));
const bucket="lingxifield-com-large-public";
if(manifest.releaseReady!==false||manifest.bucketName!==bucket||
 cfg.r2_buckets?.length!==1||cfg.r2_buckets[0]?.bucket_name!==bucket||
 cfg.r2_buckets[0]?.binding!=="LINGXI_PUBLIC_LARGE_R2")
 throw Error("UNVERIFIED_PUBLIC_R2_BUCKET_BINDING");
const assets=manifest.assets||[];
if(assets.length!==8)throw Error("R2_OBJECT_COUNT_MUST_BE_EIGHT");
const entries=[];
const seen=new Set();
async function digest(file){
 const h=createHash("sha256");
 for await(const chunk of createReadStream(file))h.update(chunk);
 return h.digest("hex");
}
for(const asset of assets){
 const p=String(asset.path||"");
 if(!/^\/[a-zA-Z0-9._/-]+$/.test(p)||p.includes("..")||p.includes("//")||seen.has(p))
  throw Error("INVALID_PUBLIC_R2_PATH");
 seen.add(p);
 const hashed=/^\/_next\/static\/media\/ort-wasm-simd-threaded\.asyncify\.[a-f0-9]{8,64}\.wasm$/.test(p);
 const expected=hashed?{bytes:26861777,contentType:"application/wasm"}:largePublicAssets[p];
 if(!expected||asset.bytes!==expected.bytes||asset.contentType!==expected.contentType||asset.r2Key!=="public"+p)
  throw Error("INVALID_PUBLIC_R2_OBJECT_MANIFEST:"+p);
 if(asset.source==="r2-baseline"){
  if(p!=="/images/entrance/lingxi-opening-desktop-v310.mp4"||expected.source!=="r2-baseline"||asset.sha256!==null)
   throw Error("INVALID_R2_BASELINE_ASSET_DECLARATION:"+p);
  entries.push({path:p,object:bucket+"/"+asset.r2Key,sha256:null,bytes:asset.bytes,contentType:asset.contentType,baseline:true});
  console.log("R2_BASELINE_ASSET_DEFERRED_TO_CANARY_RUNTIME:"+p);
  continue;
 }
 if(asset.source||!/^[a-f0-9]{64}$/.test(String(asset.sha256||"")))
  throw Error("INVALID_LOCAL_PUBLIC_R2_SHA256:"+p);
 const sourcePath=hashed
  ?join(root,".open-next","r2-upload-sources",p.slice(1))
  :join(root,"public",p.slice(1));
 const st=await stat(sourcePath);
 if(!st.isFile()||st.size!==asset.bytes)throw Error("PUBLIC_R2_SOURCE_NOT_IDENTICAL:"+p);
 if(await digest(sourcePath)!==asset.sha256)throw Error("PUBLIC_R2_SOURCE_SHA256_MISMATCH:"+p);
 entries.push({path:p,object:bucket+"/"+asset.r2Key,sha256:asset.sha256,bytes:asset.bytes,contentType:asset.contentType});
}
if(entries.length!==8||!seen.has("/media/ffmpeg-0.12.10/ffmpeg-core.wasm")||
 [...seen].filter(x=>x.startsWith("/_next/static/media/")).length!==1)
 throw Error("R2_REQUIRED_WASM_MANIFEST_NOT_COMPLETE");
const total=entries.reduce((n,e)=>n+e.bytes,0);
const localCount=entries.filter(e=>!e.baseline).length;
console.log("R2_LOCAL_SOURCE_FILES_SHA256_VERIFIED="+localCount);
console.log("R2_MANIFEST_OBJECTS="+entries.length);
console.log("R2_PUBLIC_BYTES="+total);
if(entries.some(e=>e.baseline))console.log("R2_BASELINE_ASSET_DEFERRED_TO_CANARY_RUNTIME");
if(process.argv[2]==="--audit"){
 console.log("R2_AUDIT_ONLY_NO_REMOTE_WRITES");
 process.exit(0);
}
if(process.argv[2]!=="--upload-verified")throw Error("USAGE: --audit OR --upload-verified");
if(entries.some(e=>e.baseline))throw Error("R2_BASELINE_ASSET_MUST_NOT_BE_OVERWRITTEN_BY_BULK_UPLOAD");
if(process.env.LINGXI_R2_UPLOAD_APPROVED!=="YES-STAGE-ONLY"||
 !process.env.CLOUDFLARE_API_TOKEN||!process.env.CLOUDFLARE_ACCOUNT_ID)
 throw Error("R2_REMOTE_UPLOAD_EXPLICIT_APPROVAL_OR_CREDENTIALS_MISSING");
function wrangler(args){
 const r=spawnSync("pnpm",["exec","wrangler","r2","object",...args],{
   cwd:root,env:process.env,stdio:"pipe",encoding:"utf8",
   timeout:10*60*1000,maxBuffer:2*1024*1024
 });
 if(r.status!==0||r.error){
  // Do not dump CLI output; it can contain remote account metadata.
  throw Error("R2_WRANGLER_COMMAND_FAILED:"+args[0]+":"+r.status);
 }
}
const temp=await mkdtemp(join(tmpdir(),"lingxi-r2-verify-"));
try{
 for(let i=0;i<entries.length;i++){
  const e=entries[i];
  wrangler(["put",e.object,"--remote","--file",join(root,"public",e.path.slice(1)),"--content-type",e.contentType,"--force"]);
  const returned=join(temp,String(i)+".bin");
  wrangler(["get",e.object,"--remote","--file",returned]);
  const size=(await stat(returned)).size;
  if(size!==e.bytes||await digest(returned)!==e.sha256)
   throw Error("R2_UPLOADED_OBJECT_READBACK_FAILED:"+i);
  console.log("R2_REMOTE_UPLOADED_AND_HASH_VERIFIED:"+i+":of:"+entries.length);
 }
 console.log("R2_PUBLIC_OBJECTS_STAGED_AND_VERIFIED_NOT_SITE_DEPLOYED");
}finally{
 await rm(temp,{recursive:true,force:true});
}
