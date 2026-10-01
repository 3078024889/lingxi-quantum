import{NextRequest,NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{
 extractEmailAddress,htmlToPlain,mergeSupportContext,supportLifecycle,
 ticketIdFromRecipients,trimReply,verifyResendWebhook
}from"@/lib/support/lifecycle";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function adminEmails(){
 return new Set(
  (process.env.LINGXIFIELD_SUPPORT_ADMIN_EMAILS||process.env.LINGXIFIELD_SUPPORT_NOTIFY_EMAIL||"3604744994@qq.com")
   .split(",").map(x=>x.trim().toLowerCase()).filter(Boolean)
 );
}
async function retrieveReceivedEmail(id:string){
 const key=process.env.RESEND_API_KEY;
 if(!key)return null;
 const r=await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(id)}`,{
  headers:{authorization:`Bearer ${key}`},cache:"no-store"
 });
 if(!r.ok)return null;
 return await r.json().catch(()=>null);
}
async function sendMail(to:string,subject:string,text:string,replyTo?:string|null,idempotencyKey?:string){
 const key=process.env.RESEND_API_KEY;
 if(!key)return false;
 const from=process.env.LINGXIFIELD_SUPPORT_FROM_EMAIL||"灵犀场 <support@lingxifield.com>";
 const r=await fetch("https://api.resend.com/emails",{
  method:"POST",
  headers:{authorization:`Bearer ${key}`,"content-type":"application/json",...(idempotencyKey?{"Idempotency-Key":idempotencyKey}:{})},
  body:JSON.stringify({from,to:[to],reply_to:replyTo||undefined,subject,text})
 });
 return r.ok;
}
function replyText(full:any){
 const text=trimReply(String(full?.text||""));
 if(text)return text;
 return trimReply(htmlToPlain(String(full?.html||"")));
}
function replyAddress(ticketId:string){
 const domain=(process.env.LINGXIFIELD_SUPPORT_INBOUND_DOMAIN||"").trim().replace(/^@/,"");
 return domain?`ticket-${ticketId}@${domain}`:null;
}
async function save(a:any,ticket:any,patch:any,status?:string){
 const context=mergeSupportContext(ticket.context,patch);
 const update:any={context,updated_at:new Date().toISOString()};
 if(status)update.status=status;
 const r=await a.from("lingxifield_support_tickets").update(update).eq("id",ticket.id);
 if(r.error)throw r.error;
 return context;
}

export async function POST(req:NextRequest){
 const payload=await req.text();
 if(!verifyResendWebhook(payload,req.headers))return NextResponse.json({error:"INVALID_WEBHOOK_SIGNATURE"},{status:401});

 let event:any;
 try{event=JSON.parse(payload)}catch{return NextResponse.json({error:"INVALID_JSON"},{status:400})}
 const a=createAdminClient();

 // Opening the original support notification is a useful "viewed" signal.
 if(event?.type==="email.opened"&&event?.data?.email_id){
  const emailId=String(event.data.email_id);
  const {data}=await a.from("lingxifield_support_tickets")
   .select("id,status,context")
   .eq("context->support->lifecycle->>notifyEmailId",emailId).limit(1).maybeSingle();
  if(data){
   const life=supportLifecycle(data.context);
   if(!life.viewedAt)await save(a,data,{viewedAt:new Date().toISOString()});
  }
  return NextResponse.json({ok:true});
 }

 if(event?.type!=="email.received")return NextResponse.json({ok:true,ignored:true});

 const emailId=String(event?.data?.email_id||"");
 const ticketId=ticketIdFromRecipients(event?.data?.to);
 if(!emailId||!ticketId)return NextResponse.json({ok:true,ignored:"NO_TICKET_REFERENCE"});

 const {data:ticket,error}=await a.from("lingxifield_support_tickets")
  .select("id,status,contact,title,message,route,context").eq("id",ticketId).maybeSingle();
 if(error||!ticket)return NextResponse.json({ok:true,ignored:"TICKET_NOT_FOUND"});

 const life=supportLifecycle(ticket.context);
 if((life.processedInboundIds||[]).includes(emailId))return NextResponse.json({ok:true,deduplicated:true});

 const sender=extractEmailAddress(String(event?.data?.from||""));
 const admins=adminEmails();
 const isAgent=admins.has(sender);
 const isCustomer=sender&&sender===String(ticket.contact||"").trim().toLowerCase();
 if(!isAgent&&!isCustomer)return NextResponse.json({ok:true,ignored:"UNTRUSTED_SENDER"});

 const full=await retrieveReceivedEmail(emailId);
 const body=replyText(full)||"(邮件回复已收到)";
 const now=new Date().toISOString();
 const processed=[...(life.processedInboundIds||[]),emailId].slice(-100);
 const inbound=replyAddress(ticketId);
 const subject=`Re: [灵犀场问题] ${ticketId.slice(0,8)} [LX:${ticketId}]`;

 if(isAgent){
  const ok=await sendMail(String(ticket.contact||""),subject,body,inbound,`support-agent-reply/${emailId}`);
  if(!ok)return NextResponse.json({error:"FORWARD_FAILED"},{status:502});
  await save(a,ticket,{
   viewedAt:life.viewedAt||now,
   processingAt:life.processingAt||now,
   lastReplyAt:now,lastReplySource:"agent",lastReplyPreview:body.slice(0,800),
   processedInboundIds:processed
  },"reviewing");
  return NextResponse.json({ok:true,role:"agent",forwarded:true});
 }

 const notify=process.env.LINGXIFIELD_SUPPORT_NOTIFY_EMAIL||"3604744994@qq.com";
 const ok=await sendMail(notify,subject,body,inbound,`support-customer-reply/${emailId}`);
 if(!ok)return NextResponse.json({error:"NOTIFY_FAILED"},{status:502});
 await save(a,ticket,{
  viewedAt:life.viewedAt||now,
  processingAt:life.processingAt||now,
  lastReplyAt:now,lastReplySource:"customer",lastReplyPreview:body.slice(0,800),
  processedInboundIds:processed
 },"reviewing");
 return NextResponse.json({ok:true,role:"customer",notified:true});
}
