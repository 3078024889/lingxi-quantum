import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {ALL_TOOLS_PASS_CATALOG,allToolsPassOffer} from "@/lib/tools/commerce/all-tools-pass";
import {parseCurrency,recommendedCurrency} from "@/lib/payments/currency-book";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const COMMERCE_READY=process.env.TOOL_PASS_COMMERCE_READY==="true"&&process.env.NEXT_PUBLIC_TOOL_PASS_ENFORCED==="true";
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(req:NextRequest){
 const {data:{user}}=await createClient().auth.getUser();
 const currency=parseCurrency(new URL(req.url).searchParams.get("currency"))||recommendedCurrency(req);
 let expiresAt:null|string=null;
 if(user){
  const {data}=await createAdminClient().from("lingxi_tool_passes").select("starts_at,expires_at")
   .eq("user_id",user.id).is("revoked_at",null).gt("expires_at",new Date().toISOString()).lte("starts_at",new Date().toISOString()).order("expires_at",{ascending:false}).limit(1);
  expiresAt=data?.find(x=>new Date(x.starts_at).getTime()<=Date.now())?.expires_at||null;
 }
 return NextResponse.json({currency,offers:ALL_TOOLS_PASS_CATALOG,expiresAt,available:COMMERCE_READY},{headers:{"Cache-Control":"private,no-store"}});
}
export async function POST(req:NextRequest){
 if(!COMMERCE_READY)return NextResponse.json({error:"PASS_COMMERCE_NOT_READY"},{status:503});
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 if(Number(req.headers.get("content-length")||0)>4096)return NextResponse.json({error:"REQUEST_TOO_LARGE"},{status:413});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
 const input=await req.json().catch(()=>null);
 const sku=String(input?.sku||""),requestId=String(input?.requestId||"");
 const currency=parseCurrency(input?.currency);
 if(!allToolsPassOffer(sku)||!UUID.test(requestId)||!currency)
  return NextResponse.json({error:"INVALID_PASS_PURCHASE"},{status:400});
 const abuse=await enforceAbuseGuard(req,{scope:"tool-pass-purchase",userId:user.id,accountLimit:30,ipLimit:100});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});
 const {data,error}=await createAdminClient().rpc("lingxi_purchase_tool_pass",{
  p_user_id:user.id,p_request_id:requestId,p_sku:sku,p_currency:currency
 });
 if(error){console.error("[pass-purchase]",error.code);return NextResponse.json({error:"PASS_PURCHASE_UNAVAILABLE"},{status:503});}
 if(!data?.ok)return NextResponse.json(data||{error:"PASS_PURCHASE_UNAVAILABLE"},
   {status:data?.error==="SASI_BALANCE_INSUFFICIENT"?402:409});
 return NextResponse.json(data,{headers:{"Cache-Control":"private,no-store"}});
}
