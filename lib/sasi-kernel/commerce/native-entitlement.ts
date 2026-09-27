import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";
import {recoverToolQuotePayment} from "@/lib/tools/payment-recovery";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type NativePaidKind="reason"|"image"|"video";

export function paidToolForNativeKind(kind:NativePaidKind){
  return kind==="reason"?"sasi-deep-reason":kind==="image"?"sasi-image-generate":"sasi-video-generate";
}

export async function claimNativePaidExecution(input:{userId:string;quoteId:string;kind:NativePaidKind;}){
  if(!UUID.test(input.quoteId))return{ok:false as const,error:"PAYMENT_REQUIRED"};
  const expected=paidToolForNativeKind(input.kind);
  const payment=await recoverToolQuotePayment({userId:input.userId,quoteId:input.quoteId});
  if(!payment.ok||!payment.paid||payment.quote?.toolId!==expected)return{ok:false as const,error:"PAYMENT_REQUIRED"};

  const admin=createAdminClient();
  const {data:existing}=await admin.from("sasi_native_entitlements")
    .select("quote_id,user_id,kind,worker_job_id,state").eq("quote_id",input.quoteId).maybeSingle();

  if(existing){
    if(existing.user_id!==input.userId||existing.kind!==input.kind)return{ok:false as const,error:"PAYMENT_ALREADY_USED"};
    if(existing.worker_job_id)return{ok:true as const,reused:true as const,workerJobId:String(existing.worker_job_id)};
    if(existing.state==="failed"||existing.state==="reserved"){
      const {error}=await admin.from("sasi_native_entitlements")
        .update({state:"reserved",worker_job_id:null,updated_at:new Date().toISOString()})
        .eq("quote_id",input.quoteId).eq("user_id",input.userId);
      if(error)return{ok:false as const,error:"PAYMENT_CLAIM_FAILED"};
      return{ok:true as const,reused:true as const,workerJobId:null};
    }
    return{ok:false as const,error:"PAYMENT_ALREADY_USED"};
  }

  const {error}=await admin.from("sasi_native_entitlements").insert({
    quote_id:input.quoteId,user_id:input.userId,kind:input.kind,state:"reserved",
  });
  if(error){
    const {data:race}=await admin.from("sasi_native_entitlements")
      .select("user_id,kind,worker_job_id,state").eq("quote_id",input.quoteId).maybeSingle();
    if(race?.user_id===input.userId&&race?.kind===input.kind)
      return{ok:true as const,reused:true as const,workerJobId:race.worker_job_id?String(race.worker_job_id):null};
    return{ok:false as const,error:"PAYMENT_CLAIM_FAILED"};
  }
  return{ok:true as const,reused:false as const,workerJobId:null};
}

export async function bindNativeWorkerJob(input:{quoteId:string;userId:string;workerJobId:string}){
  const admin=createAdminClient();
  const {data,error}=await admin.from("sasi_native_entitlements")
    .update({worker_job_id:input.workerJobId,state:"submitted",updated_at:new Date().toISOString()})
    .eq("quote_id",input.quoteId).eq("user_id",input.userId).eq("state","reserved")
    .select("quote_id").maybeSingle();
  if(error||!data)throw new Error("ENTITLEMENT_BIND_FAILED");
}

export async function markNativeEntitlementFailed(input:{quoteId:string;userId:string}){
  const admin=createAdminClient();
  await admin.from("sasi_native_entitlements")
    .update({state:"failed",worker_job_id:null,updated_at:new Date().toISOString()})
    .eq("quote_id",input.quoteId).eq("user_id",input.userId);
}

export async function syncNativeEntitlementState(input:{userId:string;workerJobId:string;state:string}){
  const mapped=input.state==="succeeded"?"completed":input.state==="failed"||input.state==="cancelled"?"failed":input.state==="running"||input.state==="queued"?"submitted":null;
  if(!mapped)return;
  const admin=createAdminClient();
  await admin.from("sasi_native_entitlements")
    .update({state:mapped,updated_at:new Date().toISOString()})
    .eq("user_id",input.userId).eq("worker_job_id",input.workerJobId);
}
