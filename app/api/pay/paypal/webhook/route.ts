import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {verifyPaypalWebhook,verifyPaypalCompletedOrder} from "@/lib/paypal";
import {fulfillPaidOrder} from "@/lib/fulfill-order";

export const runtime="nodejs";
export const maxDuration=30;

function paypalOrderId(event:any){
 const r=event?.resource;
 return String(
   r?.supplementary_data?.related_ids?.order_id ||
   (String(event?.event_type||"").startsWith("CHECKOUT.ORDER.")?r?.id:"") ||
   ""
 );
}

export async function POST(req:Request){
 const raw=await req.text();
 if(!(await verifyPaypalWebhook(req.headers,raw))){
  return NextResponse.json({error:"INVALID_PAYPAL_SIGNATURE"},{status:401});
 }
 const event=JSON.parse(raw);
 const eventType=String(event?.event_type||"");
 if(!["PAYMENT.CAPTURE.COMPLETED","CHECKOUT.ORDER.COMPLETED"].includes(eventType)){
  return NextResponse.json({ok:true,ignored:true});
 }
 const providerId=paypalOrderId(event);
 if(!providerId)return NextResponse.json({ok:true,ignored:true});
 const admin=createAdminClient();
 const{data:order}=await admin.from("orders").select("id,amount_usd,status,provider,provider_payment_id").eq("provider","paypal").eq("provider_payment_id",providerId).maybeSingle();
 if(!order)return NextResponse.json({ok:true,ignored:true});
 if(order.status==="paid")return NextResponse.json({ok:true,alreadyPaid:true});
 try{
  await verifyPaypalCompletedOrder(providerId,Number(order.amount_usd),order.id);
  const fulfilled=await fulfillPaidOrder(order.id);
  if(!fulfilled.ok)return NextResponse.json({error:"FULFILLMENT_PENDING"},{status:500});
  return NextResponse.json({ok:true});
 }catch(e){
  console.error("[paypal webhook]",e instanceof Error?e.message:String(e));
  return NextResponse.json({error:"PAYPAL_VERIFICATION_FAILED"},{status:422});
 }
}
