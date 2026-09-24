import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaypalWebhook,queryPaypalOrder } from "@/lib/paypal";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
export const runtime="nodejs";export const maxDuration=30;
export async function POST(req:Request){
 const raw=await req.text();if(!await verifyPaypalWebhook(req.headers,raw))return NextResponse.json({error:"INVALID_WEBHOOK_SIGNATURE"},{status:401});
 let event:any;try{event=JSON.parse(raw)}catch{return NextResponse.json({error:"INVALID_PAYLOAD"},{status:400})}
 const type=String(event.event_type||""),paypalOrderId=event.resource?.supplementary_data?.related_ids?.order_id||(type==="CHECKOUT.ORDER.APPROVED"?event.resource?.id:null);
 if(!paypalOrderId)return NextResponse.json({ok:true});
 const admin=createAdminClient(),{data:order}=await admin.from("orders").select("id,amount_usd,provider,status").eq("provider_payment_id",paypalOrderId).maybeSingle();
 if(!order)return NextResponse.json({ok:true});
 if(order.provider!=="paypal")return NextResponse.json({error:"PROVIDER_MISMATCH"},{status:422});
 if(type==="PAYMENT.CAPTURE.DENIED"){await admin.from("orders").update({status:"failed"}).eq("id",order.id).neq("status","paid");return NextResponse.json({ok:true})}
 if(type==="PAYMENT.CAPTURE.PENDING"||type==="CHECKOUT.ORDER.APPROVED")return NextResponse.json({ok:true});
 if(type==="PAYMENT.CAPTURE.COMPLETED"){
  try{const verified=await queryPaypalOrder(paypalOrderId,Number(order.amount_usd),order.id);if(!["APPROVED","COMPLETED"].includes(verified.status))return NextResponse.json({error:"PAYPAL_ORDER_NOT_APPROVED"},{status:409});const result=await fulfillPaidOrder(order.id);if(!result.ok)return NextResponse.json({error:"FULFILLMENT_PENDING"},{status:500})}
  catch(e){console.error("[paypal webhook verify]",e instanceof Error?e.message:String(e));return NextResponse.json({error:"PAYPAL_ORDER_VERIFY_FAILED"},{status:422})}
 }
 return NextResponse.json({ok:true});
}
