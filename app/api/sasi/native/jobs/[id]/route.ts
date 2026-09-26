import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNativeJob, cancelNativeJob } from "@/lib/sasi-kernel/compute/native-client";
import { assertOwnedSasiObjectKey, presignSasiArtifact } from "@/lib/sasi-kernel/artifact-store/r2";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export const runtime="nodejs";
export const dynamic="force-dynamic";

async function currentUser(){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  return user;
}

function withUrls(userId:string,job:Awaited<ReturnType<typeof getNativeJob>>){
  return{
    ...job,
    artifacts:job.artifacts.map((artifact)=>{
      if(artifact.storage!=="r2"||!artifact.objectKey)return artifact;
      try{
        const key=assertOwnedSasiObjectKey(userId,artifact.objectKey);
        return{...artifact,url:presignSasiArtifact(key,300)};
      }catch{return{...artifact,objectKey:null}}
    }),
  };
}

export async function GET(_request:NextRequest,{params}:{params:{id:string}}){
  const user=await currentUser();
  if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  try{
    const job=await getNativeJob(params.id,user.id);
    return NextResponse.json({job:withUrls(user.id,job)},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    const message=error instanceof Error?error.message:"SASI_NATIVE_JOB_LOOKUP_FAILED";
    const status=/OWNER|NOT_FOUND/.test(message)?404:503;
    return NextResponse.json({error:"SASI_NATIVE_JOB_LOOKUP_FAILED"},{status});
  }
}

export async function DELETE(request:NextRequest,{params}:{params:{id:string}}){
  if(!isSameOriginMutation(request))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const user=await currentUser();
  if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
  try{
    const result=await cancelNativeJob(params.id,user.id);
    return NextResponse.json(result,{headers:{"Cache-Control":"no-store"}});
  }catch{
    return NextResponse.json({error:"SASI_NATIVE_CANCEL_FAILED"},{status:503});
  }
}
