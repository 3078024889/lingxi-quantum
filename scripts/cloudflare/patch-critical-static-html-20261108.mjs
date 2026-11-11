#!/usr/bin/env node
// FREE 10ms CPU: prebuilt anonymous pages avoid heavy Next SSR on critical routes.
import {readFile,writeFile} from "node:fs/promises";
import {join} from "node:path";
const root=".open-next";
const assets=join(root,"assets","__lingxi_edge_static__");
const routes={"/":"landing.html","/siai":"siai.html"};
for(const [route,file] of Object.entries(routes)){
 const html=await readFile(join(assets,file),"utf8");
 if(html.length<10000||!/<html[\s>]/i.test(html)||!/<head[\s>]/i.test(html)||!/<body[\s>]/i.test(html)||
   /INTERNAL_SERVER_ERROR|WORKERD_HEALTH_NOT_READY/.test(html))throw Error("BAD_PRE_RENDERED_HTML:"+route);
 if(route==="/siai"&&!html.includes("SIAI"))throw Error("RANKING_MISSING_FROM_SNAPSHOT");
 if(route==="/"&&!html.includes("LINGXIFIELD")&&!html.includes("灵犀场"))throw Error("LANDING_BRANDING_MISSING");
 console.log("PUBLIC_STATIC_HTML_VALIDATED:"+route+":"+Buffer.byteLength(html));
}
const target=join(root,"offload-worker.mjs");
const source=await readFile(target,"utf8");
const needle="  return offloaded||app.fetch(request,env,ctx);";
if(source.split(needle).length!==2)throw Error("UNEXPECTED_OPENNEXT_WRAPPER_BODY");
const replacement=[
'  if((request.method==="GET"||request.method==="HEAD")&&',
'     (new URL(request.url).pathname==="/"||new URL(request.url).pathname==="/siai")){',
'    const file=new URL(request.url).pathname==="/"?"landing.html":"siai.html";',
'    const assetUrl=new URL("/__lingxi_edge_static__/"+file,request.url);',
'    const staticResponse=await env.ASSETS.fetch(new Request(assetUrl.toString(),{method:request.method}));',
'    if(staticResponse.status!==200)',
'      return new Response("CRITICAL_STATIC_ASSET_NOT_READY",{status:503,headers:{"cache-control":"no-store"}});',
'    const h=new Headers(staticResponse.headers);',
'    h.set("cache-control","public, max-age=300");',
'    h.set("x-lingxi-render-mode","static-edge-verified");',
'    return new Response(request.method==="HEAD"?null:staticResponse.body,{status:200,headers:h});',
'  }',
'  return offloaded||app.fetch(request,env,ctx);'
].join("\n");
await writeFile(target,source.replace(needle,replacement));
console.log("CRITICAL_EDGE_STATIC_WRAPPER_INSTALLED_NO_PRODUCTION_DEPLOY");
