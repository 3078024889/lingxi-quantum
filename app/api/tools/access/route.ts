import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {getTool} from "@/lib/tools/registry";
import {trustedClientIp} from "@/lib/security/trusted-client-ip";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function clientHash(req:NextRequest){
 const ip=trustedClientIp(req);
 // Unknown IP must not silently grant every visitor the same free pool.
 if(ip==="unknown")return null;
 const secret=process.env.LINGXIFIELD_PRIVACY_HASH_SECRET||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!secret)return null;
 return createHash("sha256").update(secret+":tool-pass:v1:"+ip).digest("hex");
}
function validTool(id:string){const tool=getTool(id);return Boolean(tool&&tool.status==="live");}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 if(Number(req.headers.get("content-length")||0)>4096)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const input=await req.json().catch(()=>null);
 const toolSlug=String(input?.toolSlug||"");
 const requestId=String(input?.requestId||"");
 const units=Number(input?.units);
 if(!validTool(toolSlug)||!UUID.test(requestId)||!Number.isSafeInteger(units)||units<1||units>1000)
   return NextResponse.json({error:"INVALID_TOOL_USE"},{status:400});
 const ipHash=clientHash(req);
 if(!ipHash)return NextResponse.json({error:"TRUSTED_IP_UNAVAILABLE"},{status:503});
 const limited=await enforceAbuseGuard(req,{scope:"tool-pass-use",userId:user.id,accountLimit:500,ipLimit:2000});
 if(!limited.ok)return NextResponse.json({error:limited.error},{status:limited.status});
 const admin=createAdminClient();
 const {data,error}=await admin.rpc("lingxi_claim_tool_use",{
  p_request_id:requestId,p_user_id:user.id,p_ip_hash:ipHash,p_tool_slug:toolSlug,p_units:units
 });
 if(error){console.error("[tool-pass-use]",error.code);return NextResponse.json({error:"TOOL_ACCESS_UNAVAILABLE"},{status:503});}
 if(!data?.ok){
  const status=data?.error==="DAILY_TOOL_FREE_USED"||data?.error==="TOOL_PASS_REQUIRED"?402:409;
  return NextResponse.json(data||{error:"TOOL_ACCESS_UNAVAILABLE"},{status});
 }
 return NextResponse.json(data,{headers:{"Cache-Control":"private,no-store"}});
}
export async function GET(req:NextRequest){
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const toolSlug=new URL(req.url).searchParams.get("toolSlug")||"";
 if(!validTool(toolSlug))return NextResponse.json({error:"INVALID_TOOL_USE"},{status:400});
 const ipHash=clientHash(req);
 if(!ipHash)return NextResponse.json({error:"TRUSTED_IP_UNAVAILABLE"},{status:503});
 const admin=createAdminClient();
 const day=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Shanghai",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const [{data:passes,error:pe},{data:used,error:ue}]=await Promise.all([
  admin.from("lingxi_tool_passes").select("starts_at,expires_at").eq("user_id",user.id).gt("expires_at",new Date().toISOString()).order("expires_at",{ascending:false}).limit(1),
  admin.from("lingxi_tool_use_events").select("user_id,ip_hash,units").eq("tool_slug",toolSlug).eq("usage_day",day).eq("access_kind","daily_free").or(`user_id.eq.${user.id},ip_hash.eq.${ipHash}`)
 ]);
 if(pe||ue)return NextResponse.json({error:"TOOL_ACCESS_UNAVAILABLE"},{status:503});
 const pass=passes?.find(p=>new Date(p.starts_at).getTime()<=Date.now());
 const accountUsed=(used||[]).filter(x=>x.user_id===user.id).reduce((n,x)=>n+x.units,0);
 const ipUsed=(used||[]).filter(x=>x.ip_hash===ipHash).reduce((n,x)=>n+x.units,0);
 return NextResponse.json({allowed:Boolean(pass)||(accountUsed===0&&ipUsed===0),
   passExpiresAt:pass?.expires_at||null,dailyFreeRemaining:pass?null:Math.max(0,1-Math.max(accountUsed,ipUsed))},
  {headers:{"Cache-Control":"private,no-store"}});
}
