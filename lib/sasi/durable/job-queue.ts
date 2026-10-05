import "server-only";
import{randomUUID}from"node:crypto";
import{createAdminClient}from"@/lib/supabase/admin";

export type DurableJob={
 id:string;runId:string;userId:string;jobKind:string;workflowVersion:string;
 payload:Record<string,unknown>;attempt:number;maxAttempts:number;
};

function row(v:unknown){return (Array.isArray(v)?v[0]:v)||{} as Record<string,unknown>}

export async function enqueueDurableJob(input:{
 runId:string;userId:string;jobKind:string;workflowVersion:string;payload:Record<string,unknown>;
 priority?:number;maxAttempts?:number;deadlineAt?:string|null;
}){
 const admin=createAdminClient();
 const{data,error}=await admin.rpc("enqueue_sasi_durable_job_v150",{
  p_run_id:input.runId,p_user_id:input.userId,p_job_kind:input.jobKind,
  p_workflow_version:input.workflowVersion,p_payload:input.payload,
  p_priority:Math.max(0,Math.min(9,Number(input.priority||0))),
  p_max_attempts:Math.max(1,Math.min(12,Number(input.maxAttempts||4))),
  p_deadline_at:input.deadlineAt??null
 });
 if(error)throw new Error("DURABLE_JOB_ENQUEUE_FAILED");
 const r=row(data);if(r.ok===false)throw new Error(String(r.error||"DURABLE_JOB_ENQUEUE_FAILED"));
 return{jobId:String(r.id),state:String(r.state||"queued"),attempt:Number(r.attempt||0)};
}

export async function claimDurableJob(workerId:string,leaseSeconds=75):Promise<DurableJob|null>{
 const admin=createAdminClient();
 const{data,error}=await admin.rpc("claim_sasi_durable_job_v150",{
  p_worker_id:workerId,p_lease_seconds:leaseSeconds
 });
 if(error)throw new Error("DURABLE_JOB_CLAIM_FAILED");
 const r=row(data);if(!r.claimed)return null;
 return{
  id:String(r.id),runId:String(r.run_id),userId:String(r.user_id),
  jobKind:String(r.job_kind),workflowVersion:String(r.workflow_version),
  payload:(r.payload_json&&typeof r.payload_json==="object"?r.payload_json:{}) as Record<string,unknown>,
  attempt:Number(r.attempt||1),maxAttempts:Number(r.max_attempts||4)
 };
}

export async function renewDurableJob(jobId:string,workerId:string,leaseSeconds=75){
 const admin=createAdminClient();
 const{data,error}=await admin.rpc("renew_sasi_durable_job_lease_v150",{
  p_job_id:jobId,p_worker_id:workerId,p_lease_seconds:leaseSeconds
 });
 if(error)return false;const r=row(data);return r.ok===true;
}
export async function completeDurableJob(jobId:string,workerId:string){
 const admin=createAdminClient();
 const{data,error}=await admin.rpc("complete_sasi_durable_job_v150",{p_job_id:jobId,p_worker_id:workerId});
 if(error)throw new Error("DURABLE_JOB_COMPLETE_FAILED");const r=row(data);
 if(r.ok!==true)throw new Error(String(r.error||"DURABLE_JOB_COMPLETE_FAILED"));
}
export async function failDurableJob(jobId:string,workerId:string,errorCode:string,retryable:boolean){
 const admin=createAdminClient();
 const{data,error}=await admin.rpc("fail_sasi_durable_job_v150",{
  p_job_id:jobId,p_worker_id:workerId,p_error_code:errorCode.slice(0,160),p_retryable:retryable
 });
 if(error)throw new Error("DURABLE_JOB_FAIL_RECORD_FAILED");return row(data);
}
export function createWorkerId(){
 return `${process.env.VERCEL_REGION||"local"}:${process.pid}:${randomUUID().slice(0,8)}`;
}
