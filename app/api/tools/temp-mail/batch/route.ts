import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { mailboxTokenHash,randomLocalPart,randomMailboxToken,tempMailConfigured,tempMailDomain,TEMP_MAIL_TTL_MINUTES } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export const maxDuration=30;

export async function POST(req:NextRequest){
  const contentLength=Number(req.headers.get("content-length")||0);
  if(Number.isFinite(contentLength)&&contentLength>16*1024)return NextResponse.json({error:"TEMP_MAIL_BATCH_REQUEST_TOO_LARGE"},{status:413});
  if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
 if(!tempMailConfigured())return NextResponse.json({error:"SERVICE_UNAVAILABLE"},{status:503});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>null) as {count?:number;quoteId?:string}|null;
 const count=Math.floor(Number(body?.count)),quoteId=String(body?.quoteId||"");
 if(!Number.isFinite(count)||count<11||count>100)return NextResponse.json({error:"BATCH_SIZE_INVALID"},{status:400});
 if(!quoteId)return NextResponse.json({error:"PAID_BATCH_REQUIRED"},{status:402});

 const admin=createAdminClient();
 const {data:quote,error:quoteError}=await admin.from("tool_payment_quotes")
   .select("id,user_id,tool_id,quantity,status").eq("id",quoteId).eq("user_id",user.id)
   .eq("tool_id","temp-mail-batch").eq("status","paid").maybeSingle();
 if(quoteError){console.error("[temp mail batch quote]",quoteError.code,quoteError.message);return NextResponse.json({error:"SERVICE_BUSY"},{status:503})}
 if(!quote||Number(quote.quantity)!==count)return NextResponse.json({error:"PAID_BATCH_REQUIRED"},{status:402});

 const claim=await admin.rpc("claim_temp_mail_batch_quote",{p_quote_id:quoteId,p_user_id:user.id,p_count:count});
 if(claim.error){console.error("[temp mail batch claim]",claim.error.code,claim.error.message);return NextResponse.json({error:"SERVICE_BUSY"},{status:503})}
 if(claim.data!==true)return NextResponse.json({error:"BATCH_ALREADY_USED"},{status:409});

 const guard=await admin.rpc("privacy_rate_limit",{p_key:`temp-mail-batch:${user.id}`,p_limit:30,p_window_seconds:3600});
 if(guard.error||guard.data!==true){
   await admin.from("temp_mail_batch_uses").delete().eq("quote_id",quoteId).eq("user_id",user.id);
   return NextResponse.json({error:guard.error?"SERVICE_BUSY":"TOO_MANY_REQUESTS"},{status:guard.error?503:429});
 }

 const output:{id:string;address:string;expiresAt:string}[]=[];
 try{
   for(let n=0;n<count;n++){
     let created=false;
     for(let retry=0;retry<5;retry++){
       const localPart=randomLocalPart(),token=randomMailboxToken(),expiresAt=new Date(Date.now()+TEMP_MAIL_TTL_MINUTES*60_000).toISOString();
       const {data,error}=await admin.from("temp_mailboxes").insert({
         local_part:localPart,token_hash:mailboxTokenHash(token),expires_at:expiresAt,
         owner_user_id:user.id,source_kind:"batch",batch_quote_id:quoteId,
       }).select("id,local_part,expires_at").single();
       if(!error&&data){output.push({id:data.id,address:`${data.local_part}@${tempMailDomain()}`,expiresAt:data.expires_at});created=true;break}
       if(error?.code!=="23505")throw new Error(error?.message||"BATCH_CREATE_FAILED");
     }
     if(!created)throw new Error("BATCH_CREATE_RETRY");
   }
   return NextResponse.json({mailboxes:output,count:output.length});
 }catch(e){
   console.error("[temp mail batch create]",e instanceof Error?e.message:"unknown");
   if(output.length)await admin.from("temp_mailboxes").delete().in("id",output.map(x=>x.id)).eq("owner_user_id",user.id);
   await admin.from("temp_mail_batch_uses").delete().eq("quote_id",quoteId).eq("user_id",user.id);
   return NextResponse.json({error:"BATCH_CREATE_FAILED"},{status:503});
 }
}
