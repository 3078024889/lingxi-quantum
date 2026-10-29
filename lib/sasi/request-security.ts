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

function localDevelopmentOrigin(request:NextRequest, origin:string|null, referer:string|null){
  const configured=process.env.LINGXIFIELD_LOCAL_AUTH_ORIGIN?.trim();
  if(process.env.NODE_ENV!=="development"&&!configured)return false;
  const host=request.headers.get("host")?.toLowerCase().trim()||"";
  if(!/^localhost:[0-9]{1,5}$/.test(host)&&!/^127[.]0[.]0[.]1:[0-9]{1,5}$/.test(host))return false;
  const source=origin||referer;
  if(!source)return false;
  try{
    const url=new URL(source);
    const requested=new URL("http://"+host);
    // Production-mode local acceptance is opt-in for one exact loopback origin.
    // Never infer this exception from a forwarded host or a public site URL.
    if(process.env.NODE_ENV!=="development"&&configured!==requested.origin)return false;
    if(!["localhost","127.0.0.1"].includes(request.nextUrl.hostname.toLowerCase()))return false;
    if(url.protocol!=="http:"||url.host!==requested.host||url.username||url.password)return false;
    const forwarded=request.headers.get("x-forwarded-host")?.toLowerCase().trim();
    if(forwarded&&forwarded!==host)return false;
    return true;
  }catch{return false;}
}

export function isSameOriginMutation(request:NextRequest){
  const site=(request.headers.get("sec-fetch-site")||"").toLowerCase();
  if(site&&site!=="same-origin"&&site!=="same-site")return false;

  const origin=request.headers.get("origin");
  const referer=request.headers.get("referer");
  const sourceTrusted=trustedUrl(origin)||(!origin&&trustedUrl(referer));
  if(!sourceTrusted)return localDevelopmentOrigin(request,origin,referer);

  const hosts=[
    hostOnly(request.headers.get("x-forwarded-host")),
    hostOnly(request.headers.get("host")),
    request.nextUrl.hostname.toLowerCase(),
  ].filter(Boolean);

  return hosts.some(host=>TRUSTED_PUBLIC_HOSTS.has(host));
}
