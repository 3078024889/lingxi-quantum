import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { mailboxTokenHash,TEMP_MAIL_MAX_LIFETIME_MINUTES,TEMP_MAIL_TTL_MINUTES } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const {id,token}=await req.json().catch(()=>({}));
  if(!id||!token)return NextResponse.json({error:"MAILBOX_TOKEN_REQUIRED"},{status:401});
  const admin=createAdminClient();
  const {data:box}=await admin.from("temp_mailboxes").select("id,created_at,expires_at,destroyed_at,token_hash").eq("id",String(id)).maybeSingle();
  if(!box||box.destroyed_at||box.token_hash!==mailboxTokenHash(String(token)))return NextResponse.json({error:"MAILBOX_NOT_FOUND"},{status:404});
  const cap=new Date(box.created_at).getTime()+TEMP_MAIL_MAX_LIFETIME_MINUTES*60_000;
  const base=Math.max(Date.now(),new Date(box.expires_at).getTime());
  const next=Math.min(cap,base+TEMP_MAIL_TTL_MINUTES*60_000);
  if(next<=Date.now())return NextResponse.json({error:"MAILBOX_MAX_LIFETIME"},{status:409});
  const expiresAt=new Date(next).toISOString();
  const {error}=await admin.from("temp_mailboxes").update({expires_at:expiresAt}).eq("id",box.id);
  if(error)return NextResponse.json({error:"MAILBOX_EXTEND_FAILED"},{status:500});
  return NextResponse.json({expiresAt});
}
