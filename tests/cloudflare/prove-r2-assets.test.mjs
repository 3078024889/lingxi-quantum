import test from "node:test";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {validateCdnOrigin,proveAsset,proveManifest,assertManifest} from "../../scripts/cloudflare/prove-r2-assets.mjs";
import {TRACKED_LARGE_ASSETS,STATIC_ASSET_LIMIT} from "../../scripts/cloudflare/audit-large-assets.mjs";
test("public CDN must be an HTTPS .com subdomain, not a credentialed proxy",()=>{
  assert.equal(validateCdnOrigin("https://assets.lingxifield.com"),"https://assets.lingxifield.com");
  for(const bad of ["http://assets.lingxifield.com","https://lingxifield.com",
    "https://www.lingxifield.com","https://assets.lingxifield.cn",
    "https://assets.lingxifield.com.evil.test","https://assets.lingxifield.com/path",
    "https://u:p@assets.lingxifield.com"]){
    assert.throws(()=>validateCdnOrigin(bad));
  }
});
test("manifest must cover all seven exact oversized assets",()=>{
  const assets=TRACKED_LARGE_ASSETS.map(path=>({path,bytes:STATIC_ASSET_LIMIT+10,sha256:"a".repeat(64)}));
  assert.equal(assertManifest({schemaVersion:1,largeAssets:assets}).length,7);
  assert.throws(()=>assertManifest({schemaVersion:1,largeAssets:assets.slice(1)}));
  assert.throws(()=>assertManifest({schemaVersion:1,largeAssets:[...assets.slice(1),assets[1]]}));
  assert.throws(()=>assertManifest({schemaVersion:1,largeAssets:[...assets.slice(1),{path:"private/key",bytes:STATIC_ASSET_LIMIT+10,sha256:"a".repeat(64)}]}));
});
test("range, CORS and full SHA checks are required; HEAD alone is insufficient",async()=>{
  const data=Buffer.alloc(96,77),sha256=createHash("sha256").update(data).digest("hex");
  const item={path:"models/test.onnx",bytes:data.length,sha256};
  const basic={"access-control-allow-origin":"https://lingxifield.com","content-type":"application/octet-stream"};
  const good=async(_url,init)=>{
    assert.equal(init.headers.Origin,"https://lingxifield.com");
    assert.equal(init.headers["Accept-Encoding"],"identity");
    if(init.method==="HEAD")return new Response(null,{status:200,headers:{...basic,"content-length":String(data.length)}});
    if(init.headers.Range)return new Response(data.subarray(0,32),{status:206,
      headers:{...basic,"content-range":"bytes 0-31/96"}});
    return new Response(data,{status:200,headers:basic});
  };
  const checked=await proveAsset("https://assets.lingxifield.com",item,{fetcher:good,full:true});
  assert.equal(checked.ok,true);
  assert.equal(checked.fullHash,true);
  const wrong=await proveAsset("https://assets.lingxifield.com",item,{fetcher:async(url,init)=>{
    if(init.method==="HEAD")return new Response(null,{status:200,
      headers:{"content-type":"application/octet-stream","content-length":"96"}});
    return good(url,init);
  },full:true});
  assert.equal(wrong.ok,false);
  assert.equal(wrong.cors,false);
  const missingRange=await proveAsset("https://assets.lingxifield.com",item,{fetcher:async(url,init)=>{
    if(init.headers.Range)return new Response(data,{status:200,headers:basic});
    return good(url,init);
  }});
  assert.equal(missingRange.range,false);
});
