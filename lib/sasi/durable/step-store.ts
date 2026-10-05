import "server-only";
import{createHash}from"node:crypto";
import{createAdminClient}from"@/lib/supabase/admin";

export class DurableStepBusyError extends Error{
 constructor(public readonly runId:string,public readonly stepId:string){
  super("DURABLE_STEP_IN_PROGRESS");this.name="DurableStepBusyError";
 }
}
function hash(v:unknown){return createHash("sha256").update(JSON.stringify(v)).digest("hex")}

export async function durableStep<T>(input:{
 runId:string;stepId:string;input:unknown;execute:()=>Promise<T>;leaseSeconds?:number;
}):Promise<{value:T;replayed:boolean;attempt:number}>{
 const admin=createAdminClient();
 const inputHash=hash(input.input);
 const{data,error}=await admin.rpc("claim_sasi_durable_step_v140",{
  p_run_id:input.runId,p_step_id:input.stepId,p_input_hash:inputHash,
  p_lease_seconds:Math.max(15,Math.min(120,Number(input.leaseSeconds||45)))
 });
 if(error)throw new Error("DURABLE_STEP_CLAIM_FAILED");
 const claim=(Array.isArray(data)?data[0]:data)||{};
 if(claim.replayed&&claim.state==="succeeded"){
  return{value:claim.output_json as T,replayed:true,attempt:Number(claim.attempt||1)};
 }
 if(!claim.claimed)throw new DurableStepBusyError(input.runId,input.stepId);
 const attempt=Number(claim.attempt||1);
 try{
  const value=await input.execute();
  const complete=await admin.rpc("complete_sasi_durable_step_v140",{
   p_run_id:input.runId,p_step_id:input.stepId,p_input_hash:inputHash,p_output:value??null
  });
  if(complete.error)throw new Error("DURABLE_STEP_COMPLETE_FAILED");
  return{value,replayed:false,attempt};
 }catch(e){
  try{
   await admin.rpc("fail_sasi_durable_step_v140",{
    p_run_id:input.runId,p_step_id:input.stepId,p_input_hash:inputHash,
    p_error_code:e instanceof Error?e.message:"DURABLE_STEP_FAILED"
   });
  }catch{
   // Best-effort failure bookkeeping must never hide the original execution error.
  }
  throw e;
 }
}
