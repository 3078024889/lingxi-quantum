import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
export const runtime="nodejs";
const TTL=new Set([5,10,60,1440]);
export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const body=await req.json().catch(()=>null) as any;
  if(!body)return NextResponse.json({error:"INVALID_BODY"},{status:400});
  const ciphertext=String(body.ciphertext||""),iv=String(body.iv||""),ttl=Number(body.ttlMinutes);
  if(ciphertext.length<10||ciphertext.length>400_000||iv.length<8||iv.length>100||!TTL.has(ttl))return NextResponse.json({error:"INVALID_NOTE"},{status:400});
  const admin=createAdminClient();
  const ip=(req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
  const rl=await admin.rpc("rate_limit_check",{p_key:`burn-create:${ip}`,p_limit:40,p_window_seconds:3600});
  if(rl.error)return NextResponse.json({error:"RATE_GUARD_UNAVAILABLE"},{status:503});
  if(rl.data!==true)return NextResponse.json({error:"RATE_LIMITED"},{status:429});
  const expiresAt=new Date(Date.now()+ttl*60_000).toISOString();
  const {data,error}=await admin.from("burn_notes").insert({ciphertext,iv,expires_at:expiresAt}).select("id,expires_at").single();
  if(error||!data)return NextResponse.json({error:"NOTE_CREATE_FAILED"},{status:500});
  return NextResponse.json({id:data.id,expiresAt:data.expires_at});
}
