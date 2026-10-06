import{NextRequest,NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{enforceAbuseGuard}from"@/lib/security/abuse-guard";
import{experienceRegionFromHost,type ExperienceTask}from"@/lib/sasi/experience/free-provider-config";
import{resilientText}from"@/lib/sasi/experience/resilient-text";
import {compileSasiSkillGuidance,validateSasiSkillIds} from "@/lib/sasi/skills/router";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
export const runtime="nodejs";export const maxDuration=60;
const allowed=new Set<ExperienceTask>(["chat","knowledge","research","website","drama"]);
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_INVALID"},{status:403});
 let body:any;try{body=await boundedRequestJson(req,96*1024)}catch{return NextResponse.json({error:"REQUEST_INVALID"},{status:400})}const text=String(body?.text||"").trim().slice(0,12000);
 if(!text)return NextResponse.json({error:"TEXT_REQUIRED"},{status:400});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({state:"local-only",needsConnection:false},{status:200,headers:{"Cache-Control":"no-store"}});
 const abuse=await enforceAbuseGuard(req,{scope:"sasi-experience-text",userId:user.id,accountLimit:90,ipLimit:240,windowSeconds:3600});
 if(!abuse.ok)return NextResponse.json({state:"busy",needsConnection:false},{status:200,headers:{"Cache-Control":"no-store"}});
 const task=allowed.has(body.task)?body.task as ExperienceTask:"chat";
 const region=experienceRegionFromHost(req.headers.get("host"));
 const skillMode=task==="drama"?"drama":task==="website"?"website":task==="research"?"research":"book";
 const instructions=compileSasiSkillGuidance(validateSasiSkillIds(body.skillIds,skillMode));
 const system=task==="drama"?"Prepare a short-video production plan in the user's language: story, characters, shot sequence, visual references, dialogue, audio and continuity checks. Do not claim to have generated or saved a video.\n"+instructions:instructions;
 const tokens=Number(body.maxOutputTokens||1536);
 const out=await resilientText({userId:user.id,region,task,messages:[{role:"system",content:system},{role:"user",content:text}],maxOutputTokens:Number.isFinite(tokens)?Math.max(256,Math.min(4096,tokens)):1536,allowConnected:body.allowConnected===true&&body.acceptConnectedBilling===true,sessionKey:String(body.sessionKey||body.projectId||"chat").slice(0,160)});
 if(out.kind==="answer")return NextResponse.json({state:"answer",answer:out.answer,source:out.source,experienceExhausted:out.experienceExhausted},{headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({state:"needs-connection",needsConnection:true,experienceExhausted:out.experienceExhausted},{headers:{"Cache-Control":"no-store"}});
}
