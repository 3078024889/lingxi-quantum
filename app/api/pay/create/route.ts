import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPaypalOrder } from "@/lib/paypal";
import { safeLocalReturnPath } from "@/lib/sasi/payment-gate";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { getUsdBalanceProduct } from "@/lib/usd-products";

export const runtime="nodejs";
export const maxDuration=30;

function paypalReady(){
 return process.env.PAYPAL_ENABLED?.trim().toLowerCase()==="true"&&Boolean(
  process.env.PAYPAL_CLIENT_ID?.trim()&&process.env.PAYPAL_CLIENT_SECRET?.trim()&&process.env.PAYPAL_WEBHOOK_ID?.trim()
 );
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 if(!paypalReady())return NextResponse.json({error:"PAYPAL_NOT_READY"},{status:503});
 try{
  const body=await req.json().catch(()=>null) as any;
  const product=getUsdBalanceProduct(String(body?.productId||""));
  if(!product)return NextResponse.json({error:"INVALID_USD_PRODUCT"},{status:400});
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
  const admin=createAdminClient();
  const {data:order,error}=await admin.from("orders").insert({
   user_id:user.id,product_id:product.id,product_type:"permanent",
   amount_usd:product.amountUsd,amount_rmb:product.amountUsd,status:"pending",provider:"paypal",channel:"web"
  }).select("id").single();
  if(error||!order)return NextResponse.json({error:"ORDER_CREATE_FAILED"},{status:500});
  const baseUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com";
  const dest=safeLocalReturnPath(body?.returnPath,product.wallet==="ai"?"/ai-wallet":"/sasi/pricing");
  try{
   const out=await createPaypalOrder({
    amountUsd:product.amountUsd,
    description:`LINGXIFIELD ${product.wallet.toUpperCase()} USD Balance $${product.amountUsd}`,
    referenceId:order.id,
    returnUrl:`${baseUrl}/api/pay/paypal/return?orderId=${order.id}&dest=${encodeURIComponent(dest)}`,
    cancelUrl:`${baseUrl}/checkout-usd?productId=${encodeURIComponent(product.id)}&canceled=1`
   });
   await admin.from("orders").update({provider_payment_id:out.id}).eq("id",order.id);
   return NextResponse.json({url:out.approveUrl,orderId:order.id,currency:"USD",amountUsd:product.amountUsd});
  }catch(e){
   await admin.from("orders").update({status:"failed"}).eq("id",order.id);
   console.error("[paypal usd create]",e instanceof Error?e.message:String(e));
   return NextResponse.json({error:"PAYPAL_CREATE_FAILED"},{status:502});
  }
 }catch(e){
  console.error("[paypal create]",e);
  return NextResponse.json({error:"SERVER_ERROR"},{status:500});
 }
}
