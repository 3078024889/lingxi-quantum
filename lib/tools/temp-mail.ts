import "server-only";
import { createHash, randomBytes } from "node:crypto";

export const TEMP_MAIL_TTL_MINUTES=10;
export const TEMP_MAIL_MAX_LIFETIME_MINUTES=60;

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
export function timingSafeSecret(value:string|undefined){
  const expected=process.env.TEMP_MAIL_INGEST_SECRET?.trim()||"";
  if(!expected||!value)return false;
  const a=Buffer.from(expected),b=Buffer.from(value);
  if(a.length!==b.length)return false;
  return require("node:crypto").timingSafeEqual(a,b);
}
