import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { authorizeTempMailbox } from "@/lib/tools/temp-mail-auth";
import { TEMP_MAIL_MAX_LIFETIME_MINUTES,TEMP_MAIL_TTL_MINUTES,TEMP_MAIL_ACCESS_COOKIE } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const {id}=await req.json().catch(()=>({}));
 if(!id)return NextResponse.json({error:"MAILBOX_REQUIRED"},{status:400});
 const box=await authorizeTempMailbox(req,String(id));
 if(!box)return NextResponse.json({error:"MAILBOX_NOT_FOUND"},{status:404});
 const admin=createAdminClient();
 const {data:full}=await admin.from("temp_mailboxes").select("id,created_at,expires_at").eq("id",box.id).single();
 if(!full)return NextResponse.json({error:"MAILBOX_NOT_FOUND"},{status:404});
 const cap=new Date(full.created_at).getTime()+TEMP_MAIL_MAX_LIFETIME_MINUTES*60_000;
 const base=Math.max(Date.now(),new Date(full.expires_at).getTime());
 const next=Math.min(cap,base+TEMP_MAIL_TTL_MINUTES*60_000);
 if(next<=Date.now())return NextResponse.json({error:"MAILBOX_MAX_LIFETIME"},{status:409});
 const expiresAt=new Date(next).toISOString();
 const {error}=await admin.from("temp_mailboxes").update({expires_at:expiresAt}).eq("id",full.id);
 if(error)return NextResponse.json({error:"MAILBOX_EXTEND_FAILED"},{status:500});
 const response=NextResponse.json({expiresAt});
 // Keep anonymous recovery alive for the extended mailbox lifetime.
 const existing=req.cookies.get(TEMP_MAIL_ACCESS_COOKIE)?.value;
 if(existing)response.cookies.set({name:TEMP_MAIL_ACCESS_COOKIE,value:existing,httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/api/tools/temp-mail",maxAge:TEMP_MAIL_MAX_LIFETIME_MINUTES*60});
 return response;
}
