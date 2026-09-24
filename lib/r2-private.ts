import "server-only";
import {createHmac,createHash,randomUUID} from "node:crypto";

function env(name:string){
  const v=process.env[name]?.trim();
  if(!v)throw new Error(`R2_MISSING_${name}`);
  return v;
}
function hexSha256(s:string){return createHash("sha256").update(s).digest("hex")}
function hmac(key:Buffer|string,data:string){return createHmac("sha256",key).update(data).digest()}
function enc(s:string){return encodeURIComponent(s).replace(/[!'()*]/g,c=>`%${c.charCodeAt(0).toString(16).toUpperCase()}`)}
function endpoint(){
  const raw=env("R2_ENDPOINT").replace(/\/+$/,"");
  const u=new URL(raw);
  if(u.protocol!=="https:")throw new Error("R2_ENDPOINT_INVALID");
  return u;
}
function keyPath(key:string){return "/"+key.split("/").map(enc).join("/")}

export function r2Ready(){
  return Boolean(
    process.env.R2_ACCOUNT_ID?.trim() &&
    process.env.R2_ACCESS_KEY_ID?.trim() &&
    process.env.R2_SECRET_ACCESS_KEY?.trim() &&
    process.env.R2_BUCKET_PRIVATE_BURN?.trim() &&
    process.env.R2_ENDPOINT?.trim()
  );
}

export function privateBurnBucket(){return env("R2_BUCKET_PRIVATE_BURN")}
export function newBurnObjectKey(noteId:string,fileName:string){
  const ext=(fileName.match(/(\.[A-Za-z0-9]{1,10})$/)?.[1]||"").toLowerCase();
  return `burn/${noteId}/${randomUUID()}${ext}`;
}

export function presignR2(method:"GET"|"PUT"|"HEAD"|"DELETE",key:string,expiresSeconds=600){
  const ep=endpoint(),access=env("R2_ACCESS_KEY_ID"),secret=env("R2_SECRET_ACCESS_KEY"),bucket=privateBurnBucket();
  const now=new Date();
  const amz=now.toISOString().replace(/[:-]|\.\d{3}/g,"");
  const date=amz.slice(0,8),region="auto",service="s3";
  const scope=`${date}/${region}/${service}/aws4_request`;
  const host=ep.host;
  const canonicalUri=keyPath(`${bucket}/${key}`);
  const q:Record<string,string>={
    "X-Amz-Algorithm":"AWS4-HMAC-SHA256",
    "X-Amz-Credential":`${access}/${scope}`,
    "X-Amz-Date":amz,
    "X-Amz-Expires":String(Math.max(1,Math.min(3600,expiresSeconds))),
    "X-Amz-SignedHeaders":"host",
  };
  const canonicalQuery=Object.keys(q).sort().map(k=>`${enc(k)}=${enc(q[k])}`).join("&");
  const canonicalHeaders=`host:${host}\n`;
  const canonicalRequest=[method,canonicalUri,canonicalQuery,canonicalHeaders,"host","UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign=["AWS4-HMAC-SHA256",amz,scope,hexSha256(canonicalRequest)].join("\n");
  const kDate=hmac(`AWS4${secret}`,date),kRegion=hmac(kDate,region),kService=hmac(kRegion,service),kSigning=hmac(kService,"aws4_request");
  const signature=createHmac("sha256",kSigning).update(stringToSign).digest("hex");
  return `${ep.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

export async function r2Head(key:string){
  const r=await fetch(presignR2("HEAD",key,120),{method:"HEAD",cache:"no-store"});
  if(!r.ok)return null;
  return {size:Number(r.headers.get("content-length")||0),type:r.headers.get("content-type")||""};
}
export async function r2Delete(key:string){
  const r=await fetch(presignR2("DELETE",key,120),{method:"DELETE",cache:"no-store"});
  return r.ok||r.status===404;
}
