import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { actualChargeFen,estimateMaxRetailFen,runText,TaskKind,Intelligence } from "@/lib/ai/provider-router";

export async function runBilledText(input:{userId:string;taskKind:TaskKind;intelligence:Intelligence;prompt:string}){
 const admin=createAdminClient(),requestId=crypto.randomUUID();
 const estimate=estimateMaxRetailFen(input.prompt.length,input.taskKind,input.intelligence);
 const reserve=await admin.rpc("reserve_ai_funds",{
  p_user_id:input.userId,p_request_id:requestId,p_task_kind:input.taskKind,
  p_intelligence:input.intelligence,p_max_fen:estimate.reserveFen
 });
 const d=reserve.data as any;
 if(reserve.error||!d?.ok){const e=new Error(d?.error||"RESERVE_FAILED") as Error&{details?:unknown};e.details=d;throw e}
 try{
  const result=await runText(input.prompt,input.taskKind,input.intelligence,estimate.maxOutputTokens);
  const pricing=actualChargeFen(result.pricing,result.usage,input.intelligence);
  const chargeFen=Math.min(estimate.reserveFen,pricing.chargeFen);
  const settled=await admin.rpc("settle_ai_funds",{
   p_user_id:input.userId,p_request_id:requestId,p_charge_fen:chargeFen,
   p_provider:result.provider,p_model:result.model,p_provider_cost_fen:pricing.providerCostFen,
   p_input_tokens:result.usage.inputTokens,p_output_tokens:result.usage.outputTokens,p_cached_tokens:result.usage.cachedTokens
  });
  const settlement=(settled.data||null) as {ok?:boolean;error?:string}|null;
  if(settled.error||!settlement?.ok){
   console.error("[ai billing settle]",{
    requestId,
    rpcError:settled.error?.message||null,
    resultError:settlement?.error||null,
   });
   throw new Error(settlement?.error||"AI_SETTLEMENT_FAILED");
  }
  return {...result,chargeFen,providerCostFen:pricing.providerCostFen,requestId};
 }catch(error){
  await admin.rpc("release_ai_funds",{p_user_id:input.userId,p_request_id:requestId,p_error_code:error instanceof Error?error.message:"FAILED"});
  throw error;
 }
}
