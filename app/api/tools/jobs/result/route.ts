import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
    .select("id,quote_id,tool_id,item_key,status,result,updated_at")
    .eq("id",jobId).eq("quote_id",quoteId).eq("user_id",user.id)
    .eq("status","completed").maybeSingle();

  if(error)return NextResponse.json({error:"RESULT_LOOKUP_FAILED"},{status:500});
  if(!data)return NextResponse.json({error:"RESULT_NOT_FOUND"},{status:404});

  const payload=JSON.stringify(data.result??null);
  if(Buffer.byteLength(payload,"utf8")>MAX_RESULT_BYTES){
    return NextResponse.json({error:"RESULT_TOO_LARGE_TO_REOPEN"},{status:413});
  }

  return NextResponse.json(
    {job:{id:data.id,toolId:data.tool_id,itemKey:data.item_key,updatedAt:data.updated_at},result:data.result??null},
    {headers:{"Cache-Control":"private, no-store, max-age=0"}}
  );
}
