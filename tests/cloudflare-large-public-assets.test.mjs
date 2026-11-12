import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {largePublicAssets,handleLargePublicAsset} from "../scripts/cloudflare/large-public-assets.mjs";
const names=Object.keys(largePublicAssets);
const req=(path,init={})=>new Request("https://lingxifield.com"+path,init);
const makeBody=()=>new ReadableStream({start(c){c.enqueue(new TextEncoder().encode("demo"));c.close()}});
const mockR2={
 calls:[],
 async get(key,opts){
  this.calls.push({key,opts});
  const meta=largePublicAssets[key.slice(6)];
  return meta?{size:meta.bytes,body:makeBody(),httpEtag:'"verified-etag"'}:null;
 },
 async head(key){
  this.calls.push({key,head:true});
  const meta=largePublicAssets[key.slice(6)];
  return meta?{size:meta.bytes,httpEtag:'"verified-etag"'}:null;
 }
};
test("all six directly-named oversized source files are mapped to exact public read-only paths",()=>{
 assert.equal(names.length,6);
 assert(names.every(path=>largePublicAssets[path].bytes>25*1024*1024));
 assert(names.every(path=>path.startsWith("/models/")||path.startsWith("/images/")||path.startsWith("/runtime/")||path.startsWith("/media/ffmpeg-0.12.10/")));
 const cfg=JSON.parse(readFileSync("wrangler.jsonc","utf8"));
 assert.equal(cfg.main,".open-next/offload-worker.mjs");
 assert.equal(cfg.r2_buckets[0].binding,"LINGXI_PUBLIC_LARGE_R2");
 assert.deepEqual(cfg.assets.run_worker_first.slice(0,6),names);
 assert.equal(cfg.assets.run_worker_first[6],"/_next/static/media/ort-wasm-simd-threaded.asyncify.*.wasm");
 assert.equal(cfg.workers_dev,false);
});
test("requests outside the exact manifest never access R2",async()=>{
 mockR2.calls=[];
 for(const path of ["/api/tools/jobs","/models/secret.onnx","/runtime/food-onnx/../internal","/","/models/Xenova/clip-vit-base-patch32/onnx/unlisted.onnx"]){
  assert.equal(await handleLargePublicAsset(req(path),{LINGXI_PUBLIC_LARGE_R2:mockR2}),null,path);
 }
 assert.equal(mockR2.calls.length,0);
});
test("no bucket binding means fail-closed 503, not an empty model or silent 200",async()=>{
 const r=await handleLargePublicAsset(req(names[0]),{});
 assert.equal(r.status,503);
 assert.match(await r.text(),/PUBLIC_LARGE_ASSETS_NOT_READY/);
});
test("whole-file GET streams R2 bytes with expected size and content type",async()=>{
 mockR2.calls=[];
 const r=await handleLargePublicAsset(req(names[1]),{LINGXI_PUBLIC_LARGE_R2:mockR2});
 assert.equal(r.status,200);
 assert.equal(r.headers.get("content-length"),String(largePublicAssets[names[1]].bytes));
 assert.equal(r.headers.get("content-type"),"application/octet-stream");
 assert.equal(r.headers.get("accept-ranges"),"bytes");
 assert.equal(r.headers.get("etag"),'"verified-etag"');
 assert.equal(mockR2.calls[0].key,"public"+names[1]);
});
test("video seeks and suffix ranges get 206 with RFC 7233 content-range",async()=>{
 mockR2.calls=[];
 const r=await handleLargePublicAsset(req(names[0],{headers:{range:"bytes=100-499"}}),{LINGXI_PUBLIC_LARGE_R2:mockR2});
 assert.equal(r.status,206);
 assert.equal(r.headers.get("content-length"),"400");
 assert.equal(r.headers.get("content-range"),"bytes 100-499/"+largePublicAssets[names[0]].bytes);
 assert.deepEqual(mockR2.calls[0].opts,{range:{offset:100,length:400}});
 const r2=await handleLargePublicAsset(req(names[0],{headers:{range:"bytes=-512"}}),{LINGXI_PUBLIC_LARGE_R2:mockR2});
 assert.equal(r2.status,206);
 assert.equal(r2.headers.get("content-length"),"512");
 const end=largePublicAssets[names[0]].bytes-1;
 assert.equal(r2.headers.get("content-range"),`bytes ${end-511}-${end}/${end+1}`);
});
test("invalid and multi-part range headers return 416 without R2 access",async()=>{
 mockR2.calls=[];
 for(const value of ["bytes=999999999999-","bytes=10-4","bytes=0-1,5-6","items=0-5","bytes=-0"]){
  const r=await handleLargePublicAsset(req(names[0],{headers:{range:value}}),{LINGXI_PUBLIC_LARGE_R2:mockR2});
  assert.equal(r.status,416,value);
 }
 assert.equal(mockR2.calls.length,0);
});
test("HEAD avoids downloading the object; write methods are rejected",async()=>{
 mockR2.calls=[];
 const h=await handleLargePublicAsset(req(names[5],{method:"HEAD"}),{LINGXI_PUBLIC_LARGE_R2:mockR2});
 assert.equal(h.status,200);
 assert.equal(h.headers.get("content-type"),"application/wasm");
 assert.equal(mockR2.calls[0].head,true);
 const p=await handleLargePublicAsset(req(names[0],{method:"POST"}),{LINGXI_PUBLIC_LARGE_R2:mockR2});
 assert.equal(p.status,405);
 assert.equal(mockR2.calls.length,1);
});
test("corrupted R2 size is denied, preserving model integrity gate",async()=>{
 const bad={get:async()=>({size:1,body:makeBody()})};
 const r=await handleLargePublicAsset(req(names[4]),{LINGXI_PUBLIC_LARGE_R2:bad});
 assert.equal(r.status,503);
 assert.equal(JSON.parse(await r.text()).error,"PUBLIC_LARGE_ASSET_MISSING_OR_MISMATCH");
});
test("offload stage does not remove originals from public and verifies hashes",()=>{
 const source=readFileSync("scripts/cloudflare/stage-large-public-assets.mjs","utf8");
 assert(source.includes("sha256(input)"));
 assert(source.includes("sha256(compiled)"));
 assert(source.includes("await unlink(compiled)"));
 assert(!source.includes("await unlink(input)"));
 assert(source.includes("UNEXPECTED_OVERSIZE_ASSETS"));
 assert(source.includes("offload-worker.mjs"));
 assert(!source.includes("fetchR2Baseline"));
 assert(!source.includes("R2_BASELINE_ASSET_NOT_AVAILABLE"));
 assert(!source.includes("r2-baseline"));
 const audit=readFileSync("scripts/cloudflare/stage-r2-public-assets.mjs","utf8");
 assert(audit.includes("assets.length!==7"));
 assert(audit.includes("entries.length!==7"));
 assert(audit.includes("R2_SEVEN_SOURCE_FILES_SHA256_VERIFIED"));
 assert(audit.includes("R2_AUDIT_ONLY_NO_REMOTE_WRITES"));
});
test("retired desktop entrance video is not in the public R2 manifest or Worker route list",()=>{
 assert.equal(largePublicAssets["/images/entrance/lingxi-opening-desktop-v310.mp4"],undefined);
 const cfg=JSON.parse(readFileSync("wrangler.jsonc","utf8"));
 assert(!cfg.assets.run_worker_first.includes("/images/entrance/lingxi-opening-desktop-v310.mp4"));
});

