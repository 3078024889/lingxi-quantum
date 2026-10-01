import crypto from "node:crypto";

export type SupportStage=0|1|2|3;
export type SupportLifecycle={
 receivedAt?:string|null;
 viewedAt?:string|null;
 processingAt?:string|null;
 completedAt?:string|null;
 lastReplyAt?:string|null;
 lastReplySource?:"agent"|"customer"|null;
 lastReplyPreview?:string|null;
 notifyEmailId?:string|null;
 processedInboundIds?:string[];
};

export function supportLifecycle(context:any):SupportLifecycle{
 const x=context?.support?.lifecycle;
 return x&&typeof x==="object"?x:{};
}

export function supportStage(ticket:any):SupportStage{
 const life=supportLifecycle(ticket?.context);
 if(life.completedAt||ticket?.status==="fixed"||ticket?.status==="closed")return 3;
 if(life.processingAt||ticket?.status==="reviewing"||ticket?.status==="processing")return 2;
 if(life.viewedAt||ticket?.status==="viewed")return 1;
 return 0;
}

export function mergeSupportContext(context:any,patch:Partial<SupportLifecycle>){
 const base=context&&typeof context==="object"?context:{};
 const support=base.support&&typeof base.support==="object"?base.support:{};
 const lifecycle={...(support.lifecycle||{}),...patch};
 return{...base,support:{...support,lifecycle}};
}

function actionSecret(){
 return process.env.LINGXIFIELD_SUPPORT_ACTION_SECRET||"";
}
export function makeSupportActionToken(ticketId:string,action:string){
 const secret=actionSecret();
 if(!secret)return null;
 return crypto.createHmac("sha256",secret).update(`${ticketId}:${action}`).digest("base64url");
}
export function verifySupportActionToken(ticketId:string,action:string,token:string){
 const expected=makeSupportActionToken(ticketId,action);
 if(!expected||!token)return false;
 const a=Buffer.from(expected),b=Buffer.from(token);
 return a.length===b.length&&crypto.timingSafeEqual(a,b);
}

export function extractEmailAddress(value:string){
 const m=String(value||"").match(/<([^>]+)>/);
 return (m?m[1]:String(value||"")).trim().toLowerCase();
}

export function ticketIdFromRecipients(to:unknown){
 const items=Array.isArray(to)?to:[to];
 for(const raw of items){
  const s=String(raw||"");
  const m=s.match(/ticket-([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})@/i);
  if(m)return m[1].toLowerCase();
 }
 return null;
}

export function supportInboundAddress(ticketId:string){
 const domain=(process.env.LINGXIFIELD_SUPPORT_INBOUND_DOMAIN||"").trim().replace(/^@/,"");
 if(!domain)return null;
 return `ticket-${ticketId}@${domain}`;
}

function webhookSecretBytes(secret:string){
 const raw=secret.startsWith("whsec_")?secret.slice(6):secret;
 try{return Buffer.from(raw,"base64")}catch{return Buffer.from(raw)}
}

export function verifyResendWebhook(payload:string,headers:Headers){
 const secret=process.env.RESEND_WEBHOOK_SECRET||process.env.LINGXIFIELD_SUPPORT_WEBHOOK_SECRET||"";
 if(!secret)return false;
 const id=headers.get("svix-id")||"";
 const ts=headers.get("svix-timestamp")||"";
 const sig=headers.get("svix-signature")||"";
 if(!id||!ts||!sig)return false;
 const n=Number(ts);
 if(!Number.isFinite(n)||Math.abs(Date.now()/1000-n)>300)return false;
 const signed=`${id}.${ts}.${payload}`;
 const expected=crypto.createHmac("sha256",webhookSecretBytes(secret)).update(signed).digest("base64");
 for(const part of sig.split(/\s+/)){
  const m=part.match(/^v1,(.+)$/);
  if(!m)continue;
  const a=Buffer.from(expected),b=Buffer.from(m[1]);
  if(a.length===b.length&&crypto.timingSafeEqual(a,b))return true;
 }
 return false;
}

export function htmlToPlain(html:string){
 return String(html||"")
  .replace(/<style[\s\S]*?<\/style>/gi," ")
  .replace(/<script[\s\S]*?<\/script>/gi," ")
  .replace(/<br\s*\/?>/gi,"\n")
  .replace(/<\/p>/gi,"\n")
  .replace(/<[^>]+>/g," ")
  .replace(/&nbsp;/g," ")
  .replace(/&amp;/g,"&")
  .replace(/&lt;/g,"<")
  .replace(/&gt;/g,">")
  .replace(/&#39;/g,"'")
  .replace(/&quot;/g,'"')
  .replace(/\n{3,}/g,"\n\n")
  .trim();
}

export function trimReply(text:string){
 const s=String(text||"").replace(/\r\n/g,"\n").trim();
 const cut=s.split(/\n(?:On .+ wrote:|在 .+ 写道：|From: .+|发件人：.+)/i)[0].trim();
 return (cut||s).slice(0,12000);
}
