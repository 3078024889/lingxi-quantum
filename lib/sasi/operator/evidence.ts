import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
async function recent(table:string,columns:string){ const admin=createAdminClient(); const {data,error}=await admin.from(table).select(columns).order("created_at",{ascending:false}).limit(20); return {table,available:!error,rows:error?[]:data??[],errorCode:error?.code??null}; }
export async function loadSasiOperatorEvidence(){
 const [learningEvents,feedback,externalWork,candidateCompetitions,promotions,rollbacks]=await Promise.all([
  recent("sasi_runtime_learning_events","id,user_id,event_kind,scope,mode,intelligence,created_at"),
  recent("sasi_user_learning_feedback","id,user_id,learning_event_id,signal,created_at,updated_at"),
  recent("sasi_external_work_queue","id,user_id,intent,state,provider,model,charged_fen,created_at"),
  recent("sasi_candidate_competitions","id,evolution_cycle_id,baseline_candidate_id,candidate_ids,decision,tested_head_sha,created_at"),
  recent("sasi_promotion_snapshots","id,evolution_cycle_id,strategy_id,repository_head_sha,benchmark_evidence_id,state,promoted_at"),
  recent("sasi_rollback_plans","id,from_snapshot_id,to_snapshot_id,reason_codes,requires_human_approval,state,created_at")
 ]);
 return {learningEvents,feedback,externalWork,candidateCompetitions,promotions,rollbacks,loadedAt:new Date().toISOString()};
}
