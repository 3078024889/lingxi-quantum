import {NextRequest,NextResponse} from "next/server";
import offers from "@/config/tool-pass-offers.v2.json";
import {passQuote} from "@/lib/tools/commerce/tool-pass-v2.mjs";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 // No public sales UI before verified migration, refund flow and usage acceptance.
 if(process.env.LINGXIFIELD_TOOL_PASS_ENABLED!=="true"||!offers.active)
  return NextResponse.json({error:"TOOL_PASS_NOT_LIVE"},{status:503,headers:{"Cache-Control":"no-store"}});
 const currency=request.nextUrl.searchParams.get("currency")||"CNY";
 const sku=request.nextUrl.searchParams.get("sku")||"";
 const quote=passQuote(offers,sku,currency);
 if(!quote)return NextResponse.json({error:"INVALID_PASS_SELECTION"},{status:400});
 return NextResponse.json(quote,{headers:{"Cache-Control":"no-store"}});
}
