import {toolPassCutoverRequested,toolPassBackendReady} from "@/lib/tools/commerce/tool-server-receipt";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { mailboxTokenHash,randomLocalPart,randomMailboxToken,tempMailConfigured,tempMailAddress,TEMP_MAIL_TTL_MINUTES } from "@/lib/tools/temp-mail";

export const runtime="nodejs";
export const maxDuration=30;

export async function POST(req:NextRequest){
  const contentLength=Number(req.headers.get("content-length")||0);
  if(Number.isFinite(contentLength)&&contentLength>16*1024)return NextResponse.json({error:"TEMP_MAIL_BATCH_REQUEST_TOO_LARGE"},{status:413});
  if(!isSameOriginMutation(req))return NextResponse.json({error:"REQUEST_REJECTED"},{status:403});
 if(!tempMailConfigured())return NextResponse.json({error:"SERVICE_UNAVAILABLE"},{status:503});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"SIGN_IN_REQUIRED"},{status:401});
 const body=await req.json().catch(()=>null) as {
  count?:number;quoteId?:string;accessRequestId?:string;operationId?:string
 }|null;
 const count=Number(body?.count),quoteId=String(body?.quoteId||"");
 if(!Number.isSafeInteger(count)||count<11||count>100)return NextResponse.json({error:"BATCH_SIZE_INVALID"},{status:400});
 if(toolPassCutoverRequested()&&!quoteId){
  if(!toolPassBackendReady())return NextResponse.json({error:"TOOL_PASS_BACKEND_NOT_READY"},{status:503});
  const requestId=String(body?.accessRequestId||"");
  const operationId=String(body?.operationId||"");
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if(!uuid.test(requestId)||!uuid.test(operationId))
   return NextResponse.json({error:"PASS_MAIL_RECEIPT_REQUIRED"},{status:403});
  const abuse=await enforceAbuseGuard(req,{
   scope:"tool-pass-temp-mail-batch",userId:user.id,accountLimit:12,ipLimit:40,
   windowSeconds:3600
  });
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
  const admin=createAdminClient();
  for(let attempt=0;attempt<3;attempt++){
   const unique=new Set<string>();
   const entries=[] as {local_part:string;token_hash:string}[];
   for(let i=0;i<count;i++){
    let localPart="";
    for(let n=0;n<6;n++){
     localPart=randomLocalPart();
     if(localPart.length>=6&&!unique.has(localPart))break;
    }
    if(localPart.length<6||unique.has(localPart))
     return NextResponse.json({error:"MAILBOX_GENERATION_UNAVAILABLE"},{status:503});
    unique.add(localPart);
    entries.push({local_part:localPart,token_hash:mailboxTokenHash(randomMailboxToken())});
   }
   const {data,error}=await admin.rpc("lingxi_create_pass_mail_batch",{
    p_request_id:requestId,p_user_id:user.id,p_operation_id:operationId,
    p_count:count,p_entries:entries
   });
   if(error){
    // An index collision rolls back the complete PostgreSQL transaction,
    // including its stage redemption. Retry with freshly generated IDs.
    if(error.code==="23505"&&attempt<2)continue;
    console.error("[pass-mail-batch]",error.code);
    return NextResponse.json({error:"BATCH_CREATE_UNAVAILABLE"},{status:503});
   }
   if(!data?.ok){
    const code=String(data?.error||"BATCH_CREATE_UNAVAILABLE");
    const status=code==="PASS_MAIL_DAILY_LIMIT"?429:
     code==="PASS_MAIL_PAID_BATCH_REQUIRED"?402:
     code==="PASS_MAIL_INPUT_INVALID"?400:409;
    return NextResponse.json({error:code},{status});
   }
   const rows=(Array.isArray(data.mailboxes)?data.mailboxes:[])
    .map((m:any)=>({id:m.id,address:tempMailAddress(m.localPart),expiresAt:m.expiresAt}));
   if(rows.length!==count)return NextResponse.json({error:"BATCH_INCOMPLETE"},{status:503});
   return NextResponse.json({mailboxes:rows,count,recovered:Boolean(data.recovered)},
    {headers:{"Cache-Control":"private, no-store"}});
  }
  return NextResponse.json({error:"BATCH_CREATE_UNAVAILABLE"},{status:503});
 }
 // An already PAID legacy quote continues to work during the cutover.
 // The new quote creation endpoints are retired; no new old-style charge.
 if(!quoteId)return NextResponse.json({error:"PAID_BATCH_REQUIRED"},{status:402});

 const admin=createAdminClient();
 const {data:quote,error:quoteError}=await admin.from("tool_payment_quotes")
   .select("id,user_id,tool_id,quantity,status").eq("id",quoteId).eq("user_id",user.id)
   .eq("tool_id","temp-mail-batch").eq("status","paid").maybeSingle();
 if(quoteError){console.error("[temp mail batch quote]",quoteError.code,quoteError.message);return NextResponse.json({error:"SERVICE_BUSY"},{status:503})}
 if(!quote||Number(quote.quantity)!==count)return NextResponse.json({error:"PAID_BATCH_REQUIRED"},{status:402});

 const claim=await admin.rpc("claim_temp_mail_batch_quote",{p_quote_id:quoteId,p_user_id:user.id,p_count:count});
 if(claim.error){console.error("[temp mail batch claim]",claim.error.code,claim.error.message);return NextResponse.json({error:"SERVICE_BUSY"},{status:503})}
 if(claim.data!==true){
   const {data:existing}=await admin.from("temp_mailboxes").select("id,local_part,expires_at").eq("batch_quote_id",quoteId).eq("owner_user_id",user.id);
   if(existing?.length===count)return NextResponse.json({recovered:true,count,mailboxes:existing.map(x=>({id:x.id,address:tempMailAddress(x.local_part),expiresAt:x.expires_at}))});
   return NextResponse.json({error:"BATCH_ALREADY_USED"},{status:409});
 }

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
       if(!error&&data){output.push({id:data.id,address:tempMailAddress(data.local_part),expiresAt:data.expires_at});created=true;break}
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
