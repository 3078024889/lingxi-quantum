import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { enforceAbuseGuard } from "@/lib/security/abuse-guard";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { getNativeJob, submitNativeJob } from "@/lib/sasi-kernel/compute/native-client";
import {
  bindNativeWorkerJob,
  claimNativePaidExecution,
  type NativePaidKind,
} from "@/lib/sasi-kernel/commerce/native-entitlement";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=30;

export async function POST(request:NextRequest){
  if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});

  const abuse=await enforceAbuseGuard(request,{scope:"sasi-native-jobs",userId:user.id,accountLimit:24,ipLimit:72});
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});

  const size=Number(request.headers.get("content-length")||0);
  if(Number.isFinite(size)&&size>256*1024)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});
  const body=await request.json().catch(()=>null) as Record<string,unknown>|null;
  if(!body)return NextResponse.json({error:"INVALID_JSON"},{status:400});

  const kind:NativePaidKind|null=body.kind==="reason"||body.kind==="image"||body.kind==="video"?body.kind:null;
  if(!kind)return NextResponse.json({error:"INVALID_JOB_KIND"},{status:400});
  const quoteId=typeof body.quoteId==="string"?body.quoteId:"";
  const taskId=typeof body.taskId==="string"&&body.taskId.length<=120?body.taskId:crypto.randomUUID();
  const input=body.input&&typeof body.input==="object"&&!Array.isArray(body.input)?body.input as Record<string,unknown>:{};

  const entitlement=await claimNativePaidExecution({userId:user.id,quoteId,kind});
  if(!entitlement.ok)return NextResponse.json({error:entitlement.error},{status:402});

  try{
    if(entitlement.workerJobId){
      const existing=await getNativeJob(entitlement.workerJobId,user.id);
      return NextResponse.json({job:existing,recovered:true},{status:200,headers:{"Cache-Control":"no-store"}});
    }
    const job=await submitNativeJob({
      taskId,
      ownerId:user.id,
      projectId:typeof body.projectId==="string"?body.projectId:null,
      kind,
      input,
    });
    await bindNativeWorkerJob({quoteId,userId:user.id,workerJobId:job.id});
    return NextResponse.json({job},{status:202,headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("[sasi native jobs] submit failed",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"SASI_NATIVE_JOB_UNAVAILABLE"},{status:503});
  }
}
