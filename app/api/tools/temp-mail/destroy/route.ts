import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { authorizeTempMailbox } from "@/lib/tools/temp-mail-auth";
import { TEMP_MAIL_ACCESS_COOKIE } from "@/lib/tools/temp-mail";

export const runtime="nodejs";

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const body=await req.json().catch(()=>null);
 const id=typeof body?.id==="string"?body.id:"";
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
   return NextResponse.json({error:"MAILBOX_ID_INVALID"},{status:400});
 const box=await authorizeTempMailbox(req,id);
 if(!box)return NextResponse.json({error:"MAILBOX_NOT_FOUND"},{status:404});

 // Success is reported only after PostgreSQL confirms the mailbox was deleted.
 // A swallowed DB error or missing authorization must never be shown as deletion.
 const admin=createAdminClient();
 const {data,error}=await admin.from("temp_mailboxes").delete().eq("id",box.id).select("id").maybeSingle();
 if(error)return NextResponse.json({error:"MAILBOX_DELETE_FAILED"},{status:503});
 if(!data)return NextResponse.json({error:"MAILBOX_NOT_FOUND"},{status:404});
 const response=NextResponse.json({ok:true});
 response.cookies.set({name:TEMP_MAIL_ACCESS_COOKIE,value:"",httpOnly:true,path:"/api/tools/temp-mail",maxAge:0});
 return response;
}
