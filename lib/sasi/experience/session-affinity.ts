import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

type Affinity={providerId:string;expiresAt:string};
const mem=new Map<string,Affinity>();
const TTL_MS=30*60_000;

function key(userId:string,sessionKey:string){return `${userId}:${sessionKey}`}

export async function getSessionAffinity(userId:string,sessionKey:string){
 const k=key(userId,sessionKey),m=mem.get(k);
 if(m&&Date.parse(m.expiresAt)>Date.now())return m.providerId;
 try{
  const admin=createAdminClient();
  const {data,error}=await admin.from("sasi_experience_session_affinity")
   .select("provider_id,expires_at").eq("user_id",userId).eq("session_key",sessionKey).maybeSingle();
  if(error||!data||Date.parse(String(data.expires_at))<=Date.now())return null;
  const a={providerId:String(data.provider_id),expiresAt:String(data.expires_at)};mem.set(k,a);return a.providerId;
 }catch{return null}
}

export async function setSessionAffinity(userId:string,sessionKey:string,providerId:string){
 const expiresAt=new Date(Date.now()+TTL_MS).toISOString();mem.set(key(userId,sessionKey),{providerId,expiresAt});
 try{
  const admin=createAdminClient();
  await admin.from("sasi_experience_session_affinity").upsert({
   user_id:userId,session_key:sessionKey,provider_id:providerId,expires_at:expiresAt,updated_at:new Date().toISOString()
  },{onConflict:"user_id,session_key"});
 }catch{}
}
