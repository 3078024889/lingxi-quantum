import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { mailboxTokenHash } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const {id,token}=await req.json().catch(()=>({}));
  if(!id||!token)return NextResponse.json({error:"MAILBOX_TOKEN_REQUIRED"},{status:401});
  const admin=createAdminClient();
  const {data:box}=await admin.from("temp_mailboxes").select("id,token_hash").eq("id",String(id)).maybeSingle();
  if(!box||box.token_hash!==mailboxTokenHash(String(token)))return NextResponse.json({ok:true});
  await admin.from("temp_mailboxes").delete().eq("id",box.id);
  return NextResponse.json({ok:true});
}
