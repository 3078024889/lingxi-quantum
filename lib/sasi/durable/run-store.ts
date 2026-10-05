import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

export type DurableRunState="created"|"running"|"waiting"|"succeeded"|"failed"|"cancelled";
export type DurableRun={
 id:string;userId:string;sessionKey:string;task:string;state:DurableRunState;
 currentStep:string|null;attempt:number;inputHash:string;output:unknown;errorCode:string|null;
};

export async function beginDurableRun(input:{
 userId:string;sessionKey:string;task:string;inputHash:string;idempotencyKey:string;
}):Promise<DurableRun>{
 const admin=createAdminClient();
 const {data,error}=await admin.rpc("begin_sasi_durable_run_v110",{
  p_user_id:input.userId,p_session_key:input.sessionKey,p_task:input.task,
  p_input_hash:input.inputHash,p_idempotency_key:input.idempotencyKey
 });
 if(error)throw new Error("DURABLE_RUN_BEGIN_FAILED");
 const r=(Array.isArray(data)?data[0]:data)||{};
 return {
  id:String(r.id),userId:input.userId,sessionKey:input.sessionKey,task:input.task,
  state:String(r.state||"created") as DurableRunState,currentStep:r.current_step?String(r.current_step):null,
  attempt:Number(r.attempt||0),inputHash:input.inputHash,output:r.output_json??null,errorCode:r.error_code?String(r.error_code):null
 };
}

export async function checkpointRun(input:{
 runId:string;step:string;state:DurableRunState;payload?:unknown;errorCode?:string|null;
}){
 const admin=createAdminClient();
 const {error}=await admin.rpc("checkpoint_sasi_durable_run_v110",{
  p_run_id:input.runId,p_step:input.step,p_state:input.state,
  p_payload:input.payload??null,p_error_code:input.errorCode??null
 });
 if(error)throw new Error("DURABLE_RUN_CHECKPOINT_FAILED");
}

export async function appendRunEvent(input:{
 runId:string;kind:string;step?:string|null;providerId?:string|null;latencyMs?:number|null;
 metadata?:Record<string,unknown>;
}){
 try{
  const admin=createAdminClient();
  await admin.from("sasi_durable_run_events").insert({
   run_id:input.runId,kind:input.kind,step:input.step??null,provider_id:input.providerId??null,
   latency_ms:input.latencyMs??null,metadata:input.metadata??{}
  });
 }catch{}
}
