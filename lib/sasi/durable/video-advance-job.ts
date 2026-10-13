import 'server-only';
import {createAdminClient} from '@/lib/supabase/admin';
import {executeOwnedVideoAction} from '@/lib/sasi/intelligence/video-actions';
import {checkpointRun} from './run-store';
import {conversationUuid} from '@/lib/sasi/core/conversation-store';
import {queueVideoEpisodeAssembly} from './video-compose-job';

export async function executeVideoAdvanceJob(input:{runId:string;userId:string;payload:Record<string,unknown>}){
 const {taskId,batchId}=input.payload;
 if(typeof taskId!=='string'||typeof batchId!=='string'||!conversationUuid.test(taskId)||!conversationUuid.test(batchId))throw Error('INVALID_VIDEO_JOB');
 const db=createAdminClient();
 const approval=await db.from('sasi_video_batch_approvals_v78').select('task_ids').eq('batch_id',batchId).eq('user_id',input.userId).maybeSingle();
 if(approval.error||!approval.data?.task_ids?.includes(taskId))throw Error('INVALID_VIDEO_APPROVAL');
 const owned=await db.from('sasi_byok_video_tasks').select('state,request').eq('id',taskId).eq('user_id',input.userId).maybeSingle();
 if(owned.error||!owned.data||owned.data.request?.batchId!==batchId)throw Error('INVALID_VIDEO_OWNER');
 const response=await executeOwnedVideoAction(input.userId,{action:owned.data.state==='quoted'?'confirm':'refresh',taskId,acceptSupplierBilling:true});
 const data=await response.json();
 if(!response.ok){
  if(owned.data.state==='quoted'&&response.status<500){await db.rpc('fail_quoted_sasi_video_v78',{p_user_id:input.userId,p_task_id:taskId,p_error:String(data.error||'VIDEO_APPROVAL_FAILED')});throw Error('INVALID_VIDEO_PRECONDITION');}
  throw Error(String(data.error||'VIDEO_PROGRESS_UNAVAILABLE'));
 }
 if(!['succeeded','failed'].includes(data.state))throw Error('VIDEO_TASK_PENDING');
 if(data.state==='succeeded')await queueVideoEpisodeAssembly(input.userId,batchId,Number(owned.data.request.episode||1));
 await checkpointRun({runId:input.runId,step:'complete',state:data.state==='succeeded'?'succeeded':'failed',payload:{taskId,state:data.state}});
 return data;
}
