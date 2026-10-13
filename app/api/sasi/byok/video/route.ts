import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {selectUserVideoConnection} from "@/lib/sasi/intelligence/user-video";
import {generatedArchiveReady} from "@/lib/sasi/intelligence/archive-generated-media";
import {profilesFor,executeOwnedVideoAction} from "@/lib/sasi/intelligence/video-actions";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=180;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PUBLIC_FIELDS="id,project_id,provider,state,request,estimated_fen,price_source,expires_at,approved_at,provider_task_id,output,created_at,updated_at";
const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(request:NextRequest){
 const{data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED",enabled:false},401);
 const projectId=request.nextUrl.searchParams.get("projectId")??"";if(!UUID.test(projectId))return reply({error:"INVALID_PROJECT"},400);
 const admin=createAdminClient();const{data:project}=await admin.from("sasi_projects").select("id").eq("id",projectId).eq("user_id",user.id).maybeSingle();if(!project)return reply({error:"PROJECT_NOT_FOUND"},404);
 const connection=await selectUserVideoConnection(user.id).catch(()=>null),profiles=generatedArchiveReady()?profilesFor(connection):[],profile=profiles[0]??null;
 const batchId=request.nextUrl.searchParams.get('batchId');if(batchId&&!UUID.test(batchId))return reply({error:'INVALID_BATCH'},400);
 let taskQuery=admin.from('sasi_byok_video_tasks').select(PUBLIC_FIELDS).eq('user_id',user.id).eq('project_id',projectId);
 if(batchId)taskQuery=taskQuery.contains('request',{batchId});
 const[tasks,assets]=await Promise.all([taskQuery.order("created_at",{ascending:false}).limit(500),admin.from("sasi_assets").select("id,original_name,status,verified_size").eq("user_id",user.id).eq("project_id",projectId).in("status",["ready","external_scan_required"]).order("created_at",{ascending:false}).limit(100)]);
 if(tasks.error||assets.error)return reply({error:"BYOK_FOUNDATION_UNAVAILABLE"},503);
 return reply({enabled:Boolean(connection),connected:Boolean(connection),profile,profiles,tasks:tasks.data,assets:(assets.data??[]).filter(row=>/\.(png|jpe?g|webp)$/i.test(row.original_name)&&Number(row.verified_size)<=10*1024*1024),billing:"supplier_direct",provider:connection?.provider??null,reason:connection?null:"VIDEO_CONNECTION_REQUIRED"});
}

export async function POST(request:NextRequest){
 if(!isSameOriginMutation(request))return reply({error:"ORIGIN_REJECTED"},403);
 const {data:{user}}=await createClient().auth.getUser();if(!user)return reply({error:"AUTH_REQUIRED"},401);
 const body=await boundedRequestJson(request,3*1024*1024).catch(()=>null) as any;
 if(!body||!["quote","quote-series","confirm","refresh"].includes(body.action))return reply({error:"INVALID_ACTION"},400);
 const abuse=await enforceAbuseGuard(request,{scope:body.action==="refresh"?"byok-video-refresh":"byok-video",userId:user.id,accountLimit:body.action==="refresh"?3600:120,ipLimit:body.action==="refresh"?9000:300});
 if(!abuse.ok)return reply({error:abuse.error},abuse.status);
 return executeOwnedVideoAction(user.id,body);
}
