#!/usr/bin/env node
// Cloudflare Free 10ms CPU: cache only verified, anonymous, public page shells.
// Authenticated accounts, checkout, orders, upload/delivery and admin APIs stay dynamic.
import {readFile,writeFile} from "node:fs/promises";
import {join} from "node:path";
import {publicMarketListings} from "./public-market-listings.mjs";
const root=".open-next";
const assetRoot=join(root,"assets","__lingxi_edge_static__");
const routes={
 "/":"landing.html",
 "/siai":"siai.html",
 "/tools":"tools.html",
 "/tools/pass":"tools-pass.html",
 "/ai-wallet":"ai-wallet.html",
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
 '  const publicCatalog=await ('+publicMarketListings.toString()+')(request,env);',
 '  if(publicCatalog)return publicCatalog;',
 '  const pathname=new URL(request.url).pathname;',
 "  // Worker liveness only. Payment, auth and entitlement readiness have separate hard gates.",
 "  if(pathname===\"/api/health\"&&(request.method===\"GET\"||request.method===\"HEAD\")){",
 "    const headers={\"content-type\":\"application/json; charset=utf-8\",\"cache-control\":\"no-store, max-age=0\",",
 "      \"x-lingxi-health-scope\":\"edge-liveness\",\"x-content-type-options\":\"nosniff\"};",
 "    return new Response(request.method===\"HEAD\"?null:JSON.stringify({ok:true,service:\"lingxifield\",scope:\"edge-liveness\"}),",
 "      {status:200,headers});",
 "  }",
 "  // Public merchant readiness is account-neutral; avoid intermittent 10ms Worker SSR 500.",
 "  if(pathname===\"/api/pay/providers\"&&(request.method===\"GET\"||request.method===\"HEAD\")){",
 "    const present=(name)=>typeof env[name]===\"string\"&&env[name].trim().length>0;",
 "    const missing=(names)=>names.filter(name=>!present(name)).length;",
 "    const merchantWechat=[\"WECHAT_APP_ID\",\"WECHAT_MCH_ID\",\"WECHAT_API_V3_KEY\",\"WECHAT_PRIVATE_KEY\",\"WECHAT_CERT_SERIAL_NO\",\"WECHAT_PLATFORM_PUBLIC_KEY\",\"WECHAT_PLATFORM_PUBLIC_KEY_ID\"];",
 "    const merchantAlipay=[\"ALIPAY_APP_ID\",\"ALIPAY_PRIVATE_KEY\",\"ALIPAY_PUBLIC_KEY\"];",
 "    const merchantPaypal=[\"PAYPAL_CLIENT_ID\",\"PAYPAL_CLIENT_SECRET\",\"PAYPAL_WEBHOOK_ID\"];",
 "    const configured={wechat:missing(merchantWechat)===0,alipay:missing(merchantAlipay)===0,paypal:missing(merchantPaypal)===0};",
 "    const enabled={",
 "      wechat:configured.wechat&&env.WECHAT_ENABLED===\"true\",",
 "      alipay:configured.alipay&&env.ALIPAY_ENABLED===\"true\",",
 "      paypal:configured.paypal&&env.PAYPAL_ENABLED===\"true\"&&env.PAYPAL_ENV!==\"sandbox\"",
 "    };",
 "    const payload={...enabled,diagnostics:{",
 "      wechat:{configured:configured.wechat,enabled:enabled.wechat,missingCount:missing(merchantWechat)},",
 "      alipay:{configured:configured.alipay,enabled:enabled.alipay,missingCount:missing(merchantAlipay)},",
 "      paypal:{configured:configured.paypal,enabled:enabled.paypal,missingCount:missing(merchantPaypal)}",
 "    }};",
 "    return new Response(request.method===\"HEAD\"?null:JSON.stringify(payload),{status:200,headers:{",
 "      \"content-type\":\"application/json; charset=utf-8\",",
 "      \"cache-control\":\"no-store, max-age=0\",",
 "      \"x-content-type-options\":\"nosniff\",",
 "      \"x-lingxi-render-mode\":\"edge-merchant-readiness\"",
 "    }});",
 "  }",
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
 '     pathname!=="/api/pay/providers"&&pathname!=="/api/money/summary"&&',
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
console.log("COM_EIGHTEEN_PUBLIC_ANONYMOUS_EDGE_ROUTES_ENABLED");
