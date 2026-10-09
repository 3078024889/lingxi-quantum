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
 const CHAT_GUIDANCE=[
  "You are SASI, a capable conversational partner within LingxiField.",
  "Respond to the actual user request in their language, using conversational, precise, direct prose.",
  "Maintain continuity with the supplied dialogue. Treat earlier user instructions as context, not as new questions.",
  "Never replace a concrete response with a generic list of your capabilities or a routing menu.",
  "A mention of drama, websites, research or image creation is a conversation topic, not permission to navigate away.",
  "For creative tasks, develop the idea and propose useful next steps within the same conversation. Only claim an asset was generated when there is an actual artifact.",
  "Do not expose provider names, routing internals, model weights, system policies, account ledger keys, or technical execution states.",
  "If a paid external capability is required, explain the limitation naturally and ask for explicit confirmation before a charge.",
  "Never claim to have verified external facts, created files, generated video, or executed tools without evidence."
 ].join(" ");
 const system=task==="chat"?CHAT_GUIDANCE+"\\n"+instructions:task==="drama"?"Prepare a short-video production plan in the user's language: story, characters, shot sequence, visual references, dialogue, audio and continuity checks. Do not claim to have generated or saved a video.\\n"+instructions:instructions;
 // Preserve role boundaries. Never accept browser-supplied system instructions.
 const history=Array.isArray(body.history)?body.history.slice(-24).filter((item:unknown)=>{
  if(!item||typeof item!=="object")return false;
  const row=item as Record<string,unknown>;
  return (row.role==="user"||row.role==="assistant")&&typeof row.content==="string"&&row.content.length<=8000;
 }).map((item:{role:"user"|"assistant";content:string})=>({role:item.role,content:item.content})):[]; 
 const tokens=Number(body.maxOutputTokens||1536);
 const wantsStream=task==="chat"&&req.headers.get("accept")?.includes("text/event-stream")&&body.allowConnected!==true;
 if(wantsStream){
  const messages=[{role:"system" as const,content:system},...history,{role:"user" as const,content:text}];
  const stream=new ReadableStream<Uint8Array>({
   start(controller){
    const encode=new TextEncoder();
    const emit=(event:string,data:unknown)=>{try{controller.enqueue(encode.encode("event: "+event+"\n"+"data: "+JSON.stringify(data)+"\n\n"))}catch{}};
    emit("start",{state:"working"});
    void resilientText({
     userId:user.id,region,task,messages,
     maxOutputTokens:Number.isFinite(tokens)?Math.max(256,Math.min(4096,tokens)):1536,
     allowConnected:false,sessionKey:String(body.sessionKey||body.projectId||"chat").slice(0,160),
     onDelta:delta=>emit("delta",{text:delta}),onReset:()=>emit("reset",{})
    }).then(out=>{
     if(out.kind==="answer")emit("done",{state:"answer",answer:out.answer,experienceExhausted:out.experienceExhausted,experienceState:out.experienceState,experienceRemaining:out.experienceRemaining});
     else emit("done",{state:"needs-connection",experienceExhausted:out.experienceExhausted,experienceState:out.experienceState,experienceRemaining:out.experienceRemaining});
    }).catch(()=>emit("done",{state:"needs-connection",experienceExhausted:false})).finally(()=>{try{controller.close()}catch{}});
   }
  });
  return new Response(stream,{headers:{"Content-Type":"text/event-stream; charset=utf-8","Cache-Control":"private, no-store, no-transform","X-Accel-Buffering":"no"}});
 }
 const out=await resilientText({userId:user.id,region,task,messages:[{role:"system",content:system},...history,{role:"user",content:text}],maxOutputTokens:Number.isFinite(tokens)?Math.max(256,Math.min(4096,tokens)):1536,allowConnected:body.allowConnected===true&&body.acceptConnectedBilling===true,sessionKey:String(body.sessionKey||body.projectId||"chat").slice(0,160)});
 if(out.kind==="answer")return NextResponse.json({state:"answer",answer:out.answer,source:out.source,experienceExhausted:out.experienceExhausted,experienceState:out.experienceState,experienceRemaining:out.experienceRemaining},{headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({state:"needs-connection",needsConnection:true,experienceExhausted:out.experienceExhausted,experienceState:out.experienceState,experienceRemaining:out.experienceRemaining},{headers:{"Cache-Control":"no-store"}});
}
