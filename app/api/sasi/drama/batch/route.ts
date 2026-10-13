import {NextRequest,NextResponse,after} from 'next/server';
import {createHash} from 'node:crypto';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
import {enforceAbuseGuard} from '@/lib/security/abuse-guard';
import {conversationUuid} from '@/lib/sasi/core/conversation-store';
import {beginDurableRun} from '@/lib/sasi/durable/run-store';
import {enqueueDurableJob} from '@/lib/sasi/durable/job-queue';
import {runOneDetachedJob} from '@/lib/sasi/durable/detached-worker';
export const runtime='nodejs';export const maxDuration=180;
const reply=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return reply({error:'ORIGIN_REJECTED'},403);
 const {data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:'AUTH_REQUIRED'},401);
 const guard=await enforceAbuseGuard(request,{scope:'sasi-video-batch',userId:user.id,accountLimit:30,ipLimit:90});if(!guard.ok)return reply({error:'RATE_LIMITED'},429);
 const body:any=await boundedRequestJson(request,32*1024).catch(()=>null);
 if(!body||!conversationUuid.test(String(body.batchId))||!Number.isSafeInteger(body.expectedTotalMinor)||body.expectedTotalMinor<1||!['CNY','USD'].includes(body.currency)||body.acceptSupplierBilling!==true)return reply({error:'BUDGET_CONFIRMATION_REQUIRED'},422);
 const db=createAdminClient();
 const approved=await db.rpc('approve_sasi_video_batch_v78',{p_user_id:user.id,p_batch_id:body.batchId,p_expected_total:body.expectedTotalMinor,p_currency:body.currency});
 if(approved.error)return reply({error:'BATCH_APPROVAL_UNAVAILABLE'},503);
 if(!approved.data?.ok)return reply({error:approved.data?.error||'QUOTE_INVALID'},approved.data?.error==='SASI_BALANCE_INSUFFICIENT'?402:409);
 try{
  for(const taskId of approved.data.taskIds||[]){
   const payload={taskId,batchId:body.batchId};
   const run=await beginDurableRun({userId:user.id,sessionKey:body.batchId,task:'video.advance',inputHash:createHash('sha256').update(JSON.stringify(payload)).digest('hex'),idempotencyKey:'video.advance:'+taskId});
   await enqueueDurableJob({runId:run.id,userId:user.id,jobKind:'video.advance',workflowVersion:'video.advance.v78',payload,priority:2,maxAttempts:12,deadlineAt:new Date(Date.now()+24*3600000).toISOString()});
  }
 }catch{return reply({error:'BATCH_ENQUEUE_RECOVERABLE',batchId:body.batchId},503)}
 after(async()=>{await runOneDetachedJob().catch(()=>{})});
 return reply({batchId:body.batchId,state:'generating',taskIds:approved.data.taskIds},202);
}
