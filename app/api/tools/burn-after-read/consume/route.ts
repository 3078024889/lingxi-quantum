import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
export const runtime="nodejs";
export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const {id}=await req.json().catch(()=>({}));
  if(!id)return NextResponse.json({error:"NOTE_ID_REQUIRED"},{status:400});
  const admin=createAdminClient();
  const now=new Date().toISOString();
  const {data,error}=await admin.from("burn_notes")
    .update({consumed_at:now})
    .eq("id",String(id)).is("consumed_at",null).gt("expires_at",now)
    .select("ciphertext,iv,expires_at").maybeSingle();
  if(error)return NextResponse.json({error:"NOTE_READ_FAILED"},{status:500});
  if(!data)return NextResponse.json({error:"NOTE_GONE"},{status:410});
  // Remove ciphertext immediately after the atomic consume response has been assembled.
  const payload={ciphertext:data.ciphertext,iv:data.iv,expiresAt:data.expires_at};
  await admin.from("burn_notes").delete().eq("id",String(id));
  return NextResponse.json(payload);
}
