import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import{createUnifiedTask,publicTaskView,transitionUnifiedTask}from"@/lib/tasks/unified-task";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req:Request){
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"请先登录"},{status:401});

  const quoteId=new URL(req.url).searchParams.get("quoteId")||"";
  if(!UUID.test(quoteId))return NextResponse.json({error:"INVALID_QUOTE_ID"},{status:400});

  const admin=createAdminClient();
  const {data:quote}=await admin.from("tool_payment_quotes")
    .select("id,tool_id,quantity,unit_name,status")
    .eq("id",quoteId).eq("user_id",user.id).maybeSingle();
  if(!quote)return NextResponse.json({error:"QUOTE_NOT_FOUND"},{status:404});

  const {data,error}=await admin.from("tool_paid_jobs")
    .select("id,tool_id,item_key,units,status,created_at,updated_at")
    .eq("quote_id",quoteId).eq("user_id",user.id)
    .order("updated_at",{ascending:false}).limit(100);
  if(error)return NextResponse.json({error:"JOB_LIST_FAILED"},{status:500});

  const jobs=(data??[]).map((row:any)=>{
    let task=createUnifiedTask({id:String(row.id),domain:"tool",capability:`tool:${row.tool_id}`,billing:"paid",createdAt:String(row.created_at||row.updated_at)});
    if(row.status==="processing")task=transitionUnifiedTask(task,"running",{progress:50,recovery:"partial",updatedAt:String(row.updated_at)});
    else if(row.status==="completed"){task=transitionUnifiedTask(task,"running",{progress:90,updatedAt:String(row.updated_at)});task=transitionUnifiedTask(task,"succeeded",{updatedAt:String(row.updated_at)})}
    else task=transitionUnifiedTask(task,"failed",{progress:100,recovery:"partial",updatedAt:String(row.updated_at),safeError:"TOOL_JOB_FAILED"});
    return{...row,task:publicTaskView(task)};
  });
  return NextResponse.json({quote,jobs},{headers:{"Cache-Control":"no-store"}});
}
