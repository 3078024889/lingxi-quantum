// LINGXIFIELD CN 3193: immutable, public release files with no dynamic origin.
// All assets are originally published GitHub Release artifacts; no private data
// or credentials are included. No production routes, no upload/mutation methods.
const prefix="cn-20261108-unified-standalone.tar.gz.part-";
function allowed(name){
 if(["eight-parts.sha256","all-micro-parts.sha256","cn-20261108-unified-standalone.sha256","ecs-cn3193-unified-standalone-stage-20261108.sh"].includes(name))return true;
 return /^cn-20261108-unified-standalone\.tar\.gz\.part-0[0-7]\.block-0[0-6]$/.test(name);
}
export default {
 async fetch(request,env){
  if(!["GET","HEAD"].includes(request.method))
   return new Response("Method not allowed",{status:405,headers:{"cache-control":"no-store"}});
  const url=new URL(request.url);
  const path=url.pathname;
  if(path==="/"||path.includes("%")||path.includes("\\")||path.includes("//"))
   return new Response("Not found",{status:404});
  const name=path.slice(1);
  if(!allowed(name))return new Response("Not found",{status:404});
  // ASSETS is Cloudflare's own versioned static asset store. No GitHub fetch.
  const out=await env.ASSETS.fetch(new Request(url.origin+"/"+name,{method:request.method}));
  if(out.status!==200&&out.status!==206)return new Response("Not found",{status:404});
  const headers=new Headers(out.headers);
  headers.set("cache-control","public, max-age=3600, immutable");
  headers.set("x-content-type-options","nosniff");
  return new Response(request.method==="HEAD"?null:out.body,{status:out.status,headers});
 }
};