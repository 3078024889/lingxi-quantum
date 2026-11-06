#!/usr/bin/env node
/**
 * Cloudflare build-output size gate. Works ONLY inside temporary CI checkout.
 * Browser-bundled WASM can reappear in _next/static/media after the public/
 * inventory was clean. Preserve byte-exact artifacts and redirect to public R2.
 * This DOES NOT publish anything to R2 or claim production readiness.
 */
import {existsSync,readdirSync,lstatSync,mkdirSync,copyFileSync,writeFileSync,
 readFileSync,unlinkSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,join,dirname,relative,sep} from "node:path";
import {pathToFileURL} from "node:url";
import {STATIC_ASSET_LIMIT} from "./audit-large-assets.mjs";
import {validateStaticCdnOrigin} from "./stage-large-assets.mjs";

function inside(root,file){return file.startsWith(root+sep);}
function walk(path,list=[]){
 if(!existsSync(path))return list;
 for(const entry of readdirSync(path,{withFileTypes:true})){
  const file=join(path,entry.name),stat=lstatSync(file);
  if(stat.isSymbolicLink())throw Error("BUILT_ASSET_SYMLINK");
  if(stat.isDirectory())walk(file,list);
  else if(stat.isFile())list.push({file,bytes:stat.size});
 }
 return list;
}
function sha(file){return createHash("sha256").update(readFileSync(file)).digest("hex");}
function safeKey(path){return path.split("/").map(encodeURIComponent).join("/");}
export function stageBuiltAssets({assetsRoot,publicRedirects,backupRoot,
 sourceManifest,cdnOrigin,limit=STATIC_ASSET_LIMIT}){
 const assets=resolve(assetsRoot),redirectFile=resolve(publicRedirects),
  backups=resolve(backupRoot),origin=validateStaticCdnOrigin(cdnOrigin);
 if(!existsSync(assets)||!lstatSync(assets).isDirectory())throw Error("BUILT_ASSETS_MISSING");
 if(backups===assets||inside(assets,backups)||inside(backups,assets))throw Error("OUTPUT_BACKUP_OVERLAP");
 if(existsSync(backups))throw Error("OUTPUT_BACKUP_ALREADY_EXISTS");
 if(!sourceManifest||sourceManifest.sourceCount!==7||!Array.isArray(sourceManifest.items)
   ||sourceManifest.items.length!==7)throw Error("SEVEN_SOURCE_ASSETS_NOT_VERIFIED");
 const canonical=new Map(sourceManifest.items.map(x=>[x.sha256,x]));
 const large=walk(assets).filter(x=>x.bytes>limit);
 if(large.length>20)throw Error("UNEXPECTEDLY_MANY_BUILT_ASSETS");
 let originalRedirects="";
 if(existsSync(redirectFile))originalRedirects=readFileSync(redirectFile,"utf8");
 else throw Error("BASE_REDIRECTS_MISSING");
 for(const item of sourceManifest.items){
  if(!originalRedirects.includes("/"+item.path+" "))throw Error("ORIGINAL_REDIRECT_MISSING");
 }
 const staged=[],newRules=[];
 for(const item of large){
  const path=relative(assets,item.file).split(sep).join("/");
  if(!path||path.startsWith("../"))throw Error("BUILT_PATH_INVALID");
  const hash=sha(item.file),known=canonical.get(hash);
  const dest=known?known.path:"generated-build/"+hash+"/"+path;
  if(!dest||!dest.split("/").every(Boolean))throw Error("DESTINATION_INVALID");
  const rule="/"+path+" "+origin+"/"+safeKey(dest)+" 307";
  if(originalRedirects.includes("/"+path+" "))throw Error("BUILD_REDIRECT_COLLISION");
  newRules.push(rule);
  staged.push({path,destination:dest,bytes:item.bytes,sha256:hash,
    matchesTrackedSource:Boolean(known),file:item.file});
 }
 if(originalRedirects.split("\n").length+newRules.length>2000)throw Error("TOO_MANY_REDIRECTS");
 // Preserve source bytes before deleting the CI output. Unknown transformed assets
 // get their own R2 upload key instead of pretending to match an existing asset.
 mkdirSync(backups,{recursive:true});
 for(const item of staged){
  const target=resolve(backups,item.destination);
  if(!inside(backups,target))throw Error("BACKUP_PATH_INVALID");
  if(existsSync(target))throw Error("BACKUP_KEY_COLLISION");
  mkdirSync(dirname(target),{recursive:true});
  copyFileSync(item.file,target);
  if(sha(target)!==item.sha256)throw Error("OUTPUT_BACKUP_HASH_MISMATCH");
 }
 writeFileSync(redirectFile,originalRedirects.replace(/\n?$/,"\n")+newRules.join("\n")+
   (newRules.length?"\n":""));
 for(const item of staged)unlinkSync(item.file);
 const residual=walk(assets).filter(x=>x.bytes>limit);
 if(residual.length)throw Error("OVERSIZED_OUTPUT_REMAINS");
 return {schemaVersion:1,mode:"temporary-build-only",buildReady:true,
    publishedToR2:false,remoteVerified:false,productionReady:false,
    generatedOversizedCount:staged.length,
    additionalR2Objects:staged.filter(x=>!x.matchesTrackedSource).length,
    artifacts:staged.map(({file,...rest})=>rest),
    warning:"Cloudflare build passes size gate only. All redirected R2 objects must be uploaded and live-verified."};
}
async function main(args=process.argv.slice(2)){
 if(!args.includes("--ci-stage")||process.env.GITHUB_ACTIONS!=="true"||
    process.env.CI!=="true"||!process.env.RUNNER_TEMP)throw Error("CI_OUTPUT_ONLY");
 const arg=k=>{const i=args.indexOf(k);return i<0?null:args[i+1];};
 const source=arg("--source-manifest"),dir=arg("--assets"),redirects=arg("--redirects"),
  stage=arg("--stage"),report=arg("--json");
 if(!source||!dir||!redirects||!stage||!report)throw Error("MISSING_REQUIRED_PATH");
 const runner=resolve(process.env.RUNNER_TEMP);
 if(!inside(runner,resolve(stage)))throw Error("OUTPUT_STAGE_OUTSIDE_RUNNER_TEMP");
 const manifest=JSON.parse(readFileSync(resolve(source),"utf8"));
 const result=stageBuiltAssets({assetsRoot:dir,publicRedirects:redirects,
  backupRoot:stage,sourceManifest:manifest,cdnOrigin:arg("--cdn")||""});
 writeFileSync(resolve(report),JSON.stringify(result,null,2)+"\n",{mode:0o600});
 console.log(JSON.stringify({generatedOversizedCount:result.generatedOversizedCount,
  additionalR2Objects:result.additionalR2Objects,oversizedBytesLeft:0,
  productionReady:false}));
 return 0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 main().then(x=>process.exitCode=x).catch(e=>{console.error("BUILT_ASSET_GATE_FAILED",e.message);process.exitCode=1;});
}
