import {NextRequest,NextResponse} from "next/server";
import {readToolDevice,newToolDevice,TOOL_DEVICE_COOKIE} from "@/lib/tools/commerce/tool-device";
import {quotaToolSlug} from "@/lib/tools/core-workspaces";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {getTool} from "@/lib/tools/registry";
import {publicToolBySlug} from "@/lib/tools/platform/tool-registry";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {toolPassBackendReady} from "@/lib/tools/commerce/tool-server-receipt";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function device(req:NextRequest){
 const hash=readToolDevice(req.cookies.get(TOOL_DEVICE_COOKIE)?.value);
 if(hash)return{hash,token:null};
 const token=newToolDevice();return{hash:readToolDevice(token)!,token};
}
function respond(body:unknown,status=200,token:string|null=null){
 const response=NextResponse.json(body,{status,headers:{"Cache-Control":"private,no-store"}});
 if(token)response.cookies.set(TOOL_DEVICE_COOKIE,token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:365*24*60*60});
 return response;
}
function validTool(id:string){const simple=getTool(id);return Boolean((simple&&simple.status==="live")||publicToolBySlug(id));}
export async function POST(req:NextRequest){
 if(!toolPassBackendReady())return NextResponse.json({error:"TOOL_PASS_BACKEND_NOT_READY"},{status:503});
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 if(Number(req.headers.get("content-length")||0)>4096)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const input=await req.json().catch(()=>null);
 const toolSlug=quotaToolSlug(String(input?.toolSlug||""));
 const requestId=String(input?.requestId||"");
 const units=Number(input?.units);
 if(!validTool(toolSlug)||!UUID.test(requestId)||!Number.isSafeInteger(units)||units<1||units>1000)
   return NextResponse.json({error:"INVALID_TOOL_USE"},{status:400});
 const currentDevice=device(req);
 if(currentDevice.token)return respond({error:"DEVICE_SESSION_READY"},409,currentDevice.token);
 const limited=await enforceAbuseGuard(req,{scope:"tool-pass-use",userId:user.id,accountLimit:500,ipLimit:2000});
 if(!limited.ok)return NextResponse.json({error:limited.error},{status:limited.status});
 const admin=createAdminClient();
 const {data,error}=await admin.rpc("lingxi_claim_tool_use_device",{
  p_request_id:requestId,p_user_id:user.id,p_device_hash:currentDevice.hash,p_tool_slug:toolSlug,p_units:units
 });
 if(error){console.error("[tool-pass-use]",error.code);return NextResponse.json({error:"TOOL_ACCESS_UNAVAILABLE"},{status:503});}
 if(!data?.ok){
  const status=data?.error==="DAILY_TOOL_FREE_USED"||data?.error==="TOOL_PASS_REQUIRED"?402:409;
  return NextResponse.json(data||{error:"TOOL_ACCESS_UNAVAILABLE"},{status});
 }
 return NextResponse.json(data,{headers:{"Cache-Control":"private,no-store"}});
}
export async function GET(req:NextRequest){
 if(!toolPassBackendReady())return NextResponse.json({error:"TOOL_PASS_BACKEND_NOT_READY"},{status:503});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const toolSlug=quotaToolSlug(new URL(req.url).searchParams.get("toolSlug")||"");
 if(!validTool(toolSlug))return NextResponse.json({error:"INVALID_TOOL_USE"},{status:400});
 const currentDevice=device(req);
 const admin=createAdminClient();
 // The database derives administrator status from the confirmed account and
 // protected operator settings. A browser cannot request a larger allowance.
 const {data,error}=await admin.rpc("lingxi_tool_use_status_device",{
  p_user_id:user.id,p_device_hash:currentDevice.hash,p_tool_slug:toolSlug
 });
 if(error||!data?.ok)return NextResponse.json({error:"TOOL_ACCESS_UNAVAILABLE"},{status:503});
 return respond(data,200,currentDevice.token);
}
