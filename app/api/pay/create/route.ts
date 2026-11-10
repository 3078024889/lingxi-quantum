import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {createPaypalOrder,paypalEnabled} from "@/lib/paypal";
import {safeLocalReturnPath} from "@/lib/sasi/payment-gate";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {getUsdBalanceProduct} from "@/lib/usd-products";
import {getProduct} from "@/lib/plans";
import {resolveMarketplaceProduct} from "@/lib/sasi-marketplace/checkout";
import {softwareCheckoutReady} from "@/lib/sasi-software/readiness";
import {toolPassCommerceReady} from "@/lib/tools/commerce/tool-server-receipt";

export const runtime="nodejs";
export const maxDuration=30;

type PaypalCatalogProduct={
 id:string;amountUsd:number;nameEn:string;
 group:"toolpass"|"software"|"market";
 type:"permanent"|"subscription";
 sellerId?:string;
};

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
 if(!paypalEnabled())return NextResponse.json({error:"PAYPAL_NOT_READY"},{status:503});

 try{
  const body=await req.json().catch(()=>null) as {productId?:unknown;returnPath?:unknown}|null;
  const requestedId=String(body?.productId||"");
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401});
  const walletProduct=getUsdBalanceProduct(requestedId);
  const catalog=getProduct(requestedId)||await resolveMarketplaceProduct(requestedId);
  const isCatalogPayable=Boolean(catalog&&["toolpass","software","market"].includes(catalog.group));
  const product:PaypalCatalogProduct|{id:string;amountUsd:number;nameEn:string;group:"wallet";type:"permanent"}|null=
   walletProduct
    ?{id:walletProduct.id,amountUsd:walletProduct.amountUsd,nameEn:walletProduct.nameEn,group:"wallet",type:"permanent"}
    :isCatalogPayable&&catalog
     ?{id:catalog.id,amountUsd:catalog.priceUsd,nameEn:catalog.nameEn,group:catalog.group as "toolpass"|"software"|"market",type:catalog.type,sellerId:catalog.sellerId}
     :null;

  if(!product||!Number.isFinite(product.amountUsd)||product.amountUsd<=0)
   return NextResponse.json({error:"INVALID_USD_PRODUCT"},{status:400});
  if(product.group==="toolpass"&&!toolPassCommerceReady())
   return NextResponse.json({error:"TOOLPASS_COMMERCE_NOT_READY"},{status:503});
  if(product.group==="software"&&!await softwareCheckoutReady(product.id))
   return NextResponse.json({error:"SOFTWARE_NOT_READY_FOR_SALE"},{status:503});

  if(product.group==="market"&&product.sellerId===user.id)
   return NextResponse.json({error:"SELF_PURCHASE_NOT_ALLOWED"},{status:403});

  const admin=createAdminClient();
  const abuse=await enforceAbuseGuard(req,{scope:"payment-create-paypal",userId:user.id,accountLimit:60,ipLimit:180});
  if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status});

  const {data:order,error}=await admin.from("orders").insert({
   user_id:user.id,
   product_id:product.id,
   product_type:product.type,
   amount_usd:product.amountUsd,
   amount_rmb:null,
   status:"pending",
   provider:"paypal",
   currency:"USD",
   channel:"web",
  }).select("id").single();
  if(error||!order)return NextResponse.json({error:"ORDER_CREATE_FAILED"},{status:500});

  const baseUrl=process.env.NEXT_PUBLIC_SITE_URL||"https://lingxifield.com";
  const fallback=product.group==="toolpass"?"/tools/pass"
   :product.group==="software"?"/account/software"
   :product.group==="market"?"/sasi/marketplace"
   :"/ai-wallet";
  const dest=safeLocalReturnPath(body?.returnPath,fallback);
  const cancelPath=product.group==="toolpass"?"/tools/pass?canceled=1"
   :product.group==="software"?"/sasi?canceled=1"
   :product.group==="market"?"/sasi/marketplace?canceled=1"
   :"/ai-wallet?canceled=1";

  try{
   const out=await createPaypalOrder({
    amountUsd:product.amountUsd,
    description:product.nameEn,
    referenceId:order.id,
    returnUrl:`${baseUrl}/api/pay/paypal/return?orderId=${order.id}&dest=${encodeURIComponent(dest)}`,
    cancelUrl:`${baseUrl}${cancelPath}`,
   });
   const linked=await admin.from("orders").update({provider_payment_id:out.id})
    .eq("id",order.id).eq("status","pending");
   if(linked.error)throw linked.error;
   return NextResponse.json({
    url:out.approveUrl,orderId:order.id,currency:"USD",amountUsd:product.amountUsd,
    productGroup:product.group,
   },{headers:{"Cache-Control":"private,no-store"}});
  }catch(error){
   await admin.from("orders").update({status:"failed"}).eq("id",order.id).eq("status","pending");
   console.error("[paypal create]",error instanceof Error?error.message:"PAYPAL_CREATE_FAILED");
   return NextResponse.json({error:"PAYPAL_CREATE_FAILED"},{status:502});
  }
 }catch(error){
  console.error("[paypal create]",error instanceof Error?error.message:"SERVER_ERROR");
  return NextResponse.json({error:"SERVER_ERROR"},{status:500});
 }
}
