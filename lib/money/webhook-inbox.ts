import crypto from"crypto";
import{createAdminClient}from"@/lib/supabase/admin";
import{reconcileWithdrawal}from"./reconcile-worker";
import{webhookRetrySeconds}from"./retry-policy";

export type MoneyWebhookProvider="wechat"|"paypal"|"alipay";

export function payloadSha256(raw:string){
 return crypto.createHash("sha256").update(raw,"utf8").digest("hex");
}

export async function enqueueMoneyWebhookEvent(input:{
 provider:MoneyWebhookProvider;
 eventKey:string;
 eventType:string;
 objectKey?:string|null;
 payload:Record<string,unknown>;
 payloadHash:string;
}){
 const admin=createAdminClient();
 const{data,error}=await admin.rpc("money_enqueue_webhook_event_v53",{
  p_provider:input.provider,
  p_event_key:input.eventKey,
  p_event_type:input.eventType,
  p_object_key:input.objectKey||null,
  p_payload:input.payload,
  p_payload_hash:input.payloadHash,
 });
 if(error)throw error;
 if(!data?.ok)throw new Error(String(data?.error||"WEBHOOK_ENQUEUE_FAILED"));
 return data;
}

async function finish(id:string,outcome:"processed"|"retry"|"dead_letter",lastError?:string,retrySeconds?:number){
 const admin=createAdminClient();
 const{error}=await admin.rpc("money_finish_webhook_event_v53",{
  p_id:id,
  p_outcome:outcome,
  p_last_error:lastError||null,
  p_retry_seconds:retrySeconds||300,
 });
 if(error)throw error;
}

async function resolveWithdrawal(provider:string,objectKey:string,payload:any){
 const admin=createAdminClient();
 if(objectKey.startsWith("lf-refund-")){
  const{data}=await admin.from("balance_withdrawals")
   .select("id")
   .eq("provider",provider)
   .eq("provider_request_key",objectKey)
   .maybeSingle();
  return data?.id?String(data.id):"";
 }
 const refundId=String(payload?.providerRefundId||objectKey||"");
 if(!refundId)return"";
 const{data}=await admin.from("balance_withdrawals")
  .select("id")
  .eq("provider",provider)
  .eq("provider_refund_id",refundId)
  .maybeSingle();
 return data?.id?String(data.id):"";
}

export async function processMoneyWebhookInbox(limit=30){
 const admin=createAdminClient();
 const bounded=Math.max(1,Math.min(Number(limit)||30,100));
 const{data,error}=await admin.rpc("money_claim_webhook_events_v53",{
  p_limit:bounded,
  p_lease_seconds:120,
 });
 if(error)throw error;
 const rows=Array.isArray(data)?data:[];
 const results=[];

 for(const row of rows as any[]){
  const id=String(row?.id||"");
  const provider=String(row?.provider||"");
  const objectKey=String(row?.object_key||"");
  const attempt=Number(row?.attempt_count||1);
  try{
   const withdrawalId=await resolveWithdrawal(provider,objectKey,row?.payload||{});
   if(!withdrawalId){
    await finish(id,"dead_letter","WEBHOOK_WITHDRAWAL_NOT_FOUND");
    results.push({id,status:"dead_letter",reason:"WITHDRAWAL_NOT_FOUND"});
    continue;
   }

   const result=await reconcileWithdrawal(withdrawalId);
   await finish(id,"processed");
   results.push({id,status:"processed",withdrawalId,resultStatus:(result as any)?.status||"unknown"});
  }catch(error){
   const message=error instanceof Error?error.message:"WEBHOOK_PROCESSING_FAILED";
   if(attempt>=12){
    await finish(id,"dead_letter",message);
    results.push({id,status:"dead_letter",reason:message});
   }else{
    const retry=webhookRetrySeconds(attempt,`${provider}:${objectKey}:${id}`);
    await finish(id,"retry",message,retry);
    results.push({id,status:"retry",retryAfterSeconds:retry});
   }
  }
 }
 return results;
}
