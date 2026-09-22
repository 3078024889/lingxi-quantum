import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime="nodejs";

const ALLOWED=new Set([
  "tool_open","file_selected","process_started","process_completed",
  "process_failed","export_clicked","export_paid","tool_search"
]);

function cleanMetadata(input:unknown){
  if(!input||typeof input!=="object")return {};
  const src=input as Record<string,unknown>;
  const out:Record<string,unknown>={};
  for(const k of ["query","matched_count","duration_ms","file_count","quantity","billing_type","status"]){
    const v=src[k];
    if(typeof v==="string")out[k]=v.slice(0,200);
    else if(typeof v==="number"&&Number.isFinite(v))out[k]=v;
    else if(typeof v==="boolean")out[k]=v;
  }
  return out;
}

export async function POST(req:Request){
  try{
    const body=await req.json();
    const eventType=String(body.eventType||"");
    const toolId=String(body.toolId||"").slice(0,160);
    const sessionId=typeof body.sessionId==="string"?body.sessionId.slice(0,120):null;
    if(!ALLOWED.has(eventType)||!toolId)return NextResponse.json({ok:false},{status:400});

    let userId:string|null=null;
    try{
      const supabase=createClient();
      const {data:{user}}=await supabase.auth.getUser();
      userId=user?.id||null;
    }catch{}

    const admin=createAdminClient();
    await admin.from("tool_events").insert({
      user_id:userId,
      session_id:sessionId,
      tool_id:toolId,
      event_type:eventType,
      metadata:cleanMetadata(body.metadata),
    });
    return NextResponse.json({ok:true});
  }catch{
    return NextResponse.json({ok:false},{status:400});
  }
}
