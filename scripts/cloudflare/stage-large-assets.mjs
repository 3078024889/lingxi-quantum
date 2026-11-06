#!/usr/bin/env node
/**
 * Prepare the *ephemeral* Cloudflare static bundle without seven oversized files.
 * This NEVER uploads to R2 and NEVER declares asset-delivery readiness.
 * CLI mutating mode is restricted to GitHub Actions temporary workspaces.
 */
import {createReadStream, existsSync, lstatSync, mkdirSync, copyFileSync,
  unlinkSync, readFileSync, writeFileSync, renameSync, rmSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,join,dirname,relative,sep} from "node:path";
import {pathToFileURL} from "node:url";
import {TRACKED_LARGE_ASSETS,STATIC_ASSET_LIMIT,auditLargeAssets} from "./audit-large-assets.mjs";

function inside(root,file){return file.startsWith(root+sep);}
export function validateStaticCdnOrigin(origin){
  let url;try{url=new URL(origin)}catch{throw Error("INVALID_PUBLIC_CDN");}
  if(url.protocol!=="https:"||url.port||url.username||url.password||url.pathname!=="/"||
    url.search||url.hash||!/^([a-z0-9-]+\.)+lingxifield\.com$/.test(url.hostname)||
    url.hostname==="www.lingxifield.com")throw Error("INVALID_PUBLIC_CDN");
  return url.origin;
}
async function digest(path){
  const h=createHash("sha256");
  for await(const chunk of createReadStream(path))h.update(chunk);
  return h.digest("hex");
}
export async function stageOversized({
  publicRoot,stagingRoot,cdnOrigin,
  paths=TRACKED_LARGE_ASSETS,limit=STATIC_ASSET_LIMIT,
}){
  const pub=resolve(publicRoot),stage=resolve(stagingRoot),origin=validateStaticCdnOrigin(cdnOrigin);
  if(stage===pub||inside(pub,stage)||inside(stage,pub))throw Error("STAGING_PATH_OVERLAP");
  if(!existsSync(pub)||!lstatSync(pub).isDirectory())throw Error("PUBLIC_ROOT_INVALID");
  if(existsSync(join(pub,"_redirects")))throw Error("EXISTING_REDIRECTS_REQUIRE_MERGE");
  const unique=new Set(paths);if(unique.size!==paths.length||!paths.length)throw Error("DUPLICATE_OR_MISSING_PATHS");
  const source=[];
  for(const p of unique){
    if(typeof p!=="string"||p.startsWith("/")||p.includes("\\")||p.split("/").some(s=>!s||s==="."||s===".."))throw Error("ASSET_PATH_INVALID");
    const file=resolve(pub,p);
    if(!inside(pub,file)||!existsSync(file))throw Error("ASSET_SOURCE_MISSING");
    const stat=lstatSync(file);
    if(!stat.isFile()||stat.isSymbolicLink()||stat.size<=limit)throw Error("ASSET_NOT_OVERSIZED_REGULAR_FILE");
    source.push({path:p,file,size:stat.size,sha256:await digest(file)});
  }
  if(existsSync(stage)&&lstatSync(stage).isSymbolicLink())throw Error("STAGING_SYMLINK_NOT_ALLOWED");
  mkdirSync(stage,{recursive:true});
  const completed=[];
  let redirected=false;
  try{
    for(const item of source){
      const dest=resolve(stage,item.path);
      if(!inside(stage,dest)||existsSync(dest))throw Error("STAGING_COLLISION");
      mkdirSync(dirname(dest),{recursive:true});
      copyFileSync(item.file,dest);
      if((await digest(dest))!==item.sha256)throw Error("STAGED_HASH_MISMATCH");
      completed.push({src:item.file,dest});
    }
    const redirects=source.map(item=>{
      const url=origin+"/"+item.path.split("/").map(encodeURIComponent).join("/");
      return "/"+item.path+" "+url+" 307";
    }).join("\n")+"\n";
    const temp=join(pub,"_redirects.cf-tmp");
    if(existsSync(temp))throw Error("REDIRECT_TEMP_COLLISION");
    writeFileSync(temp,redirects,{flag:"wx"});
    try{renameSync(temp,join(pub,"_redirects"));redirected=true;}finally{
      if(existsSync(temp))unlinkSync(temp);
    }
    for(const item of source)unlinkSync(item.file);
    return {staged:true,remoteUploaded:false,assetDeliveryVerified:false,
      releaseReady:false,redirectFile:join(pub,"_redirects"),
      sourceCount:source.length,
      items:source.map(({path,size,sha256})=>({path,bytes:size,sha256}))};
  }catch(error){
    for(const item of completed){
      if(!existsSync(item.src)&&existsSync(item.dest))copyFileSync(item.dest,item.src);
    }
    if(redirected&&existsSync(join(pub,"_redirects")))unlinkSync(join(pub,"_redirects"));
    throw error;
  }
}
async function main(args=process.argv.slice(2)){
  if(args.includes("--help")){
    console.log("In GitHub Actions only: --ci-stage --public public --stage $RUNNER_TEMP/com-assets --cdn https://assets.lingxifield.com --json REPORT");
    return 0;
  }
  if(!args.includes("--ci-stage")||process.env.GITHUB_ACTIONS!=="true"||process.env.CI!=="true"||
    !process.env.RUNNER_TEMP)throw Error("CI_MUTATION_GUARD");
  const arg=(name)=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
  const rawStage=arg("--stage");
  if(!rawStage)throw Error("STAGE_REQUIRED");
  const runner=resolve(process.env.RUNNER_TEMP),target=resolve(rawStage);
  if(!inside(runner,target))throw Error("STAGE_MUST_BE_IN_RUNNER_TEMP");
  const report=await stageOversized({
    publicRoot:resolve(arg("--public")||"public"),
    stagingRoot:target,
    cdnOrigin:arg("--cdn")||"",
  });
  const remaining=await auditLargeAssets(resolve(arg("--public")||"public"),{expectedPaths:[]});
  if(remaining.largeAssets.length!==0)throw Error("UNHANDLED_OVERSIZED_STATIC_ASSETS");
  const json=arg("--json");
  if(json)writeFileSync(resolve(json),JSON.stringify(report,null,2)+"\n",{mode:0o600});
  console.log(JSON.stringify({staged:report.sourceCount,remainingOverLimit:0,
    deliveryReady:false,deployReady:false},null,2));
  return 0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().then(code=>{process.exitCode=code}).catch(e=>{console.error("CI_STAGE_FAILED",e.message);process.exitCode=1});
}
