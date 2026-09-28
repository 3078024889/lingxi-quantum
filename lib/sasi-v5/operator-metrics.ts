import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";

async function maybeCount(table:string){
 const {count,error}=await createAdminClient().from(table).select("*",{count:"exact",head:true});
 return error?{available:false,count:null}:{available:true,count:count??0};
}
export async function loadSasiV5OperatorMetrics(){
 const admin=createAdminClient();
 const [routes,signals,agents,models,dna,validations,experiments]=await Promise.all([
   maybeCount("sasi_v5_route_decisions"),maybeCount("sasi_v5_outcome_signals"),maybeCount("sasi_v5_agent_registry"),
   maybeCount("sasi_v5_model_registry"),maybeCount("sasi_v5_project_dna"),maybeCount("sasi_v5_visual_validations"),maybeCount("sasi_v5_experiments"),
 ]);
 let summary:any={};
 const {data,error}=await admin.from("sasi_v5_outcome_signals")
   .select("signal,satisfaction_weight,provider_cost_minor,validator_score,created_at")
   .order("created_at",{ascending:false}).limit(500);
 if(!error&&data){
   const n=data.length||1,positive=data.filter(x=>Number(x.satisfaction_weight)>0).length,negative=data.filter(x=>Number(x.satisfaction_weight)<0).length;
   const scores=data.map(x=>Number(x.validator_score)).filter(Number.isFinite);
   const providerCost=data.reduce((s,x)=>s+(Number(x.provider_cost_minor)||0),0);
   summary={sampleCount:data.length,positiveRate:positive/n,negativeRate:negative/n,averageValidatorScore:scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:null,providerCostMinor:providerCost};
 }
 return{checkedAt:new Date().toISOString(),tables:{routes,signals,agents,models,dna,validations,experiments},summary};
}
