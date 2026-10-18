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

function previewSourceHost(value:string|null){
  if(typeof process==="undefined"||process.env.VERCEL_ENV!=="preview"||!value)return "";
  try{
    const source=new URL(value);
    if(source.protocol!=="https:"||source.port||source.username||source.password)return "";
    // Only this deployment's platform-provided hosts, never all *.vercel.app.
    const hosts=[process.env.VERCEL_URL,process.env.VERCEL_BRANCH_URL]
      .filter((host):host is string=>typeof host==="string"&&/^[a-z0-9-]+\.vercel\.app$/i.test(host))
      .map(host=>host.toLowerCase());
    return hosts.includes(source.hostname.toLowerCase())?source.hostname.toLowerCase():"";
  }catch{return ""}
}

export function isSameOriginMutation(request:NextRequest){
  const site=(request.headers.get("sec-fetch-site")||"").toLowerCase();
  if(site&&site!=="same-origin"&&site!=="same-site")return false;

  const origin=request.headers.get("origin");
  const referer=request.headers.get("referer");
  const sourceTrusted=trustedUrl(origin)||(!origin&&trustedUrl(referer));

  const hosts=[
    hostOnly(request.headers.get("x-forwarded-host")),
    hostOnly(request.headers.get("host")),
    request.nextUrl.hostname.toLowerCase(),
  ].filter(Boolean);

  if(sourceTrusted)return hosts.some(host=>TRUSTED_PUBLIC_HOSTS.has(host));
  const previewHost=previewSourceHost(origin||referer);
  return !!previewHost&&hosts.includes(previewHost);
}
