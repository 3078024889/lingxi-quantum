import "server-only";
import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mailboxTokenHash,parseMailboxAccessCookie,TEMP_MAIL_ACCESS_COOKIE } from "@/lib/tools/temp-mail";

export async function currentTempMailUserId(){
  try{
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    return user?.id||"";
  }catch{return ""}
}

export async function authorizeTempMailbox(req:NextRequest,id:string){
  if(!id)return null;
  const admin=createAdminClient();
  const {data:box}=await admin.from("temp_mailboxes")
    .select("id,local_part,expires_at,destroyed_at,token_hash,owner_user_id,source_kind,batch_quote_id")
    .eq("id",id).maybeSingle();

  if(!box||box.destroyed_at)return null;

  const headerToken=req.headers.get("x-mailbox-token")||"";
  if(headerToken&&box.token_hash===mailboxTokenHash(headerToken))return box;

  const access=parseMailboxAccessCookie(req.cookies.get(TEMP_MAIL_ACCESS_COOKIE)?.value);
  if(access?.id===id&&box.token_hash===mailboxTokenHash(access.token))return box;

  if(box.owner_user_id){
    const userId=await currentTempMailUserId();
    if(userId&&userId===box.owner_user_id)return box;
  }
  return null;
}
