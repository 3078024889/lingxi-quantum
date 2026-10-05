import{NextRequest,NextResponse}from"next/server";
import{createClient}from"@/lib/supabase/server";
import{isSameOriginMutation}from"@/lib/sasi/request-security";
import{enforceAbuseGuard}from"@/lib/security/abuse-guard";
import{experienceRegionFromHost,type ExperienceTask}from"@/lib/sasi/experience/free-provider-config";
import{resilientText}from"@/lib/sasi/experience/resilient-text";
export const runtime="nodejs";export const maxDuration=60;
const allowed=new Set<ExperienceTask>(["chat","knowledge","research","website","drama"]);
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_INVALID"},{status:403});
 const body:any=await req.json().catch(()=>({}));const text=String(body.text||"").trim().slice(0,12000);
 if(!text)return NextResponse.json({error:"TEXT_REQUIRED"},{status:400});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({state:"local-only",needsConnection:false},{status:200,headers:{"Cache-Control":"no-store"}});
 const abuse=await enforceAbuseGuard(req,{scope:"sasi-experience-text",userId:user.id,accountLimit:90,ipLimit:240,windowSeconds:3600});
 if(!abuse.ok)return NextResponse.json({state:"busy",needsConnection:false},{status:200,headers:{"Cache-Control":"no-store"}});
 const task=allowed.has(body.task)?body.task as ExperienceTask:"chat";
 const region=experienceRegionFromHost(req.headers.get("host"));
 const out=await resilientText({userId:user.id,region,task,messages:[{role:"user",content:text}],maxOutputTokens:Math.max(256,Math.min(4096,Number(body.maxOutputTokens||1536))),allowConnected:body.allowConnected!==false,sessionKey:String(body.sessionKey||body.projectId||"chat").slice(0,160)});
 if(out.kind==="answer")return NextResponse.json({state:"answer",answer:out.answer,source:out.source,experienceExhausted:out.experienceExhausted},{headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({state:"needs-connection",needsConnection:true,experienceExhausted:out.experienceExhausted},{headers:{"Cache-Control":"no-store"}});
}
