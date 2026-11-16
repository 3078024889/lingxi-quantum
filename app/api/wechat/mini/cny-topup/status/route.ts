import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { queryMiniJsapiOrder, buildMiniRequestPayment, closeMiniJsapiOrder } from "@/lib/mini/tool-pay";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req:Request){
 const session=await requireMiniSession(req);
 if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});
 if(!(await checkRateLimit(`mini-jsapi-status:${session.userId}`,30,60)))
  return NextResponse.json({error:"请稍后查看订单"},{status:429});
 const orderId=new URL(req.url).searchParams.get("orderId")||"";
 if(!/^[0-9a-f-]{36}$/i.test(orderId))return NextResponse.json({error:"订单无效"},{status:400});
 const admin=createAdminClient();
 const {data:order,error}=await admin.from("orders").select("id,user_id,product_id,amount_rmb,status,provider,provider_payment_id,channel")
  .eq("id",orderId).eq("user_id",session.userId).eq("provider","wechat").eq("channel","mini-program").maybeSingle();
 if(error||!order)return NextResponse.json({error:"订单不存在"},{status:404});
 if(order.status==="paid"){
  const fulfilled=await fulfillPaidOrder(order.id,true);
  return fulfilled.ok?NextResponse.json({paid:true,status:"paid"}):NextResponse.json({paid:false,error:"余额入账正在重试"},{status:503});
 }
 if(order.status!=="pending")return NextResponse.json({paid:false,closed:true,status:order.status});
 const outTradeNo=String(order.provider_payment_id||"");
 const amountFen=Math.round(Number(order.amount_rmb)*100);
 const {data:event,error:eventError}=await admin.from("wechat_mini_payment_events").select("payload")
  .eq("event_type","mini_jsapi_topup_order_created").eq("out_trade_no",outTradeNo).eq("transaction_id","created").maybeSingle();
 if(eventError||!event)return NextResponse.json({error:"支付凭据暂不可用，请稍后重试"},{status:503});
 const snapshot=event.payload as Record<string,unknown>;
 if(snapshot.openid!==session.openid||snapshot.appId!==process.env.WECHAT_MINI_APP_ID||snapshot.orderId!==order.id)
  return NextResponse.json({error:"支付身份不匹配"},{status:422});
 let provider:any;
 try{provider=await queryMiniJsapiOrder(outTradeNo)}
 catch(error){
  const message=error instanceof Error?error.message:"";
  if(message.includes("MINI_WECHAT_API_404_ORDER_NOT_EXIST")){
   await admin.from("orders").update({status:"failed"}).eq("id",order.id).eq("status","pending");
   return NextResponse.json({paid:false,closed:true,status:"failed"});
  }
  return NextResponse.json({paid:false,error:"微信支付状态仍在核验，请勿重复充值"},{status:503});
 }
 if(provider?.appid!==process.env.WECHAT_MINI_APP_ID||provider?.mchid!==process.env.WECHAT_MCH_ID||provider?.out_trade_no!==outTradeNo)
  return NextResponse.json({error:"微信订单身份校验失败"},{status:422});
 const amount=provider?.amount;
 if(!amount||amount.currency!=="CNY"||Number(amount.total)!==amountFen)
  return NextResponse.json({error:"微信订单金额校验失败"},{status:422});
 if(provider.trade_state==="SUCCESS"){
  if(provider?.payer?.openid!==session.openid)
   return NextResponse.json({error:"实际付款身份与订单不匹配"},{status:422});
  const fulfilled=await fulfillPaidOrder(order.id,true);
  if(!fulfilled.ok)return NextResponse.json({paid:false,error:"付款已确认，余额入账正在重试"},{status:503});
  return NextResponse.json({paid:true,status:"paid"},{headers:{"Cache-Control":"private, no-store"}});
 }
 if(provider.trade_state==="CLOSED"||provider.trade_state==="REVOKED"||provider.trade_state==="PAYERROR"){
  await admin.from("orders").update({status:"canceled"}).eq("id",order.id).eq("status","pending");
  return NextResponse.json({paid:false,closed:true,status:"canceled"});
 }
 if(provider.trade_state==="NOTPAY"){
  const prepayId=typeof snapshot.prepayId==="string"?snapshot.prepayId:"";
  if(prepayId)return NextResponse.json({paid:false,providerConfirmedUnpaid:true,payment:buildMiniRequestPayment(prepayId)},
   {headers:{"Cache-Control":"private, no-store"}});
  try{
   await closeMiniJsapiOrder(outTradeNo);
   await admin.from("orders").update({status:"canceled"}).eq("id",order.id).eq("status","pending");
   return NextResponse.json({paid:false,closed:true,status:"canceled"});
  }catch{
   return NextResponse.json({paid:false,error:"微信确认未付款，但原订单关闭尚未完成，请稍后重试"},{status:503});
  }
 }
 return NextResponse.json({paid:false,status:String(provider.trade_state||"PROCESSING")},{headers:{"Cache-Control":"private, no-store"}});
}
