#!/usr/bin/env node
// Cloudflare Free 10ms CPU: cache only verified, anonymous, public page shells.
// Authenticated accounts, checkout, orders, upload/delivery and admin APIs stay dynamic.
import {readFile,writeFile} from "node:fs/promises";
import {join} from "node:path";
const root=".open-next";
const assetRoot=join(root,"assets","__lingxi_edge_static__");
const routes={
 "/":"landing.html",
 "/siai":"siai.html",
 "/tools":"tools.html",
 "/sasi":"sasi.html",
 "/sasi/marketplace":"marketplace.html",
 "/announcements":"announcements.html",
 "/en/siai":"en-siai.html",
 "/ja/siai":"ja-siai.html",
 "/ko/siai":"ko-siai.html",
 "/fr/siai":"fr-siai.html",
 "/de/siai":"de-siai.html",
 "/es/siai":"es-siai.html",
 "/pt/siai":"pt-siai.html",
 "/ar/siai":"ar-siai.html",
 "/tools/ico-to-png":"tool-ico-to-png.html",
 "/tools/number-base-converter":"tool-number-base-converter.html",
 "/tools/video-watermark-remover":"tool-video-watermark-remover.html"
};
for(const [route,file] of Object.entries(routes)){
 const html=await readFile(join(assetRoot,file),"utf8");
 if(Buffer.byteLength(html)<4500||!/<html[\s>]/i.test(html)||!/<head[\s>]/i.test(html)||
  !/<body[\s>]/i.test(html)||/INTERNAL_SERVER_ERROR|WORKERD_HEALTH_NOT_READY/.test(html))
  throw Error("BAD_PRE_RENDERED_HTML:"+route);
 if(route==="/siai"&&!html.includes("SIAI"))throw Error("RANKING_MISSING_FROM_SNAPSHOT");
 if(route==="/"&&!html.includes("LINGXIFIELD")&&!html.includes("灵犀场"))
  throw Error("LANDING_BRANDING_MISSING");
 console.log("PUBLIC_STATIC_HTML_VALIDATED:"+route+":"+Buffer.byteLength(html));
}
const softwareCatalog=JSON.parse(await readFile(join(assetRoot,"software-catalog.json"),"utf8"));
const productIds=Object.keys(softwareCatalog.products||{}).sort();
if(JSON.stringify(productIds)!==JSON.stringify(["sasi-copernicus-si95-source"])||
  productIds.some(id=>softwareCatalog.products[id]?.available!==false)||
  !softwareCatalog.payment||Object.values(softwareCatalog.payment).some(Boolean))
 throw Error("COM_ANON_SOFTWARE_CATALOG_NOT_SAFELY_DISABLED");
console.log("COM_PUBLIC_SOFTWARE_CATALOG_SNAPSHOT_VERIFIED");
const target=join(root,"offload-worker.mjs");
const source=await readFile(target,"utf8");
const needle="  return offloaded||app.fetch(request,env,ctx);";
if(source.split(needle).length!==2)throw Error("UNEXPECTED_OPENNEXT_WRAPPER_BODY");
const replacement=[
 '  const pathname=new URL(request.url).pathname;',
'  if(pathname==="/api/sasi/software/catalog"&&(request.method==="GET"||request.method==="HEAD")&&',
'     env.SOFTWARE_COMMERCE_READY!=="true"&&env.ALIPAY_ENABLED!=="true"&&env.WECHAT_ENABLED!=="true"&&env.PAYPAL_ENABLED!=="true"){',
'    const staticUrl=new URL("/__lingxi_edge_static__/software-catalog.json",request.url);',
'    const reply=await env.ASSETS.fetch(new Request(staticUrl.toString(),{method:request.method}));',
'    if(reply.status!==200)return new Response("PUBLIC_CATALOG_ASSET_UNAVAILABLE",{status:503});',
'    const h=new Headers(reply.headers);',
'    h.set("content-type","application/json; charset=utf-8");',
'    h.set("cache-control","public, max-age=60");',
'    h.set("x-lingxi-render-mode","static-edge-verified");',
'    return new Response(request.method==="HEAD"?null:reply.body,{status:200,headers:h});',
'  }',
 '  if(pathname.startsWith("/api/")&&',
 '     pathname!=="/api/sasi/software/catalog"&&',
 '     !pathname.startsWith("/api/sasi/marketplace/")&&',
 '     !pathname.startsWith("/api/sasi/software/")&&env.LINGXI_COM_LEGACY_GATEWAY){',
 '    return env.LINGXI_COM_LEGACY_GATEWAY.fetch(request);',
 '  }',
 '  const verifiedAnonymousPages='+JSON.stringify(routes)+';',
 '  const edgeFile=verifiedAnonymousPages[pathname];',
 '  if((request.method==="GET"||request.method==="HEAD")&&edgeFile){',
 '    const assetUrl=new URL("/__lingxi_edge_static__/"+edgeFile,request.url);',
 '    const staticResponse=await env.ASSETS.fetch(new Request(assetUrl.toString(),{method:request.method}));',
 '    if(staticResponse.status!==200)',
 '      return new Response("CRITICAL_STATIC_ASSET_NOT_READY",{status:503,headers:{"cache-control":"no-store"}});',
 '    const h=new Headers(staticResponse.headers);',
 '    h.set("cache-control","public, max-age=300, stale-while-revalidate=120");',
 '    h.set("x-lingxi-render-mode","static-edge-verified");',
 '    h.set("x-content-type-options","nosniff");',
 '    return new Response(request.method==="HEAD"?null:staticResponse.body,{status:200,headers:h});',
 '  }',
 needle
].join("\n");
await writeFile(target,source.replace(needle,replacement));
console.log("COM_SEVENTEEN_PUBLIC_ANONYMOUS_EDGE_ROUTES_ENABLED");
