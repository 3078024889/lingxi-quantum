import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
import {enforceAbuseGuard} from '@/lib/security/abuse-guard';
import {resilientText} from '@/lib/sasi/experience/resilient-text';
import {experienceRegionFromHost} from '@/lib/sasi/experience/free-provider-config';
import {AUTOMATIC_VIDEO_CONTRACT,parseAutomaticVideoPlan} from '@/lib/sasi/automatic-video-plan';
export const runtime='nodejs';export const maxDuration=60;
export async function POST(req:NextRequest){
 const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
 if(!isSameOriginMutation(req))return reply({error:'REQUEST_INVALID'},403);
 const body:any=await boundedRequestJson(req,96*1024).catch(()=>null);
 if(typeof body?.text!=='string'||!body.text.trim()||body.text.length>24000)return reply({error:'TEXT_REQUIRED'},400);
 const {data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:'AUTH_REQUIRED'},401);
 const abuse=await enforceAbuseGuard(req,{scope:'sasi-video-plan',userId:user.id,accountLimit:30,ipLimit:90});if(!abuse.ok)return reply({error:'RATE_LIMITED'},429);
 const result=await resilientText({userId:user.id,region:experienceRegionFromHost(req.headers.get('host')),task:'drama',allowConnected:false,maxOutputTokens:4096,sessionKey:String(body.projectId||'video').slice(0,160),messages:[{role:'system',content:AUTOMATIC_VIDEO_CONTRACT},{role:'user',content:body.text}],validateAnswer:answer=>{parseAutomaticVideoPlan(answer,body.text)}});
 if(result.kind!=='answer')return reply({state:'needs-connection'});
 return reply({state:'answer',plan:parseAutomaticVideoPlan(result.answer,body.text)});
}
