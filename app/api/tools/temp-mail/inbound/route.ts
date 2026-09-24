import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeSecret,tempMailDomain } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export async function POST(req:Request){
  const secret=req.headers.get("x-temp-mail-ingest-secret")||"";
  if(!timingSafeSecret(secret))return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
  const body=await req.json().catch(()=>null) as any;
  if(!body)return NextResponse.json({error:"INVALID_BODY"},{status:400});
  const to=String(body.to||"").trim().toLowerCase();
  const domain=tempMailDomain();
  if(!domain||!to.endsWith("@"+domain))return NextResponse.json({error:"DOMAIN_MISMATCH"},{status:400});
  const localPart=to.slice(0,-domain.length-1);
  if(!/^[a-z0-9]{6,32}$/.test(localPart))return NextResponse.json({error:"INVALID_RECIPIENT"},{status:400});
  const textBody=String(body.text||"").slice(0,200_000);
  const sender=String(body.from||"").slice(0,500);
  const subject=String(body.subject||"(无主题)").slice(0,500);
  const sizeBytes=Number(body.sizeBytes||Buffer.byteLength(textBody,"utf8"));
  if(!Number.isFinite(sizeBytes)||sizeBytes>2_000_000)return NextResponse.json({error:"MESSAGE_TOO_LARGE"},{status:413});

  const admin=createAdminClient();
  const {data:box}=await admin.from("temp_mailboxes").select("id,expires_at,destroyed_at").eq("local_part",localPart).maybeSingle();
  if(!box||box.destroyed_at||new Date(box.expires_at).getTime()<=Date.now())return NextResponse.json({accepted:false});
  const {error}=await admin.from("temp_mail_messages").insert({
    mailbox_id:box.id,sender,subject,text_body:textBody,size_bytes:Math.max(0,Math.floor(sizeBytes)),
  });
  if(error)return NextResponse.json({error:"MESSAGE_STORE_FAILED"},{status:500});
  return NextResponse.json({accepted:true});
}
