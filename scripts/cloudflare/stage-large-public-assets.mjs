#!/usr/bin/env node
// Removes only compiled copies of large PUBLIC assets from a throwaway
// .open-next/assets directory. Tracked public originals are never modified.
// One explicitly declared R2-baseline asset may be read back from the same
// dedicated public bucket when its 42 MB source is intentionally not in Git.
import {createReadStream} from "node:fs";
import {mkdir,readdir,stat,unlink,writeFile,copyFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {spawnSync} from "node:child_process";
import {dirname,join,relative,resolve,sep} from "node:path";
import {largePublicAssets} from "./large-public-assets.mjs";
const root=resolve(".");
const assetRoot=join(root,".open-next","assets");
const limit=25*1024*1024;
const publicBucket="lingxifield-com-large-public";
async function sha256(file){
 const hash=createHash("sha256");
 for await(const chunk of createReadStream(file))hash.update(chunk);
 return hash.digest("hex");
}
async function optionalStat(file){
 try{return await stat(file)}catch(error){if(error?.code==="ENOENT")return null;throw error}
}
function fetchR2Baseline(object,destination){
 if(!process.env.CLOUDFLARE_API_TOKEN||!process.env.CLOUDFLARE_ACCOUNT_ID)
  throw Error("R2_BASELINE_ASSET_CREDENTIALS_MISSING");
 const result=spawnSync("pnpm",["exec","wrangler","r2","object","get",object,"--remote","--file",destination],{
  cwd:root,env:process.env,stdio:"ignore",timeout:10*60*1000
 });
 if(result.error||result.status!==0)throw Error("R2_BASELINE_ASSET_NOT_AVAILABLE:"+object);
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
 const [orig,generated]=await Promise.all([optionalStat(input),optionalStat(compiled)]);
 if(!orig){
  if(metadata.source!=="r2-baseline")throw Error("OVERSIZE_FILE_SOURCE_MISSING:"+relativeName);
  const source=join(root,".open-next","r2-upload-sources",relativeName);
  await mkdir(dirname(source),{recursive:true});
  try{await unlink(source)}catch(error){if(error?.code!=="ENOENT")throw error}
  const object=publicBucket+"/public"+path;
  fetchR2Baseline(object,source);
  const staged=await stat(source);
  if(!staged.isFile()||staged.size!==metadata.bytes||staged.size<=limit)
   throw Error("R2_BASELINE_ASSET_SIZE_MISMATCH:"+relativeName);
  const sourceSha=await sha256(source);
  if(metadata.sha256&&sourceSha!==metadata.sha256)
   throw Error("R2_BASELINE_ASSET_HASH_MISMATCH:"+relativeName);
  if(generated){
   if(!generated.isFile()||generated.size!==metadata.bytes||generated.size<=limit)
    throw Error("R2_BASELINE_COMPILED_COPY_SIZE_MISMATCH:"+relativeName);
   if(await sha256(compiled)!==sourceSha)
    throw Error("R2_BASELINE_COMPILED_COPY_HASH_MISMATCH:"+relativeName);
   await unlink(compiled);
  }
  manifest.push({path,bytes:metadata.bytes,sha256:sourceSha,r2Key:"public"+path,contentType:metadata.contentType,source:"r2-baseline"});
  console.log("R2_BASELINE_ASSET_REUSED:"+relativeName+":"+sourceSha);
  continue;
 }
 if(!orig.isFile()||!generated||!generated.isFile()||orig.size!==metadata.bytes||generated.size!==metadata.bytes||generated.size<=limit)
  throw Error("OVERSIZE_FILE_SHAPE_MISMATCH:"+relativeName);
 const [sourceSha,copySha]=await Promise.all([sha256(input),sha256(compiled)]);
 if(sourceSha!==copySha)throw Error("OVERSIZE_FILE_HASH_CHANGED:"+relativeName);
 if(metadata.sha256&&sourceSha!==metadata.sha256)throw Error("OVERSIZE_FILE_PINNED_HASH_MISMATCH:"+relativeName);
 await unlink(compiled);
 manifest.push({path,bytes:metadata.bytes,sha256:sourceSha,r2Key:"public"+path,contentType:metadata.contentType});
}
// Webpack emits one content-hashed ONNX wasm file that is not in public/.
// Keep its exact filename pattern, expected size and private local upload copy.
const generatedDir=join(assetRoot,"_next","static","media");
const generatedNames=(await readdir(generatedDir)).filter(x=>
 /^ort-wasm-simd-threaded\.asyncify\.[a-f0-9]{8,64}\.wasm$/.test(x));
if(generatedNames.length!==1)throw Error("HASHED_ONNX_WASM_COUNT_MISMATCH:"+generatedNames.length);
const generatedAssets={};
for(const filename of generatedNames){
 const path="/_next/static/media/"+filename;
 const file=join(generatedDir,filename);
 const metadata={bytes:26861777,contentType:"application/wasm"};
 const size=(await stat(file)).size;
 if(size!==metadata.bytes||size<=limit)throw Error("HASHED_ONNX_WASM_SIZE_MISMATCH");
 const digest=await sha256(file);
 const source=join(root,".open-next","r2-upload-sources","_next","static","media",filename);
 await mkdir(dirname(source),{recursive:true});
 await copyFile(file,source);
 if(await sha256(source)!==digest)throw Error("GENERATED_WASM_STAGE_COPY_HASH_MISMATCH");
 await unlink(file);
 generatedAssets[path]=metadata;
 manifest.push({path,bytes:size,sha256:digest,r2Key:"public"+path,contentType:metadata.contentType});
}
const remaining=await walk(assetRoot);
const stillOversize=[];
for(const file of remaining){
 const size=(await stat(file)).size;
 if(size>limit)stillOversize.push({path:relative(assetRoot,file).split(sep).join("/"),size});
}
if(stillOversize.length)throw Error("UNEXPECTED_OVERSIZE_ASSETS:"+JSON.stringify(stillOversize));
const wrapper=[
 'import app from "./worker.js";',
 'import {handleLargePublicAsset} from "../scripts/cloudflare/large-public-assets.mjs";',
 'const generatedAssets = '+JSON.stringify(generatedAssets)+';',
 'if(!app||typeof app.fetch!=="function")throw Error("OPENNEXT_EXPORT_SHAPE_UNSUPPORTED");',
 'export default {',
 ' ...app,',
 ' async fetch(request,env,ctx){',
 '  const offloaded=await handleLargePublicAsset(request,env,generatedAssets);',
 '  return offloaded||app.fetch(request,env,ctx);',
 ' }',
 '};',
 ''
].join("\n");
await writeFile(join(root,".open-next","offload-worker.mjs"),wrapper);
const summary={schemaVersion:1,sourceSha:process.env.GITHUB_SHA||null,
 bucketBinding:"LINGXI_PUBLIC_LARGE_R2",bucketName:publicBucket,
 releaseReady:false,remainingOversizeCount:0,assets:manifest};
await writeFile(join(root,"cloudflare-offload-report.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify({OFFLOADED_LARGE_FILES:manifest.length,assetBytes:manifest.reduce((s,x)=>s+x.bytes,0),remainingOversizeCount:0,WORKER_R2_NOT_VALIDATED:true}));
