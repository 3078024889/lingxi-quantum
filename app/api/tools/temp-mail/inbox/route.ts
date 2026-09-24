import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mailboxTokenHash } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export async function GET(req:Request){
  const url=new URL(req.url),id=url.searchParams.get("id")||"",token=req.headers.get("x-mailbox-token")||"";
  if(!id||!token)return NextResponse.json({error:"MAILBOX_TOKEN_REQUIRED"},{status:401});
  const admin=createAdminClient();
  const {data:box}=await admin.from("temp_mailboxes").select("id,local_part,expires_at,destroyed_at,token_hash").eq("id",id).maybeSingle();
  if(!box||box.token_hash!==mailboxTokenHash(token)||box.destroyed_at)return NextResponse.json({error:"MAILBOX_NOT_FOUND"},{status:404});
  if(new Date(box.expires_at).getTime()<=Date.now())return NextResponse.json({expired:true,messages:[],expiresAt:box.expires_at});
  const {data:messages,error}=await admin.from("temp_mail_messages")
    .select("id,sender,subject,text_body,received_at,size_bytes")
    .eq("mailbox_id",id).order("received_at",{ascending:false}).limit(50);
  if(error)return NextResponse.json({error:"INBOX_READ_FAILED"},{status:500});
  return NextResponse.json({expired:false,expiresAt:box.expires_at,messages:messages||[]});
}
