import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";import {isSameOriginMutation} from "@/lib/sasi/request-security";import {enforceAbuseGuard} from "@/lib/security/abuse-guard";import {recordSasiV5Outcome} from "@/lib/sasi-v5/repository";import type {SasiV5OutcomeSignal} from "@/lib/sasi-v5/types";
export const runtime="nodejs";export const dynamic="force-dynamic";
const ALLOWED=new Set<SasiV5OutcomeSignal>(["saved","downloaded","continued","regenerated","abandoned","refunded","explicit-positive","explicit-negative","delivered","failed","repaired","escalated"]);
export async function POST(request:NextRequest){if(!isSameOriginMutation(request))return NextResponse.json({error:"ORIGIN_REJECTED"},{status:403});const{data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});const guard=await enforceAbuseGuard(request,{scope:"sasi-v5-feedback",userId:user.id,accountLimit:240,ipLimit:600});if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status});
 const body=await request.json().catch(()=>null) as Record<string,unknown>|null,signal=String(body?.signal??"") as SasiV5OutcomeSignal,taskFamily=String(body?.taskFamily??"").trim();if(!ALLOWED.has(signal)||!/^[a-z0-9:._-]{2,80}$/i.test(taskFamily))return NextResponse.json({error:"INVALID_FEEDBACK"},{status:400});
 const projectId=typeof body?.projectId==="string"?body.projectId:null;
 if(projectId){
  if(!/^[0-9a-f-]{36}$/i.test(projectId))return NextResponse.json({error:"INVALID_PROJECT"},{status:400});
  const {data:owned,error}=await createClient().from("sasi_projects").select("id").eq("id",projectId).eq("user_id",user.id).maybeSingle();
  if(error||!owned)return NextResponse.json({error:"PROJECT_NOT_FOUND"},{status:404});
 }
 const result=await recordSasiV5Outcome({userId:user.id,taskId:null,projectId:typeof body?.projectId==="string"?body.projectId:null,taskFamily,capability:typeof body?.capability==="string"?body.capability:null,provider:typeof body?.provider==="string"?body.provider:null,model:typeof body?.model==="string"?body.model:null,routeId:typeof body?.routeId==="string"?body.routeId:null,signal,validatorScore:null,metadata:{source:"client-observation"},failureCode:typeof body?.failureCode==="string"?body.failureCode:null});return NextResponse.json({ok:true,recorded:result.recorded})}
