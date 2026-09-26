import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const RETIRED_EXACT=new Set([
 "/learn","/glossary","/live-as","/subconscious","/practice","/field-tests",
 "/life-map","/relationship","/qian","/mirror","/tarot","/resilience","/romance",
 "/daily","/wealth","/archetype","/mini-report","/membership","/origin","/dream",
 "/declaration","/narrative","/tools/number-energy"
]);

const RETIRED_PREFIXES=[
 "/learn/","/practice/","/life-map/","/relationship/","/qian/","/mirror/","/tarot/",
 "/resilience/","/romance/","/daily/","/wealth/","/archetype/","/mini-report/",
 "/gate/","/narrative/"
];

function retired(pathname:string){
 return RETIRED_EXACT.has(pathname)||RETIRED_PREFIXES.some(prefix=>pathname.startsWith(prefix));
}

function gone(){
 return new NextResponse(
  `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow,noarchive"><title>此内容已下线｜灵犀场</title><body style="font-family:system-ui;padding:48px;max-width:720px;margin:auto"><h1>这个旧页面已经下线</h1><p>灵犀场已经转向 SASI 创作、资料知识与实用工具。你可以从当前产品继续。</p><p><a href="/products">查看当前产品</a> · <a href="/tools">打开实用工具</a></p></body></html>`,
  {status:410,headers:{"content-type":"text/html; charset=utf-8","x-robots-tag":"noindex, nofollow, noarchive"}}
 );
}

export async function middleware(request:NextRequest){
 const forwardedHost=request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
 const requestHostname=(forwardedHost||request.headers.get("host")||request.nextUrl.hostname).split(":")[0].toLowerCase();

 if(requestHostname==="www.lingxifield.cn"||requestHostname==="www.lingxifield.com"){
  const canonicalUrl=request.nextUrl.clone();
  canonicalUrl.protocol="https:";
  canonicalUrl.hostname=requestHostname.slice(4);
  canonicalUrl.port="";
  return NextResponse.redirect(canonicalUrl,308);
 }

 const {pathname}=request.nextUrl;

 if(retired(pathname))return gone();

 if(pathname.length>1&&pathname.endsWith("/")){
  const clean=request.nextUrl.clone();
  clean.pathname=pathname.slice(0,-1);
  return NextResponse.redirect(clean,308);
 }

 if(pathname.startsWith("/api/"))return NextResponse.next({request});

 let response=NextResponse.next({request});
 if(requestHostname==="lingxifield.cn"){
  response.headers.set("Link",`<https://lingxifield.com${pathname}>; rel="canonical"`);
 }

 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return response;

 const supabase=createServerClient(url,key,{
  cookies:{
   getAll(){return request.cookies.getAll()},
   setAll(cookiesToSet){
    cookiesToSet.forEach(({name,value})=>request.cookies.set(name,value));
    response=NextResponse.next({request});
    if(requestHostname==="lingxifield.cn")response.headers.set("Link",`<https://lingxifield.com${pathname}>; rel="canonical"`);
    cookiesToSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));
   },
  },
 });

 try{
  await Promise.race([
   supabase.auth.getUser(),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error("middleware getUser timeout")),5000)),
  ]);
 }catch(e){
  console.error("[middleware] session refresh failed or timed out:",e instanceof Error?e.message:String(e));
 }
 return response;
}

export const config={matcher:["/((?!_next/static|_next/image|favicon.ico|images).*)"]};
