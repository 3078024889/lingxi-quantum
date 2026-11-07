import {toolPassCutoverRequested,toolPassBackendReady} from "@/lib/tools/commerce/tool-server-receipt";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {newBurnObjectKey,presignR2,r2Ready} from "@/lib/r2-private";

export const runtime="nodejs";
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const SAFE_TYPE=/^(application\/pdf|text\/|image\/|video\/|audio\/|application\/(zip|json|octet-stream|vnd\.openxmlformats-officedocument\.|vnd\.ms-))/i;

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"AUTH_REQUIRED"},{status:401});
 if(!r2Ready())return NextResponse.json({error:"TEMP_FILE_SERVICE_UNAVAILABLE"},{status:503});
 const abuse=await enforceAbuseGuard(req,{scope:"tool-mobile-file",userId:user.id,accountLimit:60,ipLimit:180});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const body=await req.json().catch(()=>null) as {
  name?:unknown;type?:unknown;size?:unknown;accessRequestId?:unknown;
  operationId?:unknown;toolSlug?:unknown
 }|null;
 const name=String(body?.name||"result").slice(0,180),type=String(body?.type||"application/octet-stream").slice(0,160),size=Number(body?.size||0);
 if(!Number.isFinite(size)||size<=0||size>100*1024*1024)return NextResponse.json({error:"FILE_SIZE_INVALID"},{status:400});
 if(!SAFE_TYPE.test(type))return NextResponse.json({error:"FILE_TYPE_UNSUPPORTED"},{status:415});
 // A mobile preview is a CONTINUATION of the already claimed tool start.
 // Do not deduct a second free use for a new secondary cloud upload.
 // The atomic service-role RPC verifies owner/tool/operation/revocation and
 // creates a single recoverable R2 row in the same SQL transaction.
 if(toolPassCutoverRequested()){
  if(!toolPassBackendReady())
   return NextResponse.json({error:"TOOL_PASS_BACKEND_NOT_READY"},{status:503});
  const requestId=String(body?.accessRequestId||"");
  const operationId=String(body?.operationId||"");
  const toolSlug=String(body?.toolSlug||"");
  if(!UUID.test(requestId)||!UUID.test(operationId)||!/^[a-z0-9-]{1,96}$/.test(toolSlug))
   return NextResponse.json({error:"TOOL_USE_RECEIPT_REQUIRED"},{status:403});
  const key=newBurnObjectKey(`tool-${user.id}`,name);
  const admin=createAdminClient();
  const {data,error}=await admin.rpc("lingxi_prepare_pass_mobile_file_v1",{
   p_user_id:user.id,p_request_id:requestId,p_operation_id:operationId,
   p_tool_slug:toolSlug,p_name:name,p_mime:type,p_size:size,p_object_key:key
  });
  if(error)return NextResponse.json({error:"MOBILE_FILE_PASS_SESSION_UNAVAILABLE"},{status:503});
  if(!data?.ok){
   const code=String(data?.error||"MOBILE_FILE_PASS_UNAVAILABLE");
   const status=code.includes("EXPIRED")?410:code.includes("CONFLICT")||code.includes("ALREADY")?409:403;
   return NextResponse.json({error:code},{status,headers:{"Cache-Control":"no-store"}});
  }
  const actualKey=String(data.objectKey||"");
  const expireAt=String(data.expiresAt||"");
  const remaining=Math.floor((Date.parse(expireAt)-Date.now())/1000);
  if(!actualKey.startsWith(`burn/tool-${user.id}/`)||!Number.isFinite(remaining)||remaining<=1)
   return NextResponse.json({error:"MOBILE_FILE_PASS_EXPIRED"},{status:410});
  return NextResponse.json({
   putUrl:presignR2("PUT",actualKey,Math.min(remaining,300)),
   getUrl:presignR2("GET",actualKey,Math.min(remaining,900)),
   expiresAt:expireAt,recovered:Boolean(data.recovered)
  },{headers:{"Cache-Control":"private, no-store"}});
 }
 const key=newBurnObjectKey(`tool-${user.id}`,name);
 const expiresAt=new Date(Date.now()+20*60*1000).toISOString();
 const admin=createAdminClient();
 const {error}=await admin.from("tool_temp_files").insert({user_id:user.id,object_key:key,file_name:name,mime_type:type,byte_size:size,expires_at:expiresAt});
 if(error)return NextResponse.json({error:"TEMP_FILE_CREATE_FAILED"},{status:500});
 return NextResponse.json({putUrl:presignR2("PUT",key,300),getUrl:presignR2("GET",key,900),expiresAt},{headers:{"Cache-Control":"no-store"}});
}
