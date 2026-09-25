import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type PaidJobClaim = {
  ok: boolean;
  jobId?: string;
  status?: "processing" | "completed" | "failed";
  existing?: boolean;
  retry?: boolean;
  result?: unknown;
  providerRef?: string | null;
  error?: string;
};

const STALE_PROCESSING_MS = 15 * 60 * 1000;

async function rawClaim(input:{
  quoteId:string;
  userId:string;
  toolId:string;
  itemKey:string;
  units:number;
}){
  const admin=createAdminClient();
  const {data,error}=await admin.rpc("claim_tool_paid_job",{
    p_quote_id:input.quoteId,
    p_user_id:input.userId,
    p_tool_id:input.toolId,
    p_item_key:input.itemKey,
    p_units:input.units,
  });
  if(error){
    console.error("[paid job] claim rpc failed",error);
    return {data:null as unknown,error};
  }
  return {data:(data||{}) as Record<string,unknown>,error:null};
}

function normalizeClaim(d:Record<string,unknown>):PaidJobClaim{
  return {
    ok:d.ok===true,
    jobId:typeof d.job_id==="string"?d.job_id:undefined,
    status:typeof d.status==="string"?d.status as PaidJobClaim["status"]:undefined,
    existing:d.existing===true,
    retry:d.retry===true,
    result:d.result,
    providerRef:typeof d.provider_ref==="string"?d.provider_ref:null,
    error:typeof d.error==="string"?d.error:undefined,
  };
}

export async function claimPaidToolJob(input:{
  quoteId:string;
  userId:string;
  toolId:string;
  itemKey:string;
  units:number;
}):Promise<PaidJobClaim>{
  let attempt=await rawClaim(input);
  if(attempt.error)return {ok:false,error:"PAID_JOB_CLAIM_FAILED"};
  let claim=normalizeClaim(attempt.data as Record<string,unknown>);

  // A second request for the same item while the first provider call is still running
  // must not launch another paid provider call. A genuinely abandoned job becomes
  // retryable after a bounded stale window.
  if(claim.ok&&claim.existing&&claim.status==="processing"&&claim.jobId){
    const admin=createAdminClient();
    const {data:row,error}=await admin.from("tool_paid_jobs")
      .select("id,user_id,status,updated_at")
      .eq("id",claim.jobId)
      .eq("user_id",input.userId)
      .maybeSingle();

    if(error||!row)return {ok:false,error:"PAID_JOB_OWNERSHIP_CHECK_FAILED"};
    const updated=Date.parse(String(row.updated_at||""));
    const stale=Number.isFinite(updated)&&Date.now()-updated>STALE_PROCESSING_MS;

    if(!stale){
      return {
        ok:false,
        error:"JOB_ALREADY_PROCESSING",
        jobId:claim.jobId,
        status:"processing",
        existing:true,
      };
    }

    const failed=await admin.rpc("fail_tool_paid_job",{
      p_job_id:claim.jobId,
      p_error:"STALE_PROCESSING_RETRY",
    });
    if(failed.error){
      console.error("[paid job] stale reset failed",{jobId:claim.jobId,error:failed.error});
      return {ok:false,error:"PAID_JOB_STALE_RESET_FAILED"};
    }

    attempt=await rawClaim(input);
    if(attempt.error)return {ok:false,error:"PAID_JOB_CLAIM_FAILED"};
    claim=normalizeClaim(attempt.data as Record<string,unknown>);
  }

  return claim;
}

export async function completePaidToolJob(jobId:string,result:unknown,providerRef?:string|null){
  const admin=createAdminClient();
  const {error}=await admin.rpc("complete_tool_paid_job",{
    p_job_id:jobId,
    p_result:result ?? {},
    p_provider_ref:providerRef ?? null,
  });
  if(error){
    console.error("[paid job] complete rpc failed",{jobId,error});
    return {ok:false as const,error:"PAID_JOB_COMPLETE_FAILED"};
  }
  return {ok:true as const};
}

export async function failPaidToolJob(jobId:string,errorMessage:string){
  const admin=createAdminClient();
  const {error}=await admin.rpc("fail_tool_paid_job",{
    p_job_id:jobId,
    p_error:errorMessage,
  });
  if(error){
    console.error("[paid job] fail rpc failed",{jobId,error});
    return {ok:false as const,error:"PAID_JOB_FAIL_UPDATE_FAILED"};
  }
  return {ok:true as const};
}

export async function getOwnedPaidJob(input:{userId:string;quoteId:string;providerRef?:string}){
  const admin=createAdminClient();
  let q=admin.from("tool_paid_jobs")
    .select("id,tool_id,item_key,units,status,provider_ref,result,error,quote_id")
    .eq("user_id",input.userId)
    .eq("quote_id",input.quoteId);
  if(input.providerRef) q=q.eq("provider_ref",input.providerRef);
  const {data,error}=await q.order("created_at",{ascending:false}).limit(1).maybeSingle();
  if(error) return null;
  return data;
}

export async function getOwnedPaidJobById(input:{userId:string;jobId:string}){
  const admin=createAdminClient();
  const {data,error}=await admin.from("tool_paid_jobs")
    .select("id,user_id,quote_id,tool_id,item_key,units,status,updated_at")
    .eq("id",input.jobId)
    .eq("user_id",input.userId)
    .maybeSingle();
  if(error)return null;
  return data;
}
