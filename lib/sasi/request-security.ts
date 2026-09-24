import "server-only";
import type { NextRequest } from "next/server";

const TRUSTED_PUBLIC_HOSTS=new Set([
  "lingxifield.com","www.lingxifield.com",
  "lingxifield.cn","www.lingxifield.cn",
]);

function hostOnly(value:string|null){
  if(!value)return "";
  return value.split(",")[0].trim().toLowerCase().replace(/:\d+$/,"");
}

export function isSameOriginMutation(request:NextRequest){
  const raw=request.headers.get("origin");
  const site=(request.headers.get("sec-fetch-site")||"").toLowerCase();
  if(site&&site!=="same-origin")return false;
  if(!raw)return false;
  try{
    const origin=new URL(raw);
    if(origin.hostname==="localhost"||origin.hostname==="127.0.0.1"){
      return origin.origin===request.nextUrl.origin;
    }
    if(origin.protocol!=="https:"||!TRUSTED_PUBLIC_HOSTS.has(origin.hostname.toLowerCase()))return false;
    const hosts=[
      hostOnly(request.headers.get("x-forwarded-host")),
      hostOnly(request.headers.get("host")),
      request.nextUrl.hostname.toLowerCase(),
    ].filter(Boolean);
    return hosts.some(host=>TRUSTED_PUBLIC_HOSTS.has(host));
  }catch{return false}
}
