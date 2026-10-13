import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {conversationUuid} from '@/lib/sasi/core/conversation-store';
export const runtime='nodejs';export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
export async function GET(request:NextRequest){
 const {data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:'AUTH_REQUIRED'},401);
 const batchId=request.nextUrl.searchParams.get('batchId')||'';if(!conversationUuid.test(batchId))return reply({error:'INVALID_BATCH'},400);
 const db=createAdminClient();
 const approval=await db.from('sasi_video_batch_approvals_v78').select('task_ids').eq('batch_id',batchId).eq('user_id',user.id).maybeSingle();
 if(approval.error)return reply({error:'DELIVERY_UNAVAILABLE'},503);if(!approval.data)return reply({error:'BATCH_NOT_FOUND'},404);
 const tasks=await db.from('sasi_byok_video_tasks').select('state,request').eq('user_id',user.id).contains('request',{batchId}).in('id',approval.data.task_ids);
 const runs=await db.from('sasi_durable_runs').select('state,output_json').eq('user_id',user.id).eq('session_key',batchId).eq('task','video.compose').limit(50);
 if(tasks.error||runs.error||!tasks.data?.length)return reply({error:'DELIVERY_UNAVAILABLE'},503);
 const expected=new Set(tasks.data.map(task=>task.request.episode||1)).size;
 const films=(runs.data||[]).filter(run=>run.state==='succeeded'&&conversationUuid.test(run.output_json?.assetId||'')).map(run=>({episode:run.output_json.episode,url:'/api/sasi/generated-assets/'+run.output_json.assetId})).sort((a,b)=>a.episode-b.episode);
 const failed=tasks.data.some(task=>['failed','uncertain'].includes(task.state))||(runs.data||[]).some(run=>run.state==='failed');
 return reply({state:films.length===expected?'complete':failed?'needs-review':'generating',expectedEpisodes:expected,films});
}
