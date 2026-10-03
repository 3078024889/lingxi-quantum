import{NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{verifyPaypalWebhook,verifyPaypalCompletedOrder}from"@/lib/paypal";
import{fulfillPaidOrder}from"@/lib/fulfill-order";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=30;

function paypalOrderId(event:any){
 const r=event?.resource;
 return String(
   r?.supplementary_data?.related_ids?.order_id||
   (String(event?.event_type||"").startsWith("CHECKOUT.ORDER.")?r?.id:"")||
   ""
 );
}

async function handleRefundWebhook(event:any){
 const resource=event?.resource??{};
 const refundId=String(resource?.id||"").trim();
 const requestKey=String(resource?.custom_id||"").trim();
 if(!refundId&&!requestKey)return{ok:true,ignored:true};

 const admin=createAdminClient();
 let q=admin.from("balance_withdrawals")
  .select("id,provider,currency,provider_currency,provider_amount_minor,status,provider_request_key,provider_refund_id")
  .eq("provider","paypal");
 q=refundId?q.eq("provider_refund_id",refundId):q.eq("provider_request_key",requestKey);
 const{data:w,error}=await q.maybeSingle();
 if(error)throw error;
 if(!w)return{ok:true,ignored:true};

 if(w.currency!=="USD"||w.provider_currency!=="USD")throw new Error("PAYPAL_REFUND_CURRENCY_MISMATCH");
 if(requestKey&&requestKey!==w.provider_request_key)throw new Error("PAYPAL_REFUND_REQUEST_KEY_MISMATCH");

 const amount=resource?.amount;
 const cents=Math.round(Number(amount?.value)*100);
 if(amount?.currency_code!=="USD"||cents!==Number(w.provider_amount_minor)){
  throw new Error("PAYPAL_REFUND_AMOUNT_MISMATCH");
 }

 if(String(event?.event_type||"")==="PAYMENT.CAPTURE.REFUNDED"){
  const id=refundId||w.provider_refund_id;
  if(!id)throw new Error("PAYPAL_REFUND_ID_MISSING");
  const{error:completeError}=await admin.rpc("complete_balance_withdrawal",{
   p_withdrawal_id:w.id,
   p_provider_refund_id:id,
   p_provider_status:"COMPLETED",
  });
  if(completeError)throw completeError;
  return{ok:true,refund:true};
 }

 return{ok:true,ignored:true};
}

export async function POST(req:Request){
 const raw=await req.text();
 if(!(await verifyPaypalWebhook(req.headers,raw))){
  return NextResponse.json({error:"INVALID_PAYPAL_SIGNATURE"},{status:401});
 }
 const event=JSON.parse(raw);
 const eventType=String(event?.event_type||"");

 try{
  if(eventType==="PAYMENT.CAPTURE.REFUNDED"){
   return NextResponse.json(await handleRefundWebhook(event));
  }

  if(!["PAYMENT.CAPTURE.COMPLETED","CHECKOUT.ORDER.COMPLETED"].includes(eventType)){
   return NextResponse.json({ok:true,ignored:true});
  }

  const providerId=paypalOrderId(event);
  if(!providerId)return NextResponse.json({ok:true,ignored:true});
  const admin=createAdminClient();
  const{data:order}=await admin.from("orders")
   .select("id,amount_usd,status,provider,provider_payment_id")
   .eq("provider","paypal")
   .eq("provider_payment_id",providerId)
   .maybeSingle();
  if(!order)return NextResponse.json({ok:true,ignored:true});
  if(order.status==="paid")return NextResponse.json({ok:true,alreadyPaid:true});

  await verifyPaypalCompletedOrder(providerId,Number(order.amount_usd),order.id);
  const fulfilled=await fulfillPaidOrder(order.id);
  if(!fulfilled.ok)return NextResponse.json({error:"FULFILLMENT_PENDING"},{status:500});
  return NextResponse.json({ok:true});
 }catch(e){
  console.error("[paypal webhook]",e instanceof Error?e.message:String(e));
  return NextResponse.json({error:"PAYPAL_VERIFICATION_FAILED"},{status:422});
 }
}
