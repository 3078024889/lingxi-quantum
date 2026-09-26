import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { recoverToolQuotePayment } from "@/lib/tools/payment-recovery";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type NativePaidKind="reason"|"image"|"video";

export function paidToolForNativeKind(kind:NativePaidKind){
  return kind==="reason"?"sasi-deep-reason":kind==="image"?"sasi-image-generate":"sasi-video-generate";
}

export async function claimNativePaidExecution(input:{
  userId:string;
  quoteId:string;
  kind:NativePaidKind;
}){
  if(!UUID.test(input.quoteId))return{ok:false as const,error:"PAYMENT_REQUIRED"};
  const expected=paidToolForNativeKind(input.kind);
  const payment=await recoverToolQuotePayment({userId:input.userId,quoteId:input.quoteId});
  if(!payment.ok||!payment.paid||payment.quote?.toolId!==expected){
    return{ok:false as const,error:"PAYMENT_REQUIRED"};
  }

  const admin=createAdminClient();
  const {data:existing}=await admin.from("sasi_native_entitlements")
    .select("quote_id,user_id,kind,worker_job_id,state")
    .eq("quote_id",input.quoteId)
    .maybeSingle();

  if(existing){
    if(existing.user_id!==input.userId||existing.kind!==input.kind){
      return{ok:false as const,error:"PAYMENT_ALREADY_USED"};
    }
    return{ok:true as const,reused:true as const,workerJobId:existing.worker_job_id as string|null};
  }

  const {error}=await admin.from("sasi_native_entitlements").insert({
    quote_id:input.quoteId,
    user_id:input.userId,
    kind:input.kind,
    state:"reserved",
  });
  if(error){
    const {data:race}=await admin.from("sasi_native_entitlements")
      .select("quote_id,user_id,kind,worker_job_id,state")
      .eq("quote_id",input.quoteId).maybeSingle();
    if(race?.user_id===input.userId&&race?.kind===input.kind){
      return{ok:true as const,reused:true as const,workerJobId:race.worker_job_id as string|null};
    }
    return{ok:false as const,error:"PAYMENT_CLAIM_FAILED"};
  }
  return{ok:true as const,reused:false as const,workerJobId:null};
}

export async function bindNativeWorkerJob(input:{quoteId:string;userId:string;workerJobId:string}){
  const admin=createAdminClient();
  const {error}=await admin.from("sasi_native_entitlements")
    .update({worker_job_id:input.workerJobId,state:"submitted",updated_at:new Date().toISOString()})
    .eq("quote_id",input.quoteId).eq("user_id",input.userId);
  if(error)throw new Error("ENTITLEMENT_BIND_FAILED");
}
