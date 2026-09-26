import {NextRequest,NextResponse} from "next/server";
import {PUBLIC_PAID_TOOL_IDS,isPublicPaidToolId} from "@/lib/tools/paid-catalog";
import {calculateToolQuote} from "@/lib/tools/pricing-server";
import {toolRuntimeState} from "@/lib/tools/service-readiness";
import {parseCurrency,type PaymentCurrency} from "@/lib/payments/currency-book";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const PUBLIC_SET:ReadonlySet<string>=new Set(PUBLIC_PAID_TOOL_IDS);

function presentationUnit(toolId:string,unitName:string){
  if(toolId==="food-calorie")return "calculation";
  return unitName;
}

async function one(toolId:string,currency:PaymentCurrency){
  if(!PUBLIC_SET.has(toolId))return null;
  try{
    const q=await calculateToolQuote(toolId,1);
    const runtime=toolRuntimeState(toolId);
    const amount=currency==="CNY"?q.amountRmb:q.amountUsd;
    return {
      tool_id:q.toolId,
      billing_type:q.billingType,
      unit_name:presentationUnit(toolId,q.unitName),
      quantity:1,
      amount_rmb:q.amountRmb,
      amount_usd:q.amountUsd,
      currency,
      display_amount:amount,
      available:runtime.ready,
    };
  }catch{
    return null;
  }
}

export async function GET(req:NextRequest){
  const url=new URL(req.url);
  const currency=parseCurrency(url.searchParams.get("currency"))||"CNY";
  const toolId=(url.searchParams.get("toolId")||"").trim();

  if(toolId){
    if(!isPublicPaidToolId(toolId)){
      return NextResponse.json({error:"TOOL_NOT_AVAILABLE"},{status:404});
    }
    const item=await one(toolId,currency);
    if(!item)return NextResponse.json({error:"PRICE_NOT_AVAILABLE"},{status:404});
    return NextResponse.json(item,{headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}});
  }

  const items=(await Promise.all(PUBLIC_PAID_TOOL_IDS.map(id=>one(id,currency)))).filter(Boolean);
  return NextResponse.json(
    {currency,items},
    {headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}}
  );
}
