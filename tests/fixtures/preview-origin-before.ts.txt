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
function trustedUrl(value:string|null){
  if(!value)return false;
  try{
    const u=new URL(value);
    return u.protocol==="https:"&&TRUSTED_PUBLIC_HOSTS.has(u.hostname.toLowerCase());
  }catch{return false}
}

export function isSameOriginMutation(request:NextRequest){
  const site=(request.headers.get("sec-fetch-site")||"").toLowerCase();
  if(site&&site!=="same-origin"&&site!=="same-site")return false;

  const origin=request.headers.get("origin");
  const referer=request.headers.get("referer");
  const sourceTrusted=trustedUrl(origin)||(!origin&&trustedUrl(referer));
  if(!sourceTrusted)return false;

  const hosts=[
    hostOnly(request.headers.get("x-forwarded-host")),
    hostOnly(request.headers.get("host")),
    request.nextUrl.hostname.toLowerCase(),
  ].filter(Boolean);

  return hosts.some(host=>TRUSTED_PUBLIC_HOSTS.has(host));
}
