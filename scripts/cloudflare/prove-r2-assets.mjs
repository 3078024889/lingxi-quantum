#!/usr/bin/env node
/**
 * Read-only R2/CDN delivery proof for seven oversized public media assets.
 * No Cloudflare login, upload, DNS, storage write or private API access.
 * Production proof requires --full to hash actual streamed bytes, not just HEAD.
 */
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {TRACKED_LARGE_ASSETS,STATIC_ASSET_LIMIT} from "./audit-large-assets.mjs";

export function validateCdnOrigin(input){
  let u;try{u=new URL(input);}catch{throw Error("INVALID_CDN_ORIGIN");}
  if(u.protocol!=="https:"||u.username||u.password||u.port||u.pathname!=="/"||
    u.search||u.hash||!/^([a-z0-9-]+\.)+lingxifield\.com$/.test(u.hostname)||
    u.hostname==="www.lingxifield.com")throw Error("INVALID_CDN_ORIGIN");
  return u.origin;
}

export function assertManifest(report){
  if(!report||report.schemaVersion!==1||!Array.isArray(report.largeAssets))throw Error("MANIFEST_INVALID");
  const names=new Set(TRACKED_LARGE_ASSETS),observed=new Set();
  for(const item of report.largeAssets){
    if(!names.has(item.path)||observed.has(item.path)||!Number.isSafeInteger(item.bytes)||
       item.bytes<=STATIC_ASSET_LIMIT||!/^[a-f0-9]{64}$/.test(item.sha256))throw Error("MANIFEST_ENTRY_INVALID");
    observed.add(item.path);
  }
  if(observed.size!==names.size)throw Error("MANIFEST_INCOMPLETE");
  return report.largeAssets;
}

function expectedType(path){
  return path.endsWith(".mp4")?"video/mp4":path.endsWith(".wasm")?"application/wasm":"application/octet-stream";
}
function corsAllowed(response){
  const allowed=response.headers.get("access-control-allow-origin");
  return allowed==="*"||allowed==="https://lingxifield.com";
}
export async function proveAsset(base,item,{fetcher=fetch,full=false}={}){
  const url=base+"/"+item.path.split("/").map(encodeURIComponent).join("/");
  const opts={redirect:"manual",headers:{"Origin":"https://lingxifield.com","Accept-Encoding":"identity"},signal:AbortSignal.timeout(25000)};
  const result={path:item.path,bytes:item.bytes,head:false,range:false,cors:false,fullHash:false,ok:false};
  try{
    const h=await fetcher(url,{...opts,method:"HEAD"});
    result.head=h.status===200&&Number(h.headers.get("content-length"))===item.bytes&&
      (h.headers.get("content-type")||"").toLowerCase().startsWith(expectedType(item.path));
    result.cors=corsAllowed(h);
    await h.body?.cancel();
    if(!result.head||!result.cors)return result;
    const g=await fetcher(url,{...opts,method:"GET",
      headers:{...opts.headers,Range:"bytes=0-31"}});
    const cr=g.headers.get("content-range")||"";
    const data=g.status===206?new Uint8Array(await g.arrayBuffer()):new Uint8Array();
    result.range=g.status===206&&data.length===32&&
      cr===`bytes 0-31/${item.bytes}`&&corsAllowed(g);
    if(!result.range)return result;
    if(full){
      const f=await fetcher(url,{...opts,method:"GET",signal:AbortSignal.timeout(150000)});
      if(f.status!==200||!corsAllowed(f)||!f.body)return result;
      const hasher=createHash("sha256");let count=0;
      for await(const chunk of f.body){
        count+=chunk.byteLength;
        if(count>item.bytes)return result;
        hasher.update(chunk);
      }
      result.fullHash=count===item.bytes&&hasher.digest("hex")===item.sha256;
    }
    result.ok=result.head&&result.range&&result.cors&&(!full||result.fullHash);
    return result;
  }catch{return result;}
}

export async function proveManifest(base,manifest,options={}){
  const origin=validateCdnOrigin(base);
  const assets=assertManifest(manifest);
  const results=[];
  for(const asset of assets)results.push(await proveAsset(origin,asset,options));
  return{schemaVersion:1,origin,mode:options.full?"full":"header-and-range",
    results,assetDeliveryVerified:options.full===true&&results.every(x=>x.ok),
    siteReleaseReady:false,
    warning:"Asset proof cannot certify the main website, authentication, payment, tasks or DNS cutover."};
}

export async function main(args=process.argv.slice(2)){
  const baseIndex=args.indexOf("--cdn"),manIndex=args.indexOf("--manifest");
  if(baseIndex<0||manIndex<0||!args[baseIndex+1]||!args[manIndex+1])throw Error("CDN_AND_MANIFEST_REQUIRED");
  const report=JSON.parse(readFileSync(resolve(args[manIndex+1]),"utf8"));
  const proof=await proveManifest(args[baseIndex+1],report,{full:args.includes("--full")});
  const jsonIx=args.indexOf("--json");
  if(jsonIx>=0){if(!args[jsonIx+1])throw Error("JSON_PATH_REQUIRED");
    writeFileSync(resolve(args[jsonIx+1]),JSON.stringify(proof,null,2)+"\n",{mode:0o600});}
  console.log(JSON.stringify(proof,null,2));
  return proof.assetDeliveryVerified?0:1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  main().then(code=>{process.exitCode=code;}).catch(e=>{console.error("R2_ASSET_PROOF_FAILED",e.message);process.exitCode=1;});
}
