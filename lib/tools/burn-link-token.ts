import "server-only";
import {createHmac,timingSafeEqual} from "node:crypto";

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
