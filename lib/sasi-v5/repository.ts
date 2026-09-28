import "server-only";
import {randomUUID} from "node:crypto";
import {createAdminClient} from "@/lib/supabase/admin";
import {safeOutcomeRecord,satisfactionWeight} from "./learning";
import type {SasiV5OutcomeRecord,SasiV5RouteDecision} from "./types";
const enabled=()=>process.env.SASI_V5_LEARNING_ENABLED==="true";
export async function recordSasiV5Outcome(input:SasiV5OutcomeRecord){
 if(!enabled())return{recorded:false as const,reason:"DISABLED"};const r=safeOutcomeRecord(input);
 try{const{error}=await createAdminClient().from("sasi_v5_outcome_signals").insert({id:randomUUID(),user_id:r.userId,task_id:r.taskId??null,project_id:r.projectId??null,task_family:r.taskFamily,capability:r.capability??null,provider:r.provider??null,model:r.model??null,route_id:r.routeId??null,signal:r.signal,satisfaction_weight:satisfactionWeight(r.signal),latency_ms:r.latencyMs??null,provider_cost_minor:r.providerCostMinor??null,provider_cost_currency:r.providerCostCurrency??null,attempt_count:r.attemptCount??null,validator_score:r.validatorScore??null,failure_code:r.failureCode??null,metadata:r.metadata??{}});if(error)throw error;return{recorded:true as const}}catch(error){console.error("[sasi-v5] outcome telemetry unavailable",error instanceof Error?error.message:"unknown");return{recorded:false as const,reason:"UNAVAILABLE"}}
}
export async function recordSasiV5Route(i:{userId:string;taskId?:string|null;projectId?:string|null;taskFamily:string;capability:string;decision:SasiV5RouteDecision}){
 if(!enabled())return{recorded:false as const,reason:"DISABLED"};
 try{const{error}=await createAdminClient().from("sasi_v5_route_decisions").insert({id:randomUUID(),user_id:i.userId,task_id:i.taskId??null,project_id:i.projectId??null,task_family:i.taskFamily.slice(0,80),capability:i.capability.slice(0,120),quality_tier:i.decision.qualityTier,selected_route_id:i.decision.selected?.id??null,quoted_price_fen:i.decision.quotedPriceFen,expected_delivery_cost_fen:i.decision.expectedDeliveryCostFen,expected_margin:i.decision.expectedMargin,rejected:i.decision.rejected,selected_snapshot:i.decision.selected??{}});if(error)throw error;return{recorded:true as const}}catch(error){console.error("[sasi-v5] route telemetry unavailable",error instanceof Error?error.message:"unknown");return{recorded:false as const,reason:"UNAVAILABLE"}}
}
