import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {executeSasiKernel} from "@/lib/sasi-kernel/runtime";
import type {SasiTaskKind} from "@/lib/sasi-kernel/types";
import{attachUnifiedArtifacts,createUnifiedTask,publicTaskView,transitionUnifiedTask}from"@/lib/tasks/unified-task";
export const runtime="nodejs";export const dynamic="force-dynamic";export const maxDuration=30;
const KINDS=new Set<SasiTaskKind>(["knowledge","image","video","utility","file","document","audio","website","code"]);
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"请求来源无效。"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:"请先登录。"},{status:401});
 const abuse=await enforceAbuseGuard(req,{scope:"sasi-kernel-task",userId:user.id,accountLimit:90,ipLimit:240});if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const size=Number(req.headers.get("content-length")||0);if(Number.isFinite(size)&&size>1024*1024)return NextResponse.json({error:"请求内容过大。"},{status:413});
 const body=(await req.json().catch(()=>null)) as Record<string,unknown>|null;if(!body)return NextResponse.json({error:"请求内容无法读取。"},{status:400});
 const kind=String(body.kind||"") as SasiTaskKind,action=String(body.action||"").trim();if(!KINDS.has(kind)||!action||action.length>80)return NextResponse.json({error:"任务类型无法识别。"},{status:400});
 const projectId=typeof body.projectId==="string"?body.projectId:null;
 const skillSelection=body.skill&&typeof body.skill==="object"?body.skill:null;
 const admin=createAdminClient();
 const taskId=crypto.randomUUID();
 let unified=createUnifiedTask({id:taskId,domain:"sasi",capability:`sasi:${kind}:${action}`,lane:"self-hosted",billing:"unknown"});
 unified=transitionUnifiedTask(unified,"running",{progress:5,recovery:"none"});
 const insert=await admin.from("sasi_tasks").insert({id:taskId,user_id:user.id,project_id:projectId,kind,action,input:body.input??{},constraints:{...((body.constraints&&typeof body.constraints==="object")?body.constraints:{}),skill:skillSelection},state:"running",progress:0.05,started_at:new Date().toISOString()}).select("id").single();
 if(insert.error)return NextResponse.json({error:"任务暂时无法开始。"},{status:503});
 const result=await executeSasiKernel({id:taskId,ownerId:user.id,projectId,kind,action,input:body.input,intelligence:body.intelligence==="light"?"light":body.intelligence==="high"?"high":"standard",mode:body.mode==="enhanced"?"enhanced":"autonomous"});
 const state=result.ok?"succeeded":"failed",completedAt=new Date().toISOString();
 if(result.ok){
  unified=transitionUnifiedTask(unified,"validating",{progress:95});
  unified=attachUnifiedArtifacts(unified,(result.artifacts||[]).map((a,index)=>({id:`${taskId}:artifact:${index+1}`,kind:a.type||"artifact",name:a.name,mime:a.mime,byteSize:a.byteSize,localRef:a.path,metadata:a.metadata})),"unverified");
  unified=transitionUnifiedTask(unified,"succeeded");
 }else{
  unified=transitionUnifiedTask(unified,"failed",{progress:100,safeError:result.error?.code||"TASK_FAILED",userMessage:result.error?.message||"处理没有完成。",recovery:"partial"});
 }
 await admin.from("sasi_tasks").update({state,progress:1,result:result.ok?{capability:result.capability,artifactCount:result.artifacts.length}:null,error:result.ok?null:result.error??{code:"UNKNOWN",message:"处理没有完成。"},completed_at:completedAt,updated_at:completedAt}).eq("id",taskId).eq("user_id",user.id);
 if(result.artifacts.length){await admin.from("sasi_artifacts").insert(result.artifacts.map((a,index)=>({task_id:taskId,user_id:user.id,project_id:projectId,node_id:"execute",kind:a.type,name:a.name??`artifact-${index+1}`,mime_type:a.mime??null,inline_value:a.value==null?null:a.value,storage_path:a.path??null,sha256:a.sha256??null,byte_size:a.byteSize??null,metadata:a.metadata??{}})));}
 await admin.from("sasi_task_events").insert((result.history??[]).slice(0,200).map((e,index)=>({task_id:taskId,user_id:user.id,event_index:index,event_type:e.event,node_id:e.node??null,attempt:e.attempt??null,data:e.data??{},occurred_at:e.at})));
 return NextResponse.json({...result,task:publicTaskView(unified)},{status:result.ok?200:422,headers:{"Cache-Control":"no-store"}});
}
