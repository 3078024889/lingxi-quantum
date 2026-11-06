import test from "node:test";
import assert from "node:assert/strict";
import {convertStagedToProof} from "../../scripts/cloudflare/convert-r2-proof-manifest.mjs";
import {TRACKED_LARGE_ASSETS,STATIC_ASSET_LIMIT} from "../../scripts/cloudflare/audit-large-assets.mjs";
const source=()=>({
 staged:true,sourceCount:7,releaseReady:false,remoteUploaded:false,
 assetDeliveryVerified:false,items:TRACKED_LARGE_ASSETS.map((path,i)=>({
  path,bytes:STATIC_ASSET_LIMIT+1+i,sha256:(i.toString(16)).repeat(64)
 }))
});
test("converts seven verified source copies to strict full-hash proof manifest",()=>{
 const m=convertStagedToProof(source());
 assert.equal(m.schemaVersion,1);
 assert.equal(m.largeAssets.length,7);
 assert.equal(m.largeAssets[0].path,TRACKED_LARGE_ASSETS[0]);
 assert.equal("remoteUploaded" in m,false);
});
test("rejects missing, unexpected, duplicate or falsely published resources",()=>{
 const cases=[];
 const missing=source();missing.items.pop();cases.push(missing);
 const fake=source();fake.items[0].path="private/credentials";cases.push(fake);
 const dup=source();dup.items[1].path=dup.items[0].path;cases.push(dup);
 const published=source();published.remoteUploaded=true;cases.push(published);
 const changed=source();changed.items[0].bytes=12;cases.push(changed);
 const hash=source();hash.items[0].sha256="hash";cases.push(hash);
 for(const invalid of cases)assert.throws(()=>convertStagedToProof(invalid));
});
