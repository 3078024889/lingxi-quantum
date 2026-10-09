import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import{attachUnifiedArtifacts,createUnifiedTask,publicTaskView,transitionUnifiedTask}from"@/lib/tasks/unified-task";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_RESULT_BYTES=8*1024*1024;

export async function GET(req:Request){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});

  const u=new URL(req.url),quoteId=u.searchParams.get("quoteId")||"",jobId=u.searchParams.get("jobId")||"";
  if(!UUID.test(quoteId)||!UUID.test(jobId))return NextResponse.json({error:"INVALID_JOB_REFERENCE"},{status:400});

  const admin=createAdminClient();
  const {data,error}=await admin.from("tool_paid_jobs")
    .select("id,quote_id,tool_id,item_key,status,result,created_at,updated_at")
    .eq("id",jobId).eq("quote_id",quoteId).eq("user_id",user.id)
    .eq("status","completed").maybeSingle();

  if(error)return NextResponse.json({error:"RESULT_LOOKUP_FAILED"},{status:500});
  if(!data)return NextResponse.json({error:"RESULT_NOT_FOUND"},{status:404});

  const payload=JSON.stringify(data.result??null);
  if(Buffer.byteLength(payload,"utf8")>MAX_RESULT_BYTES){
    return NextResponse.json({error:"RESULT_TOO_LARGE_TO_REOPEN"},{status:413});
  }

  let task=createUnifiedTask({id:String(data.id),domain:"tool",capability:`tool:${data.tool_id}`,billing:"paid",createdAt:String(data.created_at||data.updated_at)});
  task=transitionUnifiedTask(task,"running",{progress:90,updatedAt:String(data.updated_at)});
  const resultObject=(data.result&&typeof data.result==="object")?data.result as Record<string,unknown>:null;
  const name=typeof resultObject?.fileName==="string"?resultObject.fileName:typeof resultObject?.name==="string"?resultObject.name:undefined;
  const mime=typeof resultObject?.mime==="string"?resultObject.mime:typeof resultObject?.contentType==="string"?resultObject.contentType:undefined;
  const bytes=typeof resultObject?.byteSize==="number"?resultObject.byteSize:undefined;
  if(name||mime||bytes)task=attachUnifiedArtifacts(task,[{id:`${data.id}:result`,kind:"file",name,mime,byteSize:bytes}],"unverified");
  task=transitionUnifiedTask(task,"succeeded",{updatedAt:String(data.updated_at)});
  return NextResponse.json(
    {job:{id:data.id,toolId:data.tool_id,itemKey:data.item_key,updatedAt:data.updated_at},result:data.result??null,task:publicTaskView(task)},
    {headers:{"Cache-Control":"private, no-store, max-age=0"}}
  );
}
