#!/usr/bin/env node
/* Convert CI staging manifest into the strict, auditable read-only R2 proof schema. */
import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {TRACKED_LARGE_ASSETS,STATIC_ASSET_LIMIT} from "./audit-large-assets.mjs";
import {assertManifest} from "./prove-r2-assets.mjs";

export function convertStagedToProof(staged){
 if(!staged||staged.sourceCount!==7||!Array.isArray(staged.items)||
    staged.items.length!==7||staged.staged!==true||staged.releaseReady!==false||
    staged.remoteUploaded!==false||staged.assetDeliveryVerified!==false)
    throw Error("STAGING_NOT_STRICT_OR_READY");
 const known=new Set(TRACKED_LARGE_ASSETS);
 const seen=new Set();
 const largeAssets=staged.items.map(item=>{
  if(!item||!known.has(item.path)||seen.has(item.path)||
     !Number.isSafeInteger(item.bytes)||item.bytes<=STATIC_ASSET_LIMIT||
     !/^[a-f0-9]{64}$/.test(item.sha256))
    throw Error("STAGED_ITEM_INVALID");
  seen.add(item.path);
  return {path:item.path,bytes:item.bytes,sha256:item.sha256};
 });
 const proof={schemaVersion:1,largeAssets};
 assertManifest(proof);
 return proof;
}
export function main(args=process.argv.slice(2)){
 const ix=args.indexOf("--input"),oy=args.indexOf("--output");
 if(ix<0||oy<0||!args[ix+1]||!args[oy+1]||args[ix+1].startsWith("--")||
    args[oy+1].startsWith("--"))throw Error("INPUT_OUTPUT_REQUIRED");
 const input=JSON.parse(readFileSync(resolve(args[ix+1]),"utf8"));
 const proof=convertStagedToProof(input);
 writeFileSync(resolve(args[oy+1]),JSON.stringify(proof,null,2)+"\n",{mode:0o600});
 console.log(JSON.stringify({strictPublicAssets:proof.largeAssets.length,ready:false,verificationOnly:true}));
 return 0;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{process.exitCode=main()}catch(e){console.error("R2_PROOF_MANIFEST_INVALID",e.message);process.exitCode=1}
}
