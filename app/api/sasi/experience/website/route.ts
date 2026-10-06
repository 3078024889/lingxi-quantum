import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {experienceRegionFromHost} from "@/lib/sasi/experience/free-provider-config";
import {resilientText} from "@/lib/sasi/experience/resilient-text";
import {WEBSITE_CONTRACT,validateWebsiteArtifact} from "@/lib/sasi/website-artifact";
import {compileSasiSkillGuidance,validateSasiSkillIds} from "@/lib/sasi/skills/router";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
export const runtime="nodejs";export const maxDuration=60;
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return reply({error:"REQUEST_INVALID"},403);
 let body:any;try{body=await boundedRequestJson(req,96*1024)}catch(error){return reply({error:"REQUEST_INVALID"},error instanceof Error&&error.message==="REQUEST_TOO_LARGE"?413:400)}
 if(!body||typeof body.text!=="string"||!body.text.trim())return reply({error:"TEXT_REQUIRED"},400);
 const {data:{user}}=await createClient().auth.getUser();if(!user)return reply({state:"login-required"},401);
 const abuse=await enforceAbuseGuard(req,{scope:"sasi-experience-website",userId:user.id,accountLimit:30,ipLimit:90,windowSeconds:3600});
 if(!abuse.ok)return reply({state:"busy"},429);
 try{
  const out=await resilientText({userId:user.id,region:experienceRegionFromHost(req.headers.get("host")),task:"website",allowConnected:false,validateAnswer:answer=>{validateWebsiteArtifact(JSON.parse(answer.replace(/^```(?:json)?\s*|\s*```$/g,"")))},sessionKey:String(body.projectId||"website").slice(0,160),maxOutputTokens:4096,messages:[{role:"system",content:WEBSITE_CONTRACT+"\n"+compileSasiSkillGuidance(validateSasiSkillIds(body.skillIds,"website"))},{role:"user",content:body.text.slice(0,24000)}]});
  if(out.kind!=="answer")return reply({state:"needs-connection",needsConnection:true});
  const website=validateWebsiteArtifact(JSON.parse(out.answer.replace(/^```(?:json)?\s*|\s*```$/g,"")));
  return reply({state:"answer",website,source:"experience"});
 }catch{return reply({state:"unavailable"},503)}
}
