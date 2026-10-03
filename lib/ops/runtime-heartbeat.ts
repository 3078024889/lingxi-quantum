import{createAdminClient}from"@/lib/supabase/admin";
import{redactOperationalError}from"@/lib/security/redact-operational-error";

type HeartbeatMetadata=Record<string,string|number|boolean|null>;

async function writeHeartbeat(key:string,patch:Record<string,unknown>){
 try{
  const admin=createAdminClient();
  const{data:existing}=await admin.from("ops_runtime_heartbeats")
   .select("metadata")
   .eq("key",key)
   .maybeSingle();
  const metadata={
   ...((existing?.metadata&&typeof existing.metadata==="object")?existing.metadata:{}),
   ...((patch.metadata&&typeof patch.metadata==="object")?patch.metadata:{}),
  };
  const{error}=await admin.from("ops_runtime_heartbeats").upsert({
   key,
   ...patch,
   metadata,
   updated_at:new Date().toISOString(),
  },{onConflict:"key"});
  if(error)console.warn("[ops-heartbeat] write failed",error.code||"UNKNOWN");
 }catch(error){
  console.warn("[ops-heartbeat] unavailable",redactOperationalError(error));
 }
}

export async function markRuntimeStarted(key:string,metadata:HeartbeatMetadata={}){
 const now=new Date().toISOString();
 await writeHeartbeat(key,{last_started_at:now,metadata});
}
export async function markRuntimeSucceeded(key:string,metadata:HeartbeatMetadata={}){
 const now=new Date().toISOString();
 await writeHeartbeat(key,{last_succeeded_at:now,last_error:null,metadata});
}
export async function markRuntimeFailed(key:string,error:unknown,metadata:HeartbeatMetadata={}){
 const now=new Date().toISOString();
 await writeHeartbeat(key,{last_failed_at:now,last_error:redactOperationalError(error),metadata});
}
