import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

export async function recordIntelligenceRun(input:{
  userId:string;taskId?:string|null;capability:"text"|"image"|"video"|"audio";provider:string;model?:string|null;connectionId?:string|null;
  status:"succeeded"|"failed"|"uncertain";latencyMs?:number|null;inputTokens?:number|null;outputTokens?:number|null;errorCode?:string|null;
}){
  try{
    await createAdminClient().from("sasi_intelligence_runs").insert({
      user_id:input.userId,task_id:input.taskId||null,capability:input.capability,provider:input.provider,model_id:input.model||null,
      connection_id:input.connectionId||null,status:input.status,latency_ms:Number.isFinite(input.latencyMs)?Math.max(0,Math.round(Number(input.latencyMs))):null,
      input_tokens:Number.isFinite(input.inputTokens)?Math.max(0,Math.round(Number(input.inputTokens))):null,
      output_tokens:Number.isFinite(input.outputTokens)?Math.max(0,Math.round(Number(input.outputTokens))):null,error_code:input.errorCode?.slice(0,120)||null,
    });
  }catch{
    // Observability must never block the user's result.
  }
}
