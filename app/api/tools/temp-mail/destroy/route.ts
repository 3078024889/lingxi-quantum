import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { authorizeTempMailbox } from "@/lib/tools/temp-mail-auth";
import { TEMP_MAIL_ACCESS_COOKIE } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const {id}=await req.json().catch(()=>({}));
 if(!id)return NextResponse.json({ok:true});
 const box=await authorizeTempMailbox(req,String(id));
 if(box){
   const admin=createAdminClient();
   await admin.from("temp_mailboxes").delete().eq("id",box.id);
 }
 const response=NextResponse.json({ok:true});
 response.cookies.set({name:TEMP_MAIL_ACCESS_COOKIE,value:"",httpOnly:true,path:"/api/tools/temp-mail",maxAge:0});
 return response;
}
