import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { mailboxTokenHash,randomLocalPart,randomMailboxToken,tempMailConfigured,tempMailDomain,TEMP_MAIL_TTL_MINUTES } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  if(!tempMailConfigured())return NextResponse.json({error:"TEMP_MAIL_NOT_CONFIGURED"},{status:503});
  const admin=createAdminClient();
  const ip=(req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
  const rl=await admin.rpc("rate_limit_check",{p_key:`temp-mail-create:${ip}`,p_limit:40,p_window_seconds:3600});
  if(rl.error)return NextResponse.json({error:"RATE_GUARD_UNAVAILABLE"},{status:503});
  if(rl.data!==true)return NextResponse.json({error:"RATE_LIMITED"},{status:429});

  for(let i=0;i<5;i++){
    const localPart=randomLocalPart(),token=randomMailboxToken();
    const expiresAt=new Date(Date.now()+TEMP_MAIL_TTL_MINUTES*60_000).toISOString();
    const {data,error}=await admin.from("temp_mailboxes").insert({
      local_part:localPart,token_hash:mailboxTokenHash(token),expires_at:expiresAt,
    }).select("id,local_part,expires_at").single();
    if(!error&&data){
      return NextResponse.json({
        id:data.id,address:`${data.local_part}@${tempMailDomain()}`,
        token,expiresAt:data.expires_at,ttlMinutes:TEMP_MAIL_TTL_MINUTES,
      });
    }
    if(error?.code!=="23505")return NextResponse.json({error:"MAILBOX_CREATE_FAILED"},{status:500});
  }
  return NextResponse.json({error:"MAILBOX_CREATE_RETRY"},{status:503});
}
