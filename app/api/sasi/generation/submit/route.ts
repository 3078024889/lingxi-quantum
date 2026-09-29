import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {buildSasiExecutionPlan} from "@/lib/sasi-kernel/runtime/plan";
import {createRuntimeTask,failRuntimeTask} from "@/lib/sasi-kernel/runtime/task-store";
import {executeSasiPlan} from "@/lib/sasi-kernel/runtime/executor";
export const runtime="nodejs"; export const maxDuration=60;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>({})); const kind=body.kind==="video"?"video":body.kind==="image"?"image":null; const prompt=String(body.prompt||"").trim();
 if(!kind||prompt.length<2||prompt.length>4000)return NextResponse.json({error:"INVALID_GENERATION_REQUEST"},{status:400});
 const taskId=crypto.randomUUID(), taskKind=kind==="image"?"image-generate":"video-render", plan=buildSasiExecutionPlan(taskKind), admin=createAdminClient();
 if(!plan.nodes.length)return NextResponse.json({error:"GENERATION_PLAN_UNAVAILABLE"},{status:503});
 const executionInput={prompt,ratio:["1:1","16:9","9:16"].includes(String(body.ratio))?String(body.ratio):"1:1",duration:kind==="video"?Math.max(2,Math.min(30,Number(body.duration)||6)):undefined,style:String(body.style||"")};
 try{
  await createRuntimeTask(admin,{taskId,userId:user.id,kind,action:"generate",prompt,plan});
  const result=await executeSasiPlan(admin,{taskId,userId:user.id,plan,input:executionInput});
  if(result.status==="succeeded")return NextResponse.json({ok:true,taskId,result},{headers:{"Cache-Control":"no-store"}});
  return NextResponse.json({ok:false,taskId,error:"GENERATION_NOT_COMPLETED"},{status:503,headers:{"Cache-Control":"no-store"}});
 }catch(error){const message=error instanceof Error?error.message:"GENERATION_UNAVAILABLE"; await failRuntimeTask(admin,{taskId,userId:user.id,nodeId:plan.nodes[0].nodeId,message}).catch(()=>undefined); return NextResponse.json({error:message,taskId},{status:503,headers:{"Cache-Control":"no-store"}});}
}
