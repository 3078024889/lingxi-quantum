import { createHash } from "node:crypto";
import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { mailboxTokenHash,randomLocalPart,randomMailboxToken,tempMailConfigured,tempMailDomain,TEMP_MAIL_TTL_MINUTES } from "@/lib/tools/temp-mail";

export const runtime="nodejs";

function identity(req:NextRequest){
  const ip=(req.headers.get("x-forwarded-for")||req.headers.get("x-real-ip")||"unknown").split(",")[0].trim();
  const ua=(req.headers.get("user-agent")||"").slice(0,160);
  return createHash("sha256").update(`${ip}|${ua}`).digest("hex");
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
  if(!tempMailConfigured())return NextResponse.json({error:"SERVICE_UNAVAILABLE"},{status:503});

  const admin=createAdminClient();
  const id=identity(req);

  const guard=await admin.rpc("privacy_rate_limit",{p_key:`temp-mail:${id}`,p_limit:60,p_window_seconds:3600});
  if(guard.error){
    console.error("[temp mail rate guard]",guard.error.code,guard.error.message);
    return NextResponse.json({error:"SERVICE_BUSY"},{status:503});
  }
  if(guard.data!==true)return NextResponse.json({error:"TOO_MANY_REQUESTS"},{status:429});

  const quota=await admin.rpc("consume_temp_mail_free_quota",{p_identity_hash:id,p_limit:10});
  if(quota.error){
    console.error("[temp mail quota]",quota.error.code,quota.error.message);
    return NextResponse.json({error:"SERVICE_BUSY"},{status:503});
  }
  const remaining=Number(quota.data);
  if(remaining<0)return NextResponse.json({error:"FREE_DAILY_LIMIT_REACHED",freeDailyLimit:10},{status:429});

  for(let i=0;i<6;i++){
    const localPart=randomLocalPart(),token=randomMailboxToken();
    const expiresAt=new Date(Date.now()+TEMP_MAIL_TTL_MINUTES*60_000).toISOString();
    const {data,error}=await admin.from("temp_mailboxes").insert({
      local_part:localPart,token_hash:mailboxTokenHash(token),expires_at:expiresAt,
    }).select("id,local_part,expires_at").single();
    if(!error&&data){
      return NextResponse.json({
        id:data.id,address:`${data.local_part}@${tempMailDomain()}`,
        token,expiresAt:data.expires_at,ttlMinutes:TEMP_MAIL_TTL_MINUTES,
        freeRemaining:remaining,
      });
    }
    if(error?.code!=="23505"){
      console.error("[temp mail create]",error?.code,error?.message);
      return NextResponse.json({error:"CREATE_FAILED"},{status:500});
    }
  }
  return NextResponse.json({error:"PLEASE_RETRY"},{status:503});
}
