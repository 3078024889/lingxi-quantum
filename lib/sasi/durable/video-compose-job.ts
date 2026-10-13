import 'server-only';
import {createHash} from 'node:crypto';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createAdminClient} from '@/lib/supabase/admin';
import {beginDurableRun,checkpointRun} from './run-store';
import {enqueueDurableJob} from './job-queue';
import {archiveGeneratedMedia} from '@/lib/sasi/intelligence/archive-generated-media';
import {presignSasiArtifact} from '@/lib/sasi-kernel/artifact-store/r2';
import {fetchPublicMedia} from '@/lib/security/public-media-fetch';
import {runCommand} from '@/lib/tools/engine/server/command';
import {conversationUuid} from '@/lib/sasi/core/conversation-store';
let assembling=false;

async function episodeTasks(userId:string,batchId:string,episode:number){
 const db=createAdminClient();
 const approval=await db.from('sasi_video_batch_approvals_v78').select('task_ids,project_id').eq('user_id',userId).eq('batch_id',batchId).maybeSingle();
 if(approval.error||!approval.data)throw Error('INVALID_VIDEO_APPROVAL');
 const approved=approval.data;
 const tasks=await db.from('sasi_byok_video_tasks').select('id,state,request,project_id,created_at').eq('user_id',userId).eq('project_id',approved.project_id).contains('request',{batchId,episode}).order('created_at').order('id');
 if(tasks.error||!tasks.data?.length||tasks.data.length>30||tasks.data.some(task=>!approved.task_ids.includes(task.id)))throw Error('INVALID_EPISODE_TASKS');
 const ordered=[...tasks.data].sort((a,b)=>Number(a.request.shotIndex)-Number(b.request.shotIndex));
 if(ordered.some(task=>!Number.isInteger(task.request.shotIndex))||new Set(ordered.map(task=>task.request.shotIndex)).size!==ordered.length)throw Error('INVALID_SHOT_ORDER');
 return ordered;
}
export async function queueVideoEpisodeAssembly(userId:string,batchId:string,episode:number){
 const tasks=await episodeTasks(userId,batchId,episode);if(tasks.some(task=>task.state!=='succeeded'))return;
 const payload={batchId,episode,taskIds:tasks.map(task=>task.id)};
 const run=await beginDurableRun({userId,sessionKey:batchId,task:'video.compose',idempotencyKey:`video.compose:${batchId}:${episode}`,inputHash:createHash('sha256').update(JSON.stringify(payload)).digest('hex')});
 await enqueueDurableJob({runId:run.id,userId,jobKind:'video.compose',workflowVersion:'video.compose.v78',payload,priority:4,maxAttempts:12,deadlineAt:new Date(Date.now()+24*3600000).toISOString()});
}
export async function executeVideoComposeJob(input:{runId:string;userId:string;payload:Record<string,unknown>}){
 if(assembling)throw Error('EPISODE_ASSEMBLY_BUSY');
 assembling=true;
 try{return await composeOwnedEpisode(input)}finally{assembling=false}
}
async function composeOwnedEpisode(input:{runId:string;userId:string;payload:Record<string,unknown>}){
 const {batchId,episode}=input.payload;
 if(typeof batchId!=='string'||!conversationUuid.test(batchId)||!Number.isInteger(episode)||Number(episode)<1||Number(episode)>50)throw Error('INVALID_COMPOSE_JOB');
 const tasks=await episodeTasks(input.userId,batchId,Number(episode));
 if(tasks.some(task=>task.state!=='succeeded'))throw Error('EPISODE_NOT_READY');
 if(JSON.stringify(tasks.map(task=>task.id))!==JSON.stringify(input.payload.taskIds))throw Error('INVALID_EPISODE_TASKS');
 const db=createAdminClient();
 const assets=await db.from('sasi_generated_assets').select('*').eq('user_id',input.userId).eq('kind','video').eq('status','ready').in('source_task_id',tasks.map(task=>task.id));
 if(assets.error||assets.data?.length!==tasks.length)throw Error('EPISODE_ASSETS_UNAVAILABLE');
 const ordered=tasks.map(task=>assets.data!.find(asset=>asset.source_task_id===task.id)!);
 const reference=ordered[0];
 if(ordered.some(asset=>asset.width!==reference.width||asset.height!==reference.height)||ordered.reduce((sum,asset)=>sum+Number(asset.byte_size),0)>100*1024*1024)throw Error('EPISODE_ASSEMBLY_LIMIT');
 const existing=await db.from('sasi_generated_assets').select('id').eq('user_id',input.userId).eq('source_task_id',input.runId).eq('kind','video').eq('status','ready').maybeSingle();
 if(existing.error)throw Error('EPISODE_ASSETS_UNAVAILABLE');
 let assetId=existing.data?.id||reference.id;
 if(tasks.length>1&&!existing.data){
  const dir=await mkdtemp(join(tmpdir(),'sasi-episode-'));const deadline=Date.now()+30000;
  try{
   for(const [i,asset] of ordered.entries()){
    const signed=asset.storage_provider==='r2'?{data:{signedUrl:presignSasiArtifact(asset.object_key)},error:null}:await db.storage.from(asset.bucket).createSignedUrl(asset.object_key,120);
    if(signed.error||!signed.data)throw Error('EPISODE_DOWNLOAD_FAILED');
    const response=await fetchPublicMedia(signed.data.signedUrl,{kind:'video',allowHtml:false,deadline,maxBytes:asset.byte_size});
    const bytes=Buffer.from(await response.response.arrayBuffer());
    if(bytes.length!==asset.byte_size||createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw Error('EPISODE_ASSET_CHANGED');
    await writeFile(join(dir,`part-${i}.mp4`),bytes);
   }
   await runCommand(process.execPath,['--max-old-space-size=256',join(process.cwd(),'scripts/runtime/assemble-generated-episode.cjs'),dir,String(tasks.length)],{timeoutMs:65000,maxOutputBytes:8192});
   const bytes=await readFile(join(dir,'episode.mp4'));
   const archived=await archiveGeneratedMedia({userId:input.userId,taskId:input.runId,projectId:tasks[0].project_id,kind:'video',url:'',expectedRatio:tasks[0].request.ratio,expectedDuration:tasks.reduce((sum,task)=>sum+Number(task.request.duration),0),minSide:Math.min(reference.width,reference.height),originalDownload:async()=>({response:new Response(new Uint8Array(bytes))})});
   assetId=archived.assetId;
  }finally{await rm(dir,{recursive:true,force:true})}
 }
 const payload={episode:Number(episode),assetId,url:'/api/sasi/generated-assets/'+assetId};
 await checkpointRun({runId:input.runId,step:'episode.delivered',state:'succeeded',payload});return payload;
}
