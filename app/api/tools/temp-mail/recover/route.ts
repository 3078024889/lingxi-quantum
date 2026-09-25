import { NextRequest,NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentTempMailUserId } from "@/lib/tools/temp-mail-auth";
import { mailboxTokenHash,parseMailboxAccessCookie,tempMailDomain,TEMP_MAIL_ACCESS_COOKIE } from "@/lib/tools/temp-mail";

export const runtime="nodejs";

export async function GET(req:NextRequest){
 const admin=createAdminClient();
 const access=parseMailboxAccessCookie(req.cookies.get(TEMP_MAIL_ACCESS_COOKIE)?.value);
 if(access){
   const {data:box}=await admin.from("temp_mailboxes")
     .select("id,local_part,expires_at,destroyed_at,token_hash")
     .eq("id",access.id).maybeSingle();
   if(box&&!box.destroyed_at&&new Date(box.expires_at).getTime()>Date.now()&&box.token_hash===mailboxTokenHash(access.token)){
     return NextResponse.json({box:{id:box.id,address:`${box.local_part}@${tempMailDomain()}`,expiresAt:box.expires_at}});
   }
 }
 const userId=await currentTempMailUserId();
 if(userId){
   const {data:box}=await admin.from("temp_mailboxes")
     .select("id,local_part,expires_at")
     .eq("owner_user_id",userId).is("destroyed_at",null)
     .gt("expires_at",new Date().toISOString())
     .order("created_at",{ascending:false}).limit(1).maybeSingle();
   if(box)return NextResponse.json({box:{id:box.id,address:`${box.local_part}@${tempMailDomain()}`,expiresAt:box.expires_at}});
 }
 const response=NextResponse.json({box:null});
 response.cookies.set({name:TEMP_MAIL_ACCESS_COOKIE,value:"",httpOnly:true,path:"/api/tools/temp-mail",maxAge:0});
 return response;
}
