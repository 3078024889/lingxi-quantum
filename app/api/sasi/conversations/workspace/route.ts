import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {boundedRequestJson} from '@/lib/security/bounded-request-json';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {enforceAbuseGuard} from '@/lib/security/abuse-guard';
export const runtime='nodejs';export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const headers={'Cache-Control':'private, no-store'};
export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return NextResponse.json({error:'INVALID_ORIGIN'},{status:403,headers});
 const {data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:'AUTH_REQUIRED'},{status:401,headers});
 const guard=await enforceAbuseGuard(request,{scope:'sasi-conversation-workspace',userId:user.id,accountLimit:720,ipLimit:1440,windowSeconds:3600});
 if(!guard.ok)return NextResponse.json({error:'TOO_MANY_REQUESTS'},{status:429,headers});
 const body:any=await boundedRequestJson(request,512*1024).catch(()=>null);
 if(!body||typeof body.threadId!=='string'||!uuid.test(body.threadId)||!body.workspace||typeof body.workspace!=='object'||Array.isArray(body.workspace))return NextResponse.json({error:'INVALID_WORKSPACE'},{status:400,headers});
 const mode=body.workspace.mode;
 if(!['chat','image','drama','website','book','learning','research'].includes(mode))return NextResponse.json({error:'INVALID_WORKSPACE'},{status:400,headers});
 const db=createAdminClient();
 const projectId=body.workspace.projectId||null;
 if(projectId){
  if(typeof projectId!=='string'||!uuid.test(projectId))return NextResponse.json({error:'INVALID_PROJECT'},{status:400,headers});
  const project=await db.from('sasi_projects').select('id').eq('user_id',user.id).eq('id',projectId).maybeSingle();
  if(project.error||!project.data)return NextResponse.json({error:'PROJECT_NOT_FOUND'},{status:404,headers});
 }
 const saved=await db.from('sasi_conversation_threads').update({workspace:body.workspace,active_mode:mode,project_id:projectId,updated_at:new Date().toISOString()}).eq('id',body.threadId).eq('user_id',user.id).select('id').maybeSingle();
 if(saved.error)return NextResponse.json({error:'WORKSPACE_SAVE_FAILED'},{status:503,headers});
 if(!saved.data)return NextResponse.json({error:'HISTORY_NOT_FOUND'},{status:404,headers});
 return NextResponse.json({ok:true},{headers});
}
