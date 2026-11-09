// Public immutable GitHub Release assets only; no credentials, no R2 write
// capability, no arbitrary proxy URLs, no production routes or sensitive logs.
const base="https://github.com/3078024889/lingxi-quantum/releases/download/ecs-cn-unified-20261108-5308e015b06b/";
const archive="cn-20261108-unified-standalone.tar.gz";
function allowed(name){
 if(name==="eight-parts.sha256"||name==="micro-parts.sha256"||name===archive+".sha256")return true;
 if(new RegExp("^"+archive.replaceAll(".","\\.")+"\\.part-0[0-7]$").test(name))return true;
 const m=new RegExp("^"+archive.replaceAll(".","\\.")+"\\.part-0([1-7])\\.block-0([0-6])$").exec(name);
 return !!m;
}
export default {
 async fetch(request){
  if(!["GET","HEAD"].includes(request.method))return new Response("Method not allowed",{status:405});
  const path=new URL(request.url).pathname;
  if(path==="/"||path.includes("%")||path.includes("\\")||path.includes("//"))return new Response("Not found",{status:404});
  const name=path.slice(1);
  if(!allowed(name))return new Response("Not found",{status:404});
  const headers=new Headers({accept:"application/octet-stream"});
  const range=request.headers.get("range");
  if(range){
   if(!/^bytes=\\d+-\\d*$/.test(range)||range.length>54)return new Response("Bad range",{status:416});
   headers.set("range",range);
  }
  let upstream;
  try{
   upstream=await fetch(base+name,{method:request.method,headers,redirect:"follow",signal:AbortSignal.timeout(120000)});
  }catch{
   return new Response("Upstream unavailable",{status:502,headers:{"cache-control":"no-store"}});
  }
  if(![200,206].includes(upstream.status)){
   return new Response("Upstream HTTP "+upstream.status,{status:502,headers:{"cache-control":"no-store"}});
  }
  const safe=new Headers({"content-type":"application/octet-stream","cache-control":"no-store","x-content-type-options":"nosniff","access-control-allow-origin":"*"});
  for(const h of ["content-range","accept-ranges","content-length","etag"]){
   const v=upstream.headers.get(h);
   if(v)safe.set(h,v);
  }
  return new Response(request.method==="HEAD"?null:upstream.body,{status:upstream.status,headers:safe});
 }
};
