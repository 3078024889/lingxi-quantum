#!/usr/bin/env node
// Only removes compiled copies of large PUBLIC assets from a throwaway
// .open-next/assets directory. Originals under public/ are never modified.
// Confirms exact size and SHA256 before making each object eligible for R2.
import {createReadStream} from "node:fs";
import {mkdir,readdir,stat,unlink,writeFile,access} from "node:fs/promises";
import {createHash} from "node:crypto";
import {join,relative,resolve,sep} from "node:path";
import {largePublicAssets} from "./large-public-assets.mjs";
const root=resolve(".");
const assetRoot=join(root,".open-next","assets");
const limit=25*1024*1024;
async function sha256(file){
 const hash=createHash("sha256");
 for await(const chunk of createReadStream(file))hash.update(chunk);
 return hash.digest("hex");
}
async function walk(dir){
 const entries=await readdir(dir,{withFileTypes:true});
 const out=[];
 for(const e of entries){
  if(e.isSymbolicLink())throw Error("SYMLINK_IN_COMPILED_ASSETS:"+e.name);
  const path=join(dir,e.name);
  if(e.isDirectory())out.push(...await walk(path));
  else if(e.isFile())out.push(path);
 }
 return out;
}
const manifest=[];
for(const [path,metadata] of Object.entries(largePublicAssets)){
 const relativeName=path.slice(1);
 const input=join(root,"public",relativeName);
 const compiled=join(assetRoot,relativeName);
 const [orig,generated]=await Promise.all([stat(input),stat(compiled)]);
 if(!orig.isFile()||!generated.isFile()||orig.size!==metadata.bytes||generated.size!==metadata.bytes||generated.size<=limit)
  throw Error("OVERSIZE_FILE_SHAPE_MISMATCH:"+relativeName);
 const [sourceSha,copySha]=await Promise.all([sha256(input),sha256(compiled)]);
 if(sourceSha!==copySha)throw Error("OVERSIZE_FILE_HASH_CHANGED:"+relativeName);
 await unlink(compiled);
 manifest.push({path,bytes:metadata.bytes,sha256:sourceSha,r2Key:"public"+path,contentType:metadata.contentType});
}
const remaining=await walk(assetRoot);
const stillOversize=[];
for(const file of remaining){
 const size=(await stat(file)).size;
 if(size>limit)stillOversize.push({path:relative(assetRoot,file).split(sep).join("/"),size});
}
if(stillOversize.length)throw Error("UNEXPECTED_OVERSIZE_ASSETS:"+JSON.stringify(stillOversize));
const wrapper=String.raw`import app from "./worker.js";
import {handleLargePublicAsset} from "../scripts/cloudflare/large-public-assets.mjs";
if(!app||typeof app.fetch!=="function")throw Error("OPENNEXT_EXPORT_SHAPE_UNSUPPORTED");
export default {
 ...app,
 async fetch(request,env,ctx){
  const offloaded=await handleLargePublicAsset(request,env);
  return offloaded||app.fetch(request,env,ctx);
 }
};
`;
await writeFile(join(root,".open-next","offload-worker.mjs"),wrapper);
const summary={schemaVersion:1,sourceSha:process.env.GITHUB_SHA||null,
 bucketBinding:"LINGXI_PUBLIC_LARGE_R2",bucketName:"lingxifield-com-large-public",
 releaseReady:false,remainingOversizeCount:0,assets:manifest};
await writeFile(join(root,"cloudflare-offload-report.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify({OFFLOADED_LARGE_FILES:manifest.length,assetBytes:manifest.reduce((s,x)=>s+x.bytes,0),remainingOversizeCount:0,WORKER_R2_NOT_VALIDATED:true}));
