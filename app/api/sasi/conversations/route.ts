import {saveConversationTurn} from "@/lib/sasi/core/conversation-store";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const noCache={"Cache-Control":"private, no-store"} as const;
async function userId(){
 const {data:{user}}=await createClient().auth.getUser();
 return user?.id||null;
}
export async function GET(req:NextRequest){
 const user=await userId();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401,headers:noCache});
 const db=createAdminClient();
 const {data:threads,error}=await db.from("sasi_conversation_threads")
  .select("id,title,updated_at,active_mode,project_id").eq("user_id",user).order("updated_at",{ascending:false}).limit(20);
 if(error)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
 const selected=req.nextUrl.searchParams.get("threadId");
 if(selected&&!UUID.test(selected))return NextResponse.json({error:"INVALID_THREAD"},{status:400,headers:noCache});
 if(!selected&&req.nextUrl.searchParams.get('fresh')==='1')return NextResponse.json({ownerId:user,threadId:null,workspace:{},threads:threads||[],messages:[]},{headers:noCache});
 const latest=threads?.[0];
 if(!latest&&!selected)return NextResponse.json({ownerId:user,threadId:null,threads:[],messages:[]},{headers:noCache});
 const threadId=selected||latest?.id;
 // Explicitly verify ownership even for older threads not present in the latest 20.
 if(selected){
  const {data:owned,error:ownershipError}=await db.from("sasi_conversation_threads")
   .select("id").eq("user_id",user).eq("id",selected).maybeSingle();
  if(ownershipError)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
  if(!owned)return NextResponse.json({error:"HISTORY_NOT_FOUND"},{status:404,headers:noCache});
 }
 const {data:messages,error:messagesError}=await db.from("sasi_conversation_messages")
  .select("id,parent_id,role,content,mode,project_id,model_info,state,created_at").eq("user_id",user).eq("thread_id",threadId)
  .in("role",["user","assistant"]).order("created_at",{ascending:false}).limit(80);
 if(messagesError)return NextResponse.json({error:"HISTORY_UNAVAILABLE"},{status:503,headers:noCache});
 const workspace=await db.from('sasi_conversation_threads').select('workspace').eq('user_id',user).eq('id',threadId).maybeSingle();
 if(workspace.error)return NextResponse.json({error:'HISTORY_UNAVAILABLE'},{status:503,headers:noCache});
 return NextResponse.json({ownerId:user,threadId,workspace:workspace.data?.workspace||{},threads:threads||[],messages:(messages||[]).reverse()},{headers:noCache});
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:noCache});
 const user=await userId();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401,headers:noCache});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-chat-history",userId:user,accountLimit:80,ipLimit:240,windowSeconds:3600});
 if(!guard.ok)return NextResponse.json({error:"TOO_MANY_REQUESTS"},{status:429,headers:noCache});
 let body:Record<string,unknown>;
 try{body=await boundedRequestJson(req,196*1024) as Record<string,unknown>}catch{return NextResponse.json({error:"INVALID_REQUEST"},{status:400,headers:noCache})}
 const threadId=String(body?.threadId||""), requestId=String(body?.requestId||"");
 const question=typeof body?.question==="string"?body.question.trim():"";
 const answer=typeof body?.answer==="string"?body.answer.trim():"";
 if(!UUID.test(threadId)||!UUID.test(requestId)||!question||question.length>12000||!answer||answer.length>32768)
  return NextResponse.json({error:"INVALID_HISTORY"},{status:400,headers:noCache});
 try{await saveConversationTurn({userId:user,threadId,requestId,question,answer});return NextResponse.json({ok:true,threadId},{status:201,headers:noCache})}catch(error){const code=error instanceof Error?error.message:'HISTORY_UNAVAILABLE';return NextResponse.json({error:code},{status:code==='HISTORY_CONFLICT'?409:code==='HISTORY_NOT_FOUND'?404:503,headers:noCache})}
}
