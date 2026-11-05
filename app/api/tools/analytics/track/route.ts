import {NextRequest,NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {boundedRequestJson} from "@/lib/security/bounded-request-json";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {createHash} from "node:crypto";
export const runtime="nodejs";
const ALLOWED=new Set(["tool_open","file_selected","process_started","process_completed","process_failed","export_clicked"]);
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({ok:false},{status:403});
 if(req.headers.get("dnt")==="1"||req.headers.get("sec-gpc")==="1"||/bot|crawler|spider|headless/i.test(req.headers.get("user-agent")||""))return new NextResponse(null,{status:204});
 try{
  const body=await boundedRequestJson(req,2048) as Record<string,unknown>;
  if(!body||!ALLOWED.has(String(body.eventType))||typeof body.toolId!=="string"||!/^[a-z][a-z0-9-]{1,80}$/.test(body.toolId)||typeof body.sessionId!=="string"||!/^[0-9a-f-]{36}$/i.test(body.sessionId))return NextResponse.json({ok:false},{status:400});
  const guard=await enforceAbuseGuard(req,{scope:"tool-usage",ipLimit:600,windowSeconds:3600});
  if(!guard.ok)return NextResponse.json({ok:false},{status:guard.status});
  const metadata:Record<string,number>={};
  const src=body.metadata&&typeof body.metadata==="object"?body.metadata as Record<string,unknown>:{};
  for(const key of ["duration_ms","file_count","failed_count","quantity"]){const v=src[key];if(typeof v==="number"&&Number.isFinite(v)&&v>=0&&v<=86400000)metadata[key]=Math.floor(v)}
  const day=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai"}).format(new Date());
  const session_id=createHash("sha256").update(day+":"+body.sessionId).digest("hex");
  const {error}=await createAdminClient().from("tool_events").insert({user_id:null,session_id,tool_id:body.toolId,event_type:body.eventType,metadata});
  if(error)return NextResponse.json({ok:false},{status:503});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({ok:false},{status:400})}
}
