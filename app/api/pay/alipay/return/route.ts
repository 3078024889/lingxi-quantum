import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {alipaySiteUrl,queryAlipayTrade} from "@/lib/alipay";
import {fulfillPaidOrder} from "@/lib/fulfill-order";
import {safeLocalReturnPath} from "@/lib/sasi/payment-gate";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=30;

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function paymentCenter(baseUrl:string,status:"pending"|"confirming"|"error"){
 const target=new URL("/account/orders",baseUrl);
 target.searchParams.set("payment",status);
 target.searchParams.set("provider","alipay");
 return target;
}

function destination(baseUrl:string,path:string,status?:"confirming"){
 const target=new URL(path,baseUrl);
 if(status){target.searchParams.set("payment",status);target.searchParams.set("provider","alipay");}
 return target;
}

export async function GET(req:Request){
 const url=new URL(req.url);
 const baseUrl=alipaySiteUrl();
 const orderId=url.searchParams.get("orderId")||"";
 const dest=safeLocalReturnPath(url.searchParams.get("dest"),"/account/orders");
 if(!UUID.test(orderId))return NextResponse.redirect(paymentCenter(baseUrl,"error"));

 try{
  const admin=createAdminClient();
  const {data:order,error}=await admin.from("orders")
   .select("id,provider,provider_payment_id,amount_rmb,currency,status")
   .eq("id",orderId).maybeSingle();
  if(error||!order||order.provider!=="alipay"||order.currency!=="CNY"||!order.provider_payment_id)
   return NextResponse.redirect(paymentCenter(baseUrl,"error"));
  if(order.status==="paid")return NextResponse.redirect(destination(baseUrl,dest));
  if(order.status!=="pending"||!Number.isFinite(Number(order.amount_rmb))||Number(order.amount_rmb)<=0)
   return NextResponse.redirect(paymentCenter(baseUrl,"error"));

  // The browser return is only a prompt to reconcile. The signed Alipay query
  // response, order number and exact amount are the source of payment truth.
  const remote=await queryAlipayTrade({
   outTradeNo:String(order.provider_payment_id),
   expectedAmountRmb:Number(order.amount_rmb)
  });
  if(!remote.paid){
   if(remote.tradeStatus==="TRADE_CLOSED")return NextResponse.redirect(paymentCenter(baseUrl,"error"));
   return NextResponse.redirect(destination(baseUrl,dest,"confirming"));
  }

  const fulfilled=await fulfillPaidOrder(order.id,true);
  if(!fulfilled.ok){
   console.error("[alipay return] verified payment awaits fulfillment",fulfilled.error);
   return NextResponse.redirect(paymentCenter(baseUrl,"pending"));
  }
  return NextResponse.redirect(destination(baseUrl,dest));
 }catch(error){
  console.error("[alipay return] provider reconciliation failed",error instanceof Error?error.message:"UNKNOWN");
  return NextResponse.redirect(paymentCenter(baseUrl,"pending"));
 }
}
