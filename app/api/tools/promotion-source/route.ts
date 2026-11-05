import {NextRequest,NextResponse} from 'next/server';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
import {enforceAbuseGuard} from '@/lib/security/abuse-guard';
import {fetchPublicMedia} from '@/lib/security/public-media-fetch';
import {createClient} from '@/lib/supabase/server';
import {toolPassBackendReady,redeemToolStart} from '@/lib/tools/commerce/tool-server-receipt';
export const runtime='nodejs';export const maxDuration=25;
export async function POST(req:NextRequest){
 const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
 if(!isSameOriginMutation(req))return reply({error:'REQUEST_INVALID'},403);
 const abuse=await enforceAbuseGuard(req,{scope:'promotion-source',ipLimit:30});if(!abuse.ok)return reply({error:abuse.error},abuse.status);
 const body=await boundedRequestJson(req,8*1024).catch(()=>null) as any;
 if(typeof body?.url!=='string'||body.url.length>2048)return reply({error:'URL_INVALID'},400);
 if(toolPassBackendReady()){
  const {data:{user}}=await createClient().auth.getUser();
  if(!user)return reply({error:"LOGIN_REQUIRED"},401);
  const result=await redeemToolStart({userId:user.id,toolSlug:"url-to-video",
    accessRequestId:body.accessRequestId,operationId:String(body.operationId||"")});
  if(!result.ok)return reply({error:result.error},403);
  // The first redemption owns this remote fetch. Same operation retries must not refetch.
  if(result.alreadyRedeemed)return reply({error:"TOOL_OPERATION_ALREADY_STARTED"},409);
 }
 try{
  const raw=/^https:\/\//i.test(body.url)?body.url:`https://${body.url}`;
  const {response,finalUrl}=await fetchPublicMedia(raw,{kind:'image',allowHtml:true,deadline:Date.now()+18000});
  if(!/html/.test(response.headers.get('content-type')||''))return reply({error:'WEBPAGE_REQUIRED'},422);
  const html=await response.text();if(html.includes('\uFFFD'))return reply({error:'WEBPAGE_ENCODING_UNSUPPORTED'},422);
  return reply({url:finalUrl.href,html});
 }catch{return reply({error:'WEBPAGE_UNAVAILABLE'},422)}
}
