import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {createPaypalOrder,paypalPayEnabled} from "@/lib/paypal";
import {safeLocalReturnPath} from "@/lib/sasi/payment-gate";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {getUsdBalanceProduct} from "@/lib/usd-products";
import {getProduct} from "@/lib/plans";
import {toolPassCommerceReady} from "@/lib/tools/commerce/tool-server-receipt";
import {isMarketProductId} from "@/lib/sasi-marketplace/fees";
import {resolveMarketplaceProduct} from "@/lib/sasi-marketplace/checkout";
import {softwareCheckoutReady} from "@/lib/sasi-software/readiness";

export const runtime="nodejs";
export const maxDuration=30;

export async function POST(req:NextRequest){
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  if(!paypalPayEnabled())return NextResponse.json({error:"PAYPAL_NOT_READY"},{status:503});

  try{
    const body=await req.json().catch(()=>null) as {productId?:unknown;returnPath?:unknown}|null;
    const requestedId=String(body?.productId||"");
    const walletProduct=getUsdBalanceProduct(requestedId);
    const passProduct=getProduct(requestedId);
    const isDirectPass=passProduct?.group==="toolpass";
    const isSoftware=passProduct?.group==="software";
    const marketProduct=isMarketProductId(requestedId)?await resolveMarketplaceProduct(requestedId):null;
    const product=walletProduct|| (isDirectPass?{
      id:passProduct!.id,amountUsd:passProduct!.priceUsd,nameEn:passProduct!.nameEn,
      wallet:"toolpass" as const
    }:null)|| (isSoftware?{
      id:passProduct!.id,amountUsd:passProduct!.priceUsd,nameEn:passProduct!.nameEn,
      wallet:"software" as const
    }:null)|| (marketProduct?{
      id:marketProduct.id,amountUsd:marketProduct.priceUsd,nameEn:marketProduct.nameEn,
      wallet:"market" as const,sellerId:marketProduct.sellerId
    }:null);
    if(!product)return NextResponse.json({error:"INVALID_USD_PRODUCT"},{status:400});

    if(isDirectPass&&!toolPassCommerceReady())return NextResponse.json({error:"TOOLPASS_EXECUTION_NOT_READY"},{status:503});
    if(isSoftware&&!await softwareCheckoutReady(requestedId))return NextResponse.json({error:"SOFTWARE_NOT_READY_FOR_SALE"},{status:503});
    const supabase=createClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
    if(marketProduct?.sellerId===user.id)
      return NextResponse.json({error:"SELF_PURCHASE_NOT_ALLOWED"},{status:403});

    const admin=createAdminClient();
    const abuse=await enforceAbuseGuard(req,{scope:"payment-create-paypal",userId:user.id,accountLimit:60,ipLimit:180});
    if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});

    const {data:order,error}=await admin.from("orders").insert({
      user_id:user.id,
      product_id:product.id,
      product_type:isDirectPass?"subscription":"permanent",
      amount_usd:product.amountUsd,
      amount_rmb:null,
      status:"pending",
      provider:"paypal",
      currency:"USD",
      channel:"web",
    }).select("id").single();
    if(error||!order)return NextResponse.json({error:"ORDER_CREATE_FAILED"},{status:500});

    const baseUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com";
    const fallback=walletProduct?"/ai-wallet":isDirectPass?"/tools/pass":(marketProduct||isSoftware)?"/account/software":"/ai-wallet";
    const dest=safeLocalReturnPath(body?.returnPath,fallback);

    try{
      const out=await createPaypalOrder({
        amountUsd:product.amountUsd,
        description:product.nameEn,
        referenceId:order.id,
        returnUrl:`${baseUrl}/api/pay/paypal/return?orderId=${order.id}&dest=${encodeURIComponent(dest)}`,
        cancelUrl:isDirectPass?`${baseUrl}/tools/pass?canceled=1`:
          marketProduct?`${baseUrl}/sasi/marketplace/${encodeURIComponent(requestedId.slice("sasi-market:".length))}?canceled=1`:
          isSoftware?`${baseUrl}/sasi?canceled=1`:
          `${baseUrl}/checkout-usd?productId=${encodeURIComponent(product.id)}&canceled=1`,
      });
      const linked=await admin.from("orders").update({provider_payment_id:out.id}).eq("id",order.id).eq("status","pending");
      if(linked.error)throw linked.error;

      return NextResponse.json({
        url:out.approveUrl,
        orderId:order.id,
        currency:"USD",
        amountUsd:product.amountUsd,
        wallet:product.wallet,
      });
    }catch(error){
      await admin.from("orders").update({status:"failed"}).eq("id",order.id).eq("status","pending");
      console.error("[paypal usd create]",error instanceof Error?error.message:String(error));
      return NextResponse.json({error:"PAYPAL_CREATE_FAILED"},{status:502});
    }
  }catch(error){
    console.error("[paypal create]",error instanceof Error?error.message:String(error));
    return NextResponse.json({error:"SERVER_ERROR"},{status:500});
  }
}
