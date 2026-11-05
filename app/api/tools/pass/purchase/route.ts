import {NextRequest,NextResponse} from "next/server";
import offers from "@/config/tool-pass-offers.v2.json";
import {passQuote,PASS_UUID} from "@/lib/tools/commerce/tool-pass-v2.mjs";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";

export const runtime="nodejs";
const NO_STORE={"Cache-Control":"private, no-store, max-age=0"};
export async function POST(req:NextRequest){
 if(process.env.LINGXIFIELD_TOOL_PASS_ENABLED!=="true"||offers.active!==true)
  return NextResponse.json({error:"TOOL_PASS_NOT_LIVE"},{status:503,headers:NO_STORE});
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403,headers:NO_STORE});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:NO_STORE});
 const body=await req.json().catch(()=>null);
 const quote=passQuote(offers,body?.sku,body?.currency);
 const requestId=body?.requestId;
 if(!quote||typeof requestId!=="string"||!PASS_UUID.test(requestId))
  return NextResponse.json({error:"INVALID_PASS_REQUEST"},{status:400,headers:NO_STORE});
 // All funds originate from existing CNY/USD ledgers in the atomic database RPC.
 // Never trust amount/userId passed in the request, and never credit funds here.
 const {data,error}=await createAdminClient().rpc("purchase_tool_pass_v2",{
  p_user_id:user.id,p_request_id:requestId,p_sku:quote.sku,p_currency:quote.currency
 });
 if(error)return NextResponse.json({error:"PASS_PURCHASE_UNAVAILABLE"},{status:503,headers:NO_STORE});
 const result=data as Record<string,unknown>|null;
 return NextResponse.json(result??{ok:false,error:"EMPTY_PURCHASE_RESULT"},{
  status:result?.ok===true?200:409,headers:NO_STORE
 });
}
