// Anonymous, verified three-tool HTML fast path (Cloudflare static assets).
// Next.js RSC requests must remain on the full application Worker, never HTML.
const allowed=new Set(["ico-to-png","number-base-converter","video-watermark-remover"]);
export default {
 async fetch(request,env){
  const u=new URL(request.url);
  const match=/^\/tools\/([a-z0-9-]+)\/?$/.exec(u.pathname);
  const slug=match?.[1];
  if(!slug||!allowed.has(slug))
    return new Response("Not found",{status:404,headers:{"cache-control":"no-store"}});
  if(request.method!=="GET"&&request.method!=="HEAD")
    return new Response("Method not allowed",{status:405,headers:{allow:"GET, HEAD","cache-control":"no-store"}});
  if(u.pathname!=="/tools/"+slug)
    return Response.redirect(new URL("/tools/"+slug+u.search,u.origin),308);
  // Preserve App Router streaming and hydration on client navigations.
  if(request.headers.get("RSC")==="1"||u.searchParams.has("_rsc")||
     request.headers.has("Next-Router-State-Tree")){
   return env.FULL_MAIN.fetch(request);
  }
  const staticUrl=new URL("/snapshots/"+slug+".html",request.url);
  const original=await env.ASSETS.fetch(new Request(staticUrl.toString(),{method:request.method}));
  if(original.status!==200)
    return new Response("Verified tool snapshot unavailable",{status:503,headers:{"cache-control":"no-store"}});
  const h=new Headers(original.headers);
  h.set("content-type","text/html; charset=utf-8");
  h.set("cache-control","public, max-age=300, stale-while-revalidate=120");
  h.set("x-lingxi-render-mode","static-edge-verified");
  h.set("x-content-type-options","nosniff");
  return new Response(request.method==="HEAD"?null:original.body,{status:200,headers:h});
 }
};
