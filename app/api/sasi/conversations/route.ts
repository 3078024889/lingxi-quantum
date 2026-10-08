import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const noCache={"Cache-Control":"private, no-store"} as const;
async function userId(){
 const {data:{user}}=await createClient().auth.getUser();
 return user?.id||null;
}
export async function GET(){
 const user=await userId();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401,headers:noCache});
 const db=createAdminClient();
 const {data:threads,error}=await db.from("sasi_conversation_threads")
  .select("id,title,updated_at").eq("user_id",user).order("updated_at",{ascending:false}).limit(20);
 if(error)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
 const latest=threads?.[0];
 if(!latest)return NextResponse.json({threadId:null,threads:[],messages:[]},{headers:noCache});
 const {data:messages,error:messagesError}=await db.from("sasi_conversation_messages")
  .select("id,role,content,created_at").eq("user_id",user).eq("thread_id",latest.id)
  .in("role",["user","assistant"]).order("created_at",{ascending:false}).limit(80);
 if(messagesError)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
 return NextResponse.json({threadId:latest.id,threads:threads||[],messages:(messages||[]).reverse()},{headers:noCache});
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:noCache});
 const user=await userId();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401,headers:noCache});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-chat-history",userId:user,accountLimit:80,ipLimit:240,windowSeconds:3600});
 if(!guard.ok)return NextResponse.json({error:"TOO_MANY_REQUESTS"},{status:429,headers:noCache});
 let body:Record<string,unknown>;
 try{body=await boundedRequestJson(req,64*1024) as Record<string,unknown>}catch{return NextResponse.json({error:"INVALID_REQUEST"},{status:400,headers:noCache})}
 const threadId=String(body?.threadId||""), requestId=String(body?.requestId||"");
 const question=typeof body?.question==="string"?body.question.trim():"";
 const answer=typeof body?.answer==="string"?body.answer.trim():"";
 if(!UUID.test(threadId)||!UUID.test(requestId)||!question||question.length>12000||!answer||answer.length>24000)
  return NextResponse.json({error:"INVALID_HISTORY"},{status:400,headers:noCache});
 const db=createAdminClient();
 const {data:existing,error:threadError}=await db.from("sasi_conversation_threads")
  .select("id,user_id").eq("id",threadId).maybeSingle();
 if(threadError)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
 if(existing&&existing.user_id!==user)return NextResponse.json({error:"HISTORY_NOT_FOUND"},{status:404,headers:noCache});
 if(!existing){
  const {error}=await db.from("sasi_conversation_threads").insert({id:threadId,user_id:user,title:question.slice(0,120),active_mode:"chat"});
  if(error?.code==="23505")return NextResponse.json({error:"HISTORY_CONFLICT"},{status:409,headers:noCache});
  if(error)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
 }
 const {data:duplicate,error:dupeError}=await db.from("sasi_conversation_messages")
  .select("id,content").eq("id",requestId).eq("user_id",user).eq("thread_id",threadId).maybeSingle();
 if(dupeError)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
 if(duplicate){
  if(duplicate.content!==question)return NextResponse.json({error:"HISTORY_CONFLICT"},{status:409,headers:noCache});
  return NextResponse.json({ok:true,threadId,duplicate:true},{headers:noCache});
 }
 const {error:insertError}=await db.from("sasi_conversation_messages").insert([
  {id:requestId,thread_id:threadId,user_id:user,role:"user",mode:"chat",state:"complete",content:question},
  {thread_id:threadId,user_id:user,parent_id:requestId,role:"assistant",mode:"chat",state:"complete",content:answer}
 ]);
 if(insertError?.code==="23505")return NextResponse.json({error:"HISTORY_CONFLICT"},{status:409,headers:noCache});
 if(insertError)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
 await db.from("sasi_conversation_threads").update({updated_at:new Date().toISOString()}).eq("id",threadId).eq("user_id",user);
 return NextResponse.json({ok:true,threadId},{status:201,headers:noCache});
}
