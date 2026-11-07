// Public immutable-by-release media/models too large for Workers Static Assets.
// These are read-only paths; no user-uploaded content or private R2 keys.
export const largePublicAssets = Object.freeze({
 "/images/entrance/lingxi-opening-desktop-v310.mp4": {bytes:42282372,contentType:"video/mp4"},
 "/models/Xenova/clip-vit-base-patch32/onnx/text_model_quantized.onnx": {bytes:64504507,contentType:"application/octet-stream"},
 "/models/Xenova/clip-vit-base-patch32/onnx/vision_model_quantized.onnx": {bytes:89117001,contentType:"application/octet-stream"},
 "/models/onnx-community/swin-finetuned-food101-ONNX/onnx/model_q4f16.onnx": {bytes:52685075,contentType:"application/octet-stream"},
 "/models/onnx-community/whisper-tiny/onnx/decoder_model_merged_quantized.onnx": {bytes:30719241,contentType:"application/octet-stream"},
 "/runtime/food-onnx/ort-wasm-simd-threaded.asyncify.wasm": {bytes:26861777,contentType:"application/wasm"},
});
const unavailable = (error="PUBLIC_LARGE_ASSETS_NOT_READY") =>
 new Response(JSON.stringify({error}),{status:503,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
function selectRange(raw,total){
 if(!raw) return null;
 const m=/^bytes=(\d*)-(\d*)$/.exec(raw.trim());
 if(!m || (!m[1]&&!m[2]))return "invalid";
 const start=m[1]?Number(m[1]):NaN;
 const end=m[2]?Number(m[2]):NaN;
 if((m[1]&&!Number.isSafeInteger(start))||(m[2]&&!Number.isSafeInteger(end)))return "invalid";
 let first,last;
 if(!m[1]){
   if(end<=0)return "invalid";
   first=Math.max(0,total-end);last=total-1;
 }else{
   first=start;last=m[2]?end:total-1;
 }
 if(first>=total||last<first)return "invalid";
 last=Math.min(last,total-1);
 return {offset:first,length:last-first+1,last};
}
export async function handleLargePublicAsset(request, env){
 const pathname=new URL(request.url).pathname;
 const asset=largePublicAssets[pathname];
 if(!asset)return null;
 if(request.method!=="GET"&&request.method!=="HEAD")
   return new Response(null,{status:405,headers:{"allow":"GET, HEAD","cache-control":"no-store"}});
 const range=request.method==="GET"?selectRange(request.headers.get("range"),asset.bytes):null;
 if(range==="invalid")return new Response(null,{status:416,headers:{"content-range":`bytes */${asset.bytes}`,"accept-ranges":"bytes","cache-control":"no-store"}});
 if(!env?.LINGXI_PUBLIC_LARGE_R2)return unavailable();
 // The dedicated R2 bucket contains ONLY versioned public media/ML assets.
 const key="public"+pathname;
 try{
   const file=request.method==="HEAD"
     ?await env.LINGXI_PUBLIC_LARGE_R2.head(key)
     :await env.LINGXI_PUBLIC_LARGE_R2.get(key,range?{range:{offset:range.offset,length:range.length}}:undefined);
   if(!file||file.size!==asset.bytes||request.method==="GET"&&!file.body)return unavailable("PUBLIC_LARGE_ASSET_MISSING_OR_MISMATCH");
   const headers=new Headers({
      "content-type":asset.contentType,
      "content-length":String(range?range.length:asset.bytes),
      "accept-ranges":"bytes",
      "cache-control":"public, max-age=86400, stale-while-revalidate=604800",
      "x-content-type-options":"nosniff",
      "content-disposition":"inline",
   });
   if(file.httpEtag)headers.set("etag",file.httpEtag);
   if(range)headers.set("content-range",`bytes ${range.offset}-${range.last}/${asset.bytes}`);
   return new Response(request.method==="HEAD"?null:file.body,{status:range?206:200,headers});
 }catch{
   return unavailable();
 }
}
