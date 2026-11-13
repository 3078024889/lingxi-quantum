import "server-only";
import{createHash,randomUUID}from"node:crypto";
import{createAdminClient}from"@/lib/supabase/admin";

export class DurableStepBusyError extends Error{
 constructor(public readonly runId:string,public readonly stepId:string){
  super("DURABLE_STEP_IN_PROGRESS");this.name="DurableStepBusyError";
 }
}
export class DurableStepFenceLostError extends Error{
 constructor(public readonly runId:string,public readonly stepId:string){
  super("DURABLE_STEP_FENCE_LOST");this.name="DurableStepFenceLostError";
 }
}
function hash(v:unknown){return createHash("sha256").update(JSON.stringify(v)).digest("hex")}
function row(v:unknown){return (Array.isArray(v)?v[0]:v)||{} as Record<string,unknown>}
function workerId(){return `${process.env.VERCEL_REGION||"local"}:${process.pid}:${randomUUID().slice(0,8)}`}
function rpcMissing(error:unknown){
 const e=error as {code?:string;message?:string;details?:string}|null;
 const text=`${e?.message||""} ${e?.details||""}`;
 return e?.code==="PGRST202"||/could not find the function|schema cache/i.test(text);
}

export async function durableStep<T>(input:{
 runId:string;stepId:string;input:unknown;execute:()=>Promise<T>;leaseSeconds?:number;
}):Promise<{value:T;replayed:boolean;attempt:number}>{
 const admin=createAdminClient();
 const inputHash=hash(input.input);
 const leaseSeconds=Math.max(15,Math.min(120,Number(input.leaseSeconds||45)));
 const owner=workerId();

 const modern=await admin.rpc("claim_sasi_durable_step_v160",{
  p_run_id:input.runId,p_step_id:input.stepId,p_input_hash:inputHash,
  p_worker_id:owner,p_lease_seconds:leaseSeconds
 });
 let fenced=true,claim:Record<string,unknown>;
 if(modern.error){
  if(!rpcMissing(modern.error))throw new Error("DURABLE_STEP_CLAIM_FAILED");
  fenced=false;
  const legacy=await admin.rpc("claim_sasi_durable_step_v140",{
   p_run_id:input.runId,p_step_id:input.stepId,p_input_hash:inputHash,
   p_lease_seconds:leaseSeconds
  });
  if(legacy.error)throw new Error("DURABLE_STEP_CLAIM_FAILED");
  claim=row(legacy.data);
 }else claim=row(modern.data);

 if(claim.replayed&&claim.state==="succeeded"){
  return{value:claim.output_json as T,replayed:true,attempt:Number(claim.attempt||1)};
 }
 if(!claim.claimed)throw new DurableStepBusyError(input.runId,input.stepId);

 const attempt=Number(claim.attempt||1);
 if(!fenced){
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
   }catch{}
   throw e;
  }
 }

 const fenceToken=Number(claim.fence_token);
 if(!Number.isSafeInteger(fenceToken)||fenceToken<1)throw new Error("DURABLE_STEP_FENCE_INVALID");

 let stopped=false;
 const heartbeat=setInterval(()=>{
  if(stopped)return;
  void (async()=>{
   try{
    await admin.rpc("renew_sasi_durable_step_lease_v160",{
     p_run_id:input.runId,p_step_id:input.stepId,p_input_hash:inputHash,
     p_worker_id:owner,p_fence_token:fenceToken,p_lease_seconds:leaseSeconds
    });
   }catch{}
  })();
 },Math.max(5_000,Math.floor(leaseSeconds*1000/3)));
 heartbeat.unref?.();

 try{
  const value=await input.execute();
  const complete=await admin.rpc("complete_sasi_durable_step_v160",{
   p_run_id:input.runId,p_step_id:input.stepId,p_input_hash:inputHash,
   p_worker_id:owner,p_fence_token:fenceToken,p_output:value??null
  });
  if(complete.error)throw new Error("DURABLE_STEP_COMPLETE_FAILED");
  const completed=row(complete.data);
  if(completed.ok!==true)throw new DurableStepFenceLostError(input.runId,input.stepId);
  return{value,replayed:false,attempt};
 }catch(e){
  try{
   await admin.rpc("fail_sasi_durable_step_v160",{
    p_run_id:input.runId,p_step_id:input.stepId,p_input_hash:inputHash,
    p_worker_id:owner,p_fence_token:fenceToken,
    p_error_code:e instanceof Error?e.message:"DURABLE_STEP_FAILED"
   });
  }catch{}
  throw e;
 }finally{
  stopped=true;clearInterval(heartbeat);
 }
}
