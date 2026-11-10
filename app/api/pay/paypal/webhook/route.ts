import{NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{capturePaypalOrder,verifyPaypalWebhook,verifyPaypalCompletedOrder}from"@/lib/paypal";
import{fulfillPaidOrder}from"@/lib/fulfill-order";
import{enqueueMoneyWebhookEvent,payloadSha256}from"@/lib/money/webhook-inbox";

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

export async function POST(req:Request){
 const declared=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(declared)&&declared>1024*1024)return NextResponse.json({error:"WEBHOOK_BODY_TOO_LARGE"},{status:413});
 const raw=await req.text();
 if(Buffer.byteLength(raw,"utf8")>1024*1024)return NextResponse.json({error:"WEBHOOK_BODY_TOO_LARGE"},{status:413});
 if(!(await verifyPaypalWebhook(req.headers,raw))){
  return NextResponse.json({error:"INVALID_PAYPAL_SIGNATURE"},{status:401});
 }
 const event=JSON.parse(raw);
 const eventType=String(event?.event_type||"");

 try{
  if(eventType==="PAYMENT.CAPTURE.REFUNDED"){
   const resource=event?.resource??{};
   const refundId=String(resource?.id||"").trim();
   const requestKey=String(resource?.custom_id||"").trim();
   const objectKey=requestKey||refundId;
   if(!objectKey)return NextResponse.json({ok:true,ignored:true});
   await enqueueMoneyWebhookEvent({
    provider:"paypal",
    eventKey:String(event?.id||payloadSha256(raw)),
    eventType,
    objectKey,
    payload:{
     providerRefundId:refundId,
     providerStatus:String(resource?.status||"COMPLETED"),
     amountValue:String(resource?.amount?.value||""),
     currency:String(resource?.amount?.currency_code||""),
    },
    payloadHash:payloadSha256(raw),
   });
   return NextResponse.json({ok:true,queued:true});
  }

  if(eventType==="PAYMENT.CAPTURE.PENDING"){
   return NextResponse.json({ok:true,pending:true});
  }

  if(["PAYMENT.CAPTURE.DENIED","CHECKOUT.PAYMENT-APPROVAL.REVERSED"].includes(eventType)){
   const providerId=paypalOrderId(event);
   if(providerId){
    const admin=createAdminClient();
    await admin.from("orders").update({status:"failed"})
     .eq("provider","paypal").eq("provider_payment_id",providerId).eq("status","pending");
   }
   return NextResponse.json({ok:true,failed:true});
  }

  if(![
   "CHECKOUT.ORDER.APPROVED",
   "CHECKOUT.ORDER.COMPLETED",
   "PAYMENT.CAPTURE.COMPLETED"
  ].includes(eventType)){
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

  if(eventType==="CHECKOUT.ORDER.APPROVED"){
   await capturePaypalOrder(providerId,Number(order.amount_usd),order.id);
  }
  await verifyPaypalCompletedOrder(providerId,Number(order.amount_usd),order.id);
  const fulfilled=await fulfillPaidOrder(order.id,true);
  if(!fulfilled.ok)return NextResponse.json({error:"FULFILLMENT_PENDING"},{status:500});
  return NextResponse.json({ok:true});
 }catch(error){
  const msg=error instanceof Error?error.message:"PAYPAL_VERIFICATION_FAILED";
  console.error("[paypal webhook]",msg);
  if(msg==="WEBHOOK_EVENT_HASH_CONFLICT")return NextResponse.json({error:"WEBHOOK_EVENT_CONFLICT"},{status:409});
  return NextResponse.json({error:"PAYPAL_VERIFICATION_FAILED"},{status:422});
 }
}
