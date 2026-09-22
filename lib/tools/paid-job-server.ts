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

export async function claimPaidToolJob(input:{
  quoteId:string;
  userId:string;
  toolId:string;
  itemKey:string;
  units:number;
}):Promise<PaidJobClaim>{
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
    return {ok:false,error:"PAID_JOB_CLAIM_FAILED"};
  }
  const d=(data||{}) as Record<string,unknown>;
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

export async function completePaidToolJob(jobId:string,result:unknown,providerRef?:string|null){
  const admin=createAdminClient();
  const {error}=await admin.rpc("complete_tool_paid_job",{
    p_job_id:jobId,
    p_result:result ?? {},
    p_provider_ref:providerRef ?? null,
  });
  if(error) console.error("[paid job] complete rpc failed",{jobId,error});
}

export async function failPaidToolJob(jobId:string,errorMessage:string){
  const admin=createAdminClient();
  const {error}=await admin.rpc("fail_tool_paid_job",{
    p_job_id:jobId,
    p_error:errorMessage,
  });
  if(error) console.error("[paid job] fail rpc failed",{jobId,error});
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
