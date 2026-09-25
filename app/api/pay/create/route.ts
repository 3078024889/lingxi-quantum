import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {createPaypalOrder} from "@/lib/paypal";
import {safeLocalReturnPath} from "@/lib/sasi/payment-gate";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {getProduct} from "@/lib/plans";

export const runtime="nodejs";
export const maxDuration=30;

function paypalReady(){
  return process.env.PAYPAL_ENABLED?.trim().toLowerCase()==="true"&&Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim()
    &&process.env.PAYPAL_CLIENT_SECRET?.trim()
    &&process.env.PAYPAL_WEBHOOK_ID?.trim()
  );
}

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  if(!paypalReady())return NextResponse.json({error:"PAYPAL_NOT_READY"},{status:503});

  try{
    const body=await req.json().catch(()=>null) as {productId?:unknown;returnPath?:unknown}|null;
    const product=getProduct(String(body?.productId||""));
    if(!product||!["ai","production"].includes(product.group)||!Number.isFinite(product.priceUsd)||product.priceUsd<=0){
      return NextResponse.json({error:"INVALID_PAYPAL_BALANCE_PRODUCT"},{status:400});
    }

    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});

    const admin=createAdminClient();
    const limited=await admin.rpc("rate_limit_check",{
      p_key:`payment-create:paypal:${user.id}`,
      p_limit:60,
      p_window_seconds:3600,
    });
    if(limited.error)return NextResponse.json({error:"PAYMENT_RATE_GUARD_UNAVAILABLE"},{status:503});
    if(limited.data!==true)return NextResponse.json({error:"PAYMENT_CREATE_RATE_LIMITED"},{status:429});

    const {data:order,error}=await admin.from("orders").insert({
      user_id:user.id,
      product_id:product.id,
      product_type:product.type,
      amount_usd:product.priceUsd,
      amount_rmb:product.priceRmb,
      status:"pending",
      provider:"paypal",
      channel:"web",
    }).select("id").single();
    if(error||!order)return NextResponse.json({error:"ORDER_CREATE_FAILED"},{status:500});

    const baseUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com";
    const fallback=product.group==="ai"?"/ai-wallet":"/sasi/pricing";
    const dest=safeLocalReturnPath(body?.returnPath,fallback);

    try{
      const out=await createPaypalOrder({
        amountUsd:product.priceUsd,
        description:`LINGXIFIELD ${product.nameEn} / CNY balance ¥${product.priceRmb}`,
        referenceId:order.id,
        returnUrl:`${baseUrl}/api/pay/paypal/return?orderId=${order.id}&dest=${encodeURIComponent(dest)}`,
        cancelUrl:`${baseUrl}/checkout-usd?productId=${encodeURIComponent(product.id)}&canceled=1`,
      });
      const linked=await admin.from("orders")
        .update({provider_payment_id:out.id})
        .eq("id",order.id)
        .eq("status","pending");
      if(linked.error)throw linked.error;

      return NextResponse.json({
        url:out.approveUrl,
        orderId:order.id,
        currency:"USD",
        amountUsd:product.priceUsd,
        creditedCurrency:"CNY",
        creditedAmountRmb:product.priceRmb,
      });
    }catch(error){
      await admin.from("orders").update({status:"failed"}).eq("id",order.id).eq("status","pending");
      console.error("[paypal balance create]",error instanceof Error?error.message:String(error));
      return NextResponse.json({error:"PAYPAL_CREATE_FAILED"},{status:502});
    }
  }catch(error){
    console.error("[paypal create]",error instanceof Error?error.message:String(error));
    return NextResponse.json({error:"SERVER_ERROR"},{status:500});
  }
}
