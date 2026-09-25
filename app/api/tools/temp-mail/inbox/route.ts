import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { authorizeTempMailbox } from "@/lib/tools/temp-mail-auth";

export const runtime="nodejs";
export async function GET(req:NextRequest){
 const url=new URL(req.url),id=url.searchParams.get("id")||"";
 const box=await authorizeTempMailbox(req,id);
 if(!box)return NextResponse.json({error:"MAILBOX_NOT_FOUND"},{status:404});
 if(new Date(box.expires_at).getTime()<=Date.now())return NextResponse.json({expired:true,messages:[],expiresAt:box.expires_at});
 const admin=createAdminClient();
 const {data:messages,error}=await admin.from("temp_mail_messages")
   .select("id,sender,subject,text_body,received_at,size_bytes")
   .eq("mailbox_id",id).order("received_at",{ascending:false}).limit(50);
 if(error)return NextResponse.json({error:"INBOX_READ_FAILED"},{status:500});
 return NextResponse.json({expired:false,expiresAt:box.expires_at,messages:messages||[]});
}
