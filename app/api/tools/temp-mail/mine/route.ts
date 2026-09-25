import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currentTempMailUserId } from "@/lib/tools/temp-mail-auth";
import { tempMailDomain } from "@/lib/tools/temp-mail";

export const runtime="nodejs";

function codeOf(subject:string,body:string){
 return [...`${subject}\n${body}`.matchAll(/(?:^|\D)(\d{4,8})(?!\d)/g)].map(x=>x[1])[0]||"";
}

export async function GET(){
 const userId=await currentTempMailUserId();
 if(!userId)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const admin=createAdminClient();
 const {data:boxes,error}=await admin.from("temp_mailboxes")
   .select("id,local_part,expires_at,created_at,source_kind")
   .eq("owner_user_id",userId).is("destroyed_at",null)
   .gt("expires_at",new Date().toISOString())
   .order("created_at",{ascending:false}).limit(100);
 if(error)return NextResponse.json({error:"INBOX_READ_FAILED"},{status:500});
 const ids=(boxes||[]).map(x=>x.id);
 const summary:Record<string,{count:number;sender:string;subject:string;receivedAt:string;code:string}>={};
 if(ids.length){
   const {data:messages}=await admin.from("temp_mail_messages")
     .select("mailbox_id,sender,subject,text_body,received_at")
     .in("mailbox_id",ids).order("received_at",{ascending:false}).limit(1000);
   for(const m of messages||[]){
     const s=summary[m.mailbox_id]||{count:0,sender:"",subject:"",receivedAt:"",code:""};
     s.count++;
     if(!s.receivedAt){s.sender=m.sender;s.subject=m.subject;s.receivedAt=m.received_at;s.code=codeOf(m.subject,m.text_body)}
     summary[m.mailbox_id]=s;
   }
 }
 return NextResponse.json({mailboxes:(boxes||[]).map(b=>({
   id:b.id,address:`${b.local_part}@${tempMailDomain()}`,expiresAt:b.expires_at,sourceKind:b.source_kind,
   messageCount:summary[b.id]?.count||0,latestSender:summary[b.id]?.sender||"",latestSubject:summary[b.id]?.subject||"",
   latestAt:summary[b.id]?.receivedAt||"",latestCode:summary[b.id]?.code||"",
 }))});
}
