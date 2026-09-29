import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {submitWorkerTask} from "@/lib/sasi-kernel/worker/client";
import {buildSasiExecutionPlan} from "@/lib/sasi-kernel/runtime/plan";
import {completeRuntimeTask,createRuntimeTask,failRuntimeTask} from "@/lib/sasi-kernel/runtime/task-store";

export const runtime="nodejs";
export const maxDuration=30;

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>({}));
 const kind=body.kind==="video"?"video":body.kind==="image"?"image":null;
 const prompt=String(body.prompt||"").trim();
 if(!kind||prompt.length<2||prompt.length>4000)return NextResponse.json({error:"INVALID_GENERATION_REQUEST"},{status:400});
 const taskId=crypto.randomUUID();
 const requestId=crypto.randomUUID();
 const taskKind=kind==="image"?"image-generate":"video-render";
 const plan=buildSasiExecutionPlan(taskKind);
 const firstNode=plan.nodes[0];
 if(!firstNode)return NextResponse.json({error:"GENERATION_PLAN_UNAVAILABLE"},{status:503});
 const admin=createAdminClient();
 try{
  await createRuntimeTask(admin,{taskId,userId:user.id,kind,action:"generate",prompt,plan});
  const workerCapability=kind==="image"?"image.generate.diffusion":"video.generate.model";
  const result=await submitWorkerTask({requestId,taskId,nodeId:firstNode.nodeId,capabilityId:workerCapability,input:{prompt,ratio:["1:1","16:9","9:16"].includes(String(body.ratio))?String(body.ratio):"1:1",duration:kind==="video"?Math.max(2,Math.min(30,Number(body.duration)||6)):undefined,style:String(body.style||"")}});
  if(result.status==="succeeded"){
   await completeRuntimeTask(admin,{taskId,userId:user.id,nodeId:firstNode.nodeId,result,capabilityId:workerCapability});
   return NextResponse.json({ok:true,taskId,result},{headers:{"Cache-Control":"no-store"}});
  }
  await failRuntimeTask(admin,{taskId,userId:user.id,nodeId:firstNode.nodeId,message:"GENERATION_NOT_COMPLETED"});
  return NextResponse.json({ok:false,taskId,result},{status:503,headers:{"Cache-Control":"no-store"}});
 }catch(error){
  const message=error instanceof Error?error.message:"GENERATION_UNAVAILABLE";
  await failRuntimeTask(admin,{taskId,userId:user.id,nodeId:firstNode.nodeId,message}).catch(()=>undefined);
  return NextResponse.json({error:message,taskId},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}
