import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {sasiV5CapabilityRegistry,sasiV5NativeModelRegistry} from "@/lib/sasi-v5/registry";
import {visualSemanticJudgeReady} from "@/lib/sasi-v5/visual/semantic-judge";
import {sasiPaidProductionEnabled} from "@/lib/sasi/payment-gate";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const{data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const capabilities=sasiV5CapabilityRegistry(),nativeModels=sasiV5NativeModelRegistry();
 return NextResponse.json({
  version:"5.1-completion",
  principles:{qualityFirst:true,stableFirst:true,outcomePricing:true,algorithmFirst:true,privateContentGlobalTrainingDefault:false,autonomousProductionWrites:false},
  capabilityCount:capabilities.length,stableCapabilityCount:capabilities.filter(x=>x.stage==="stable").length,nativeModelCandidates:nativeModels,
  learningEnabled:process.env.SASI_V5_LEARNING_ENABLED==="true",
  managedVideoReady:sasiPaidProductionEnabled(),
  semanticVisualJudgeReady:visualSemanticJudgeReady(),
  agentRadarConfigured:Boolean((process.env.CRON_SECRET||process.env.SASI_RADAR_CRON_SECRET||"").trim()),
 },{headers:{"Cache-Control":"private, no-store, max-age=0"}});
}
