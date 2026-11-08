// Ephemeral, token-protected uploader for exactly eight PUBLIC R2 assets.
const response=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
export default {async fetch(req,env){
 if(!env?.UPLOAD_SECRET||!/^[a-f0-9]{64}$/.test(env.UPLOAD_SECRET))return response({error:"UNCONFIGURED"},503);
 if(Date.now()>=Number(env.EXPIRES_AT_MS))return response({error:"EXPIRED"},410);
 if(req.headers.get("authorization")!=="Bearer "+env.UPLOAD_SECRET)return response({error:"NOT_AUTHORIZED"},401);
 if(!env.PUBLIC_LARGE_R2||!env.ASSET_ALLOWLIST)return response({error:"BINDING_MISSING"},503);
 let items;try{items=JSON.parse(env.ASSET_ALLOWLIST)}catch{return response({error:"INVALID_MANIFEST"},503)}
 if(!Array.isArray(items)||items.length!==8)return response({error:"INVALID_MANIFEST"},503);
 const u=new URL(req.url), id=u.searchParams.get("i");
 if(u.pathname!=="/transfer"||!/^[0-7]$/.test(id||""))return response({error:"NOT_FOUND"},404);
 const i=Number(id),item=items[i];
 if(!item||typeof item.path!=="string"||!/^\/[A-Za-z0-9_.\/-]+$/.test(item.path)||item.path.includes("..")||
   !Number.isSafeInteger(item.bytes)||item.bytes<1||item.bytes>100000000||
   !/^[a-f0-9]{64}$/.test(item.sha256)||typeof item.contentType!=="string")return response({error:"INVALID_OBJECT"},503);
 const key="public"+item.path;
 if(req.method==="PUT"){
  const size=Number(req.headers.get("content-length"));
  if(!Number.isSafeInteger(size)||size!==item.bytes||!req.body)return response({error:"LENGTH_MISMATCH"},413);
  if(req.headers.get("x-verified-sha256")!==item.sha256)return response({error:"MANIFEST_SHA_MISMATCH"},409);
  try{
   const result=await env.PUBLIC_LARGE_R2.put(key,req.body,{httpMetadata:{contentType:item.contentType},customMetadata:{sha256:item.sha256}});
   return result&&result.size===size?response({ok:true,index:i,bytes:size}):response({error:"WRITE_MISMATCH"},503);
  }catch{return response({error:"R2_WRITE_FAILED"},503)}
 }
 if(req.method==="GET"||req.method==="HEAD"){
  try{
   const file=req.method==="GET"?await env.PUBLIC_LARGE_R2.get(key):await env.PUBLIC_LARGE_R2.head(key);
   if(!file||file.size!==item.bytes)return response({error:"NOT_FOUND"},404);
   return new Response(req.method==="GET"?file.body:null,{status:200,headers:{"content-type":item.contentType,"content-length":String(item.bytes),"cache-control":"no-store"}});
  }catch{return response({error:"R2_READ_FAILED"},503)}
 }
 return new Response(null,{status:405,headers:{"allow":"PUT, GET, HEAD"}});
}};