test("webpack-hashed WASM route only reads an exact generated manifest entry",async()=>{
 const hashed="/_next/static/media/ort-wasm-simd-threaded.asyncify.ac1bbd7f.wasm";
 const extra={[hashed]:{bytes:26861777,contentType:"application/wasm"}};
 const unknown="/_next/static/media/ort-wasm-simd-threaded.asyncify.badcafe0.wasm";
 mockR2.calls=[];
 assert.equal(await handleLargePublicAsset(req(unknown),{LINGXI_PUBLIC_LARGE_R2:mockR2},extra),null);
 const stub={
  calls:[],
  async get(key,opts){
   this.calls.push(key);
   return {size:26861777,body:makeBody(),httpEtag:'"webpack-wasm"'};
  }
 };
 const r=await handleLargePublicAsset(req(hashed),{LINGXI_PUBLIC_LARGE_R2:stub},extra);
 assert.equal(r.status,200);
 assert.equal(r.headers.get("content-type"),"application/wasm");
 assert.deepEqual(stub.calls,["public"+hashed]);
});
test("offload stage validates exactly one webpack-hashed ONNX file and six source paths",()=>{
 const src=readFileSync("scripts/cloudflare/stage-large-public-assets.mjs","utf8");
 assert(src.includes("HASHED_ONNX_WASM_COUNT_MISMATCH"));
 assert(src.includes("HASHED_ONNX_WASM_SIZE_MISMATCH"));
 assert(src.includes("generatedAssets[path]=metadata"));
 assert(src.includes('JSON.stringify(generatedAssets)'));
});
