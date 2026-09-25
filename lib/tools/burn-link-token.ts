import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";
import type {NextRequest} from "next/server";

const TRUSTED_HOSTS=new Set(["lingxifield.com","www.lingxifield.com","lingxifield.cn","www.lingxifield.cn"]);

function secret(){
  const value=
    process.env.BURN_LINK_TOKEN_SECRET?.trim() ||
    process.env.TEMP_MAIL_INGEST_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if(!value)throw new Error("BURN_LINK_TOKEN_SECRET_MISSING");
  return value;
}
function sig(id:string,exp:number){
  return createHmac("sha256",secret()).update(`v1:${id}:${exp}`).digest("base64url");
}
export function createBurnRevealToken(id:string,expiresAt:string){
  const exp=Math.floor(new Date(expiresAt).getTime()/1000);
  if(!id||!Number.isFinite(exp)||exp<=0)throw new Error("BURN_LINK_TOKEN_INPUT_INVALID");
  return `v1.${exp}.${sig(id,exp)}`;
}
export function verifyBurnRevealToken(id:string,token:string){
  if(!id||!token)return false;
  const m=/^v1\.(\d{10})\.([A-Za-z0-9_-]{20,})$/.exec(token);
  if(!m)return false;
  const exp=Number(m[1]);
  if(!Number.isFinite(exp)||exp<Math.floor(Date.now()/1000))return false;
  const expected=Buffer.from(sig(id,exp));
  const actual=Buffer.from(m[2]);
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
function trustedUrl(value:string|null){
  if(!value)return false;
  try{const u=new URL(value);return u.protocol==="https:"&&TRUSTED_HOSTS.has(u.hostname.toLowerCase())&&u.pathname.startsWith("/tools/burn-after-read/")}
  catch{return false}
}
function hostOnly(v:string|null){return (v||"").split(",")[0].trim().toLowerCase().replace(/:\d+$/,"")}
export function isTrustedBurnWebViewRequest(req:NextRequest){
  const origin=(req.headers.get("origin")||"").trim().toLowerCase();
  if(origin&&origin!=="null")return false;
  const site=(req.headers.get("sec-fetch-site")||"").trim().toLowerCase();
  if(site&&!["none","same-origin","same-site"].includes(site))return false;
  const referer=req.headers.get("referer");
  if(!trustedUrl(referer))return false;
  const hosts=[
    hostOnly(req.headers.get("x-forwarded-host")),
    hostOnly(req.headers.get("host")),
    req.nextUrl.hostname.toLowerCase(),
  ].filter(Boolean);
  return hosts.some(h=>TRUSTED_HOSTS.has(h));
}
