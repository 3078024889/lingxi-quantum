import {createHmac} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import offers from "@/config/tool-pass-offers.v2.json";
import {PASS_UUID,toolPassClassification} from "@/lib/tools/commerce/tool-pass-v2.mjs";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {trustedClientIp} from "@/lib/security/trusted-client-ip";

export const runtime="nodejs";
const HEADERS={"Cache-Control":"private, no-store, max-age=0"};
export async function POST(req:NextRequest){
 if(process.env.LINGXIFIELD_TOOL_PASS_ENABLED!=="true"||!offers.active)
  return NextResponse.json({error:"TOOL_PASS_NOT_LIVE"},{status:503,headers:HEADERS});
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403,headers:HEADERS});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:HEADERS});
 const body=await req.json().catch(()=>null);
 const operationId=body?.operationId,toolId=body?.toolId;
 if(typeof operationId!=="string"||!PASS_UUID.test(operationId)||toolPassClassification(offers,toolId)!=="locally_eligible")
  return NextResponse.json({error:"TOOL_NOT_COVERED"},{status:400,headers:HEADERS});
 const secret=process.env.LINGXIFIELD_PRIVACY_HASH_SECRET;
 const ip=trustedClientIp(req);
 if(!secret||secret.length<32||ip==="unknown")
  return NextResponse.json({error:"TRUST_BOUNDARY_UNAVAILABLE"},{status:503,headers:HEADERS});
 // One free operation is consumed when the server accepts the processing start,
 // irrespective of whether the caller later exports a file. This is not
 // a replacement for gates on individual server processing routes.
 const ipHash=createHmac("sha256",secret).update(ip).digest("hex");
 const {data,error}=await createAdminClient().rpc("claim_tool_pass_use_v2",{
  p_user_id:user.id,p_operation_id:operationId,p_tool_key:toolId,p_ip_hash:ipHash
 });
 if(error)return NextResponse.json({error:"PASS_USE_UNAVAILABLE"},{status:503,headers:HEADERS});
 const result=data as Record<string,unknown>|null;
 return NextResponse.json(result??{ok:false,error:"EMPTY_CLAIM_RESULT"},{
  status:result?.ok===true?200:409,headers:HEADERS
 });
}
