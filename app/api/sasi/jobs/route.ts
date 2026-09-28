import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {sasiPaidProductionEnabled} from "@/lib/sasi/payment-gate";
import {hashSasiPrompt,verifySasiTaskQuote} from "@/lib/sasi/task-quote";
import {dispatchSasiJob,publicSasiJob,type SasiJobRow} from "@/lib/sasi/production";

export const dynamic="force-dynamic";export const runtime="nodejs";export const maxDuration=40;

export async function GET(){
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const{data,error}=await supabase.from("sasi_jobs").select("*").eq("user_id",user.id).order("created_at",{ascending:false}).limit(30);
 if(error)return NextResponse.json({error:"JOB_LIST_FAILED"},{status:503});
 return NextResponse.json({jobs:((data??[]) as SasiJobRow[]).map(publicSasiJob)},{headers:{"Cache-Control":"no-store"}});
}

export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const abuse=await enforceAbuseGuard(request,{scope:"sasi-managed-video-submit",userId:user.id,accountLimit:30,ipLimit:80});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 if(!sasiPaidProductionEnabled())return NextResponse.json({error:"SASI_MANAGED_VIDEO_NOT_READY"},{status:503});
 const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
 if(!body)return NextResponse.json({error:"INVALID_JSON"},{status:400});
 const token=typeof body.quoteToken==="string"?body.quoteToken:"",prompt=typeof body.prompt==="string"?body.prompt.trim():"";
 const requestId=typeof body.requestId==="string"?body.requestId:"";
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))return NextResponse.json({error:"INVALID_IDEMPOTENCY_KEY"},{status:400});
 const quote=verifySasiTaskQuote(token);
 if(!quote||quote.userId!==user.id||quote.expiresAt<=Date.now()||quote.promptHash!==hashSasiPrompt(prompt)){
   return NextResponse.json({error:"QUOTE_INVALID_OR_EXPIRED"},{status:409});
 }
 const admin=createAdminClient();
 const reserved=await admin.rpc("create_and_reserve_sasi_job",{
   p_user_id:user.id,p_request_id:requestId,p_project_id:quote.projectId,p_node_id:quote.nodeId,
   p_provider:quote.provider,p_model:quote.model,p_quoted_points:quote.amountFen,
   p_input:{prompt,duration:quote.duration,aspectRatio:quote.aspectRatio,quality:quote.quality,retailFenPerSecond:quote.retailFenPerSecond,rateVersion:quote.rateVersion,skillId:quote.skillId},
 });
 const state=reserved.data as {ok?:boolean;error?:string;jobId?:string}|null;
 if(reserved.error||!state?.ok||!state.jobId){
   const code=state?.error||"RESERVE_FAILED";
   return NextResponse.json({error:code},{status:code==="insufficient_balance"?402:503});
 }
 const found=await admin.from("sasi_jobs").select("*").eq("id",state.jobId).eq("user_id",user.id).maybeSingle();
 if(found.error||!found.data)return NextResponse.json({error:"JOB_CREATE_FAILED"},{status:503});
 try{
   const job=await dispatchSasiJob(admin,found.data as SasiJobRow);
   return NextResponse.json({job:publicSasiJob(job)},{status:202,headers:{"Cache-Control":"no-store"}});
 }catch(error){
   console.error("[sasi managed video] dispatch failed",error instanceof Error?error.message:"unknown");
   const latest=await admin.from("sasi_jobs").select("*").eq("id",state.jobId).maybeSingle();
   return NextResponse.json({error:"VIDEO_SUBMIT_FAILED",job:latest.data?publicSasiJob(latest.data as SasiJobRow):null},{status:503});
 }
}
