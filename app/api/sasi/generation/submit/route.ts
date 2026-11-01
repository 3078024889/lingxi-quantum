import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {parseSasiGenerationInput} from "@/lib/sasi-kernel/runtime/generation-request";
import {buildSasiExecutionPlan} from "@/lib/sasi-kernel/runtime/plan";
import {createRuntimeTask,failRuntimeTask} from "@/lib/sasi-kernel/runtime/task-store";
import {executeSasiPlan} from "@/lib/sasi-kernel/runtime/executor";

export const runtime="nodejs";
export const maxDuration=60;
const response=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{"Cache-Control":"private, no-store"}});

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return response({error:"INVALID_REQUEST_ORIGIN"},403);
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return response({error:"AUTH_REQUIRED"},401);
 let raw:unknown;
 try{raw=await boundedRequestJson(req,12*1024)}
 catch(e){return response({error:e instanceof Error&&e.message==="REQUEST_TOO_LARGE"?"REQUEST_TOO_LARGE":"INVALID_GENERATION_REQUEST"},e instanceof Error&&e.message==="REQUEST_TOO_LARGE"?413:400)}
 let input:ReturnType<typeof parseSasiGenerationInput>;
 try{input=parseSasiGenerationInput(raw)}
 catch{return response({error:"INVALID_GENERATION_REQUEST"},400)}
 // The generation worker is not a substitute for the quote/confirm/settle payment flow.
 // Bound public requests before a task row, an event, or a worker operation is created.
 const guard=await enforceAbuseGuard(req,{scope:"sasi-generation-submit",userId:user.id,accountLimit:30,ipLimit:90,windowSeconds:3600});
 if(!guard.ok)return response({error:guard.error},guard.status);
 const taskId=crypto.randomUUID(),taskKind=input.kind==="image"?"image-generate":"video-render";
 const plan=buildSasiExecutionPlan(taskKind);
 if(!plan.nodes.length)return response({error:"GENERATION_PLAN_UNAVAILABLE"},503);
 const executionInput={prompt:input.prompt,ratio:input.ratio,duration:input.duration,style:input.style};
 let admin:ReturnType<typeof createAdminClient>|null=null,created=false;
 try{
  admin=createAdminClient();
  await createRuntimeTask(admin,{taskId,userId:user.id,kind:input.kind,action:"generate",prompt:input.prompt,plan});
  created=true;
  const result=await executeSasiPlan(admin,{taskId,userId:user.id,plan,input:executionInput});
  if(result.status==="succeeded")return response({ok:true,taskId,result});
  return response({ok:false,taskId,error:"GENERATION_NOT_COMPLETED"},503);
 }catch{
  if(created&&admin)await failRuntimeTask(admin,{taskId,userId:user.id,nodeId:plan.nodes[0].nodeId,message:"GENERATION_UNAVAILABLE"}).catch(()=>undefined);
  return response({error:"GENERATION_UNAVAILABLE",taskId},503);
 }
}
