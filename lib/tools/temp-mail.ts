import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const TEMP_MAIL_TTL_MINUTES=10;
export const TEMP_MAIL_MAX_LIFETIME_MINUTES=60;
export const TEMP_MAIL_ACCESS_COOKIE="lx_tm_access";
export const TEMP_MAIL_DEVICE_COOKIE="lx_tm_device";

export function tempMailDomain(){
  const raw=process.env.TEMP_MAIL_DOMAIN?.trim().toLowerCase()||"";
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(raw)?raw:"";
}
export function tempMailConfigured(){
  return Boolean(tempMailDomain()&&process.env.TEMP_MAIL_INGEST_SECRET?.trim());
}
export function randomLocalPart(){
  return randomBytes(9).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,12);
}
export function randomMailboxToken(){return randomBytes(32).toString("base64url")}
export function mailboxTokenHash(token:string){return createHash("sha256").update(token).digest("hex")}

function sessionSecret(){
  return process.env.TEMP_MAIL_SESSION_SECRET?.trim()
    ||process.env.TEMP_MAIL_INGEST_SECRET?.trim()
    ||"";
}

function mac(purpose:string,value:string){
  const secret=sessionSecret();
  if(!secret)return "";
  return createHmac("sha256",secret).update(`lingxifield:${purpose}:v1:${value}`).digest("base64url");
}

export function createMailboxAccessCookie(id:string,token:string){
  const payload=Buffer.from(JSON.stringify({id,token}),"utf8").toString("base64url");
  return `${payload}.${mac("temp-mail-access",payload)}`;
}

export function parseMailboxAccessCookie(value:string|undefined){
  if(!value)return null;
  const dot=value.lastIndexOf(".");
  if(dot<1)return null;
  const payload=value.slice(0,dot),sig=value.slice(dot+1),expected=mac("temp-mail-access",payload);
  if(!sig||!expected)return null;
  const a=Buffer.from(sig),b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b))return null;
  try{
    const parsed=JSON.parse(Buffer.from(payload,"base64url").toString("utf8")) as {id?:string;token?:string};
    if(!parsed.id||!parsed.token)return null;
    if(!/^[0-9a-f-]{36}$/i.test(parsed.id))return null;
    if(parsed.token.length<32||parsed.token.length>128)return null;
    return {id:parsed.id,token:parsed.token};
  }catch{return null}
}

export function timingSafeSecret(value:string|undefined){
  const expected=process.env.TEMP_MAIL_INGEST_SECRET?.trim()||"";
  if(!expected||!value)return false;
  const a=Buffer.from(expected),b=Buffer.from(value);
  return a.length===b.length&&timingSafeEqual(a,b);
}
