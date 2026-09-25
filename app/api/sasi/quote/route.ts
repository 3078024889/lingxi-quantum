import {loadProjectMemory,applyProjectMemory} from "@/lib/sasi/load-project-memory";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {type SasiQuality} from "@/lib/sasi/catalog";
import {selectSasiVideoProvider,type SasiVideoProviderId} from "@/lib/sasi/provider";
import {quoteVideoTask} from "@/lib/sasi/video-pricing";
import {reviewSasiProductionInput} from "@/lib/sasi/safety";
import {hashSasiPrompt,signSasiTaskQuote} from "@/lib/sasi/task-quote";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {normalizeSkillSelection,resolveSasiSkill} from "@/lib/sasi/skill-runtime";

export const runtime="nodejs";export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request:NextRequest){
  if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  const abuse=await enforceAbuseGuard(request,{scope:"sasi-quote",userId:user.id,accountLimit:120,ipLimit:300});
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
  const contentLength=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(contentLength)&&contentLength>64*1024)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});
  let body:Record<string,unknown>;try{body=await request.json()}catch{return NextResponse.json({error:"INVALID_JSON"},{status:400})}
  const projectId=typeof body.projectId==="string"?body.projectId:"",nodeId=typeof body.nodeId==="string"?body.nodeId:null,prompt=typeof body.prompt==="string"?body.prompt.trim():"";
  const duration=Math.round(Number(body.duration));
  const quality:SasiQuality=body.quality==="cinema"||body.quality==="balanced"?body.quality:"fast";
  const aspectRatio=body.aspectRatio==="9:16"||body.aspectRatio==="1:1"?body.aspectRatio:"16:9";
  const preferredProvider:SasiVideoProviderId|null=body.providerPreference==="seedance"||body.providerPreference==="xai"||body.providerPreference==="openai"||body.providerPreference==="wan"?body.providerPreference:null;
  const skillSelection=normalizeSkillSelection(body.skillSource??"platform",body.skillId??"story-rhythm");
  if(!skillSelection)return NextResponse.json({error:"INVALID_SKILL_SELECTION"},{status:400});
  if(!UUID.test(projectId)||(nodeId&&!UUID.test(nodeId)))return NextResponse.json({error:"INVALID_PROJECT_REFERENCE"},{status:400});
  if(prompt.length<8||prompt.length>4000||duration<5||duration>600)return NextResponse.json({error:"INVALID_TASK_SPEC"},{status:400});
  const safety=reviewSasiProductionInput({prompt,rightsConfirmed:body.rightsConfirmed,aiLabelAcknowledged:body.aiLabelAcknowledged});
  if(!safety.ok)return NextResponse.json({error:safety.error},{status:422});
  const[{data:project},nodeResult]=await Promise.all([
    supabase.from("sasi_projects").select("id").eq("id",projectId).eq("user_id",user.id).maybeSingle(),
    nodeId?supabase.from("sasi_nodes").select("id").eq("id",nodeId).eq("project_id",projectId).eq("user_id",user.id).maybeSingle():Promise.resolve({data:null}),
  ]);
  if(!project||(nodeId&&!nodeResult.data))return NextResponse.json({error:"PROJECT_NOT_FOUND"},{status:404});
  const admin=createAdminClient(),skill=await resolveSasiSkill(admin,user.id,skillSelection);
  if(!skill)return NextResponse.json({error:"SKILL_NOT_FOUND"},{status:404});
  const selection=selectSasiVideoProvider({quality,duration,aspectRatio,preferredProvider});
  if(!selection)return NextResponse.json({error:"NO_VERIFIED_PROVIDER_FOR_FORMAT"},{status:503});
  let quote;try{quote=quoteVideoTask(selection,duration,Date.now(),skill.source)}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"TASK_PRICING_UNAVAILABLE"},{status:503})}
  let memory;try{memory=await loadProjectMemory(supabase,user.id,projectId);applyProjectMemory(prompt,memory.active)}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"MEMORY_READ_FAILED"},{status:422})}
  const token=signSasiTaskQuote({userId:user.id,projectId,nodeId,promptHash:hashSasiPrompt(prompt),duration,quality,aspectRatio,provider:selection.provider,model:selection.model,amountFen:quote.amountFen,amountUsdCents:quote.amountUsdCents,rateVersion:quote.rateVersion,retailFenPerSecond:quote.retailFenPerSecond,skillSource:skill.source,skillId:skill.id,memoryVersion:memory.version,expiresAt:quote.expiresAt});
  return NextResponse.json({quote:{amountFen:quote.amountFen,amountRmb:(quote.amountFen/100).toFixed(2),amountUsd:(quote.amountUsdCents/100).toFixed(2),amountUsdCents:quote.amountUsdCents,skillSource:skill.source,skillId:skill.id,skillTitle:skill.titleZh,expiresAt:new Date(quote.expiresAt).toISOString(),token}},{headers:{"Cache-Control":"no-store"}});
}
