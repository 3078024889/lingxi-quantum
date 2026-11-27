import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { exchangeMiniCode } from "@/lib/mini/wechat";
import { miniAccountLinked } from "@/lib/mini/account";
import { miniJsapiTopupsEnabled, miniJsapiPayMissingReasons, createMiniJsapiOrder, buildMiniRequestPayment, queryMiniJsapiOrder, closeMiniJsapiOrder } from "@/lib/mini/tool-pay";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";
import { getProduct } from "@/lib/plans";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { trustedSiteOrigin } from "@/lib/platform/site-origin";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

export const runtime = "nodejs";
export const maxDuration = 30;
const REQUEST_ID = /^[0-9a-f]{32}$/i;

function conflict(message:string,orderId?:string){
 return NextResponse.json({error:message,code:"UNCONFIRMED_TOPUP_EXISTS",...(orderId?{orderId}:{})},{status:409,headers:{"Cache-Control":"private, no-store"}});
}
function providerOrderMatches(raw:any,outTradeNo:string,amountFen:number){
 return raw?.appid===process.env.WECHAT_MINI_APP_ID
  && raw?.mchid===process.env.WECHAT_MCH_ID
  && raw?.out_trade_no===outTradeNo
  && raw?.amount?.currency==="CNY"
  && Number(raw?.amount?.total)===amountFen;
}
async function closeAndMark(admin:any,orderId:string,outTradeNo:string){
 await closeMiniJsapiOrder(outTradeNo);
 const {error}=await admin.from("orders").update({status:"canceled"}).eq("id",orderId).eq("status","pending");
 if(error)throw new Error("MINI_JSAPI_LOCAL_CLOSE_FAILED");
}
async function existingOrderResponse(admin:any,order:any,openid:string,amountFen:number){
 if(order.status==="paid"){
  const result=await fulfillPaidOrder(order.id,true);
  return result.ok
   ?NextResponse.json({orderId:order.id,paid:true,status:"paid"},{headers:{"Cache-Control":"private, no-store"}})
   :NextResponse.json({error:"充值已确认，余额入账正在重试。",orderId:order.id},{status:503});
 }
 if(order.status!=="pending")return NextResponse.json({orderId:order.id,paid:false,closed:true,status:order.status});
 const event=await admin.from("wechat_mini_payment_events").select("payload")
  .eq("event_type","mini_jsapi_topup_order_created").eq("out_trade_no",order.provider_payment_id)
  .eq("transaction_id","created").maybeSingle();
 if(event.error)return conflict("原订单凭据正在核验，请稍后重试。",order.id);
 const prepayId=typeof event.data?.payload?.prepayId==="string"?event.data.payload.prepayId:"";
 let raw:any;
 try{raw=await queryMiniJsapiOrder(order.provider_payment_id)}
 catch(error){
  const message=error instanceof Error?error.message:"";
  if(message.includes("MINI_WECHAT_API_404_ORDER_NOT_EXIST")){
   const ageMs=Date.now()-Date.parse(String(order.created_at||""));
   if(!Number.isFinite(ageMs)||ageMs<90000)
    return conflict("微信订单正在创建或同步，原订单已保留，请稍后核验。",order.id);
   await admin.from("orders").update({status:"failed"}).eq("id",order.id).eq("status","pending");
   return NextResponse.json({orderId:order.id,paid:false,closed:true,status:"failed"});
  }
  return conflict("微信仍在核验原订单状态，请勿重复充值。",order.id);
 }
 if(raw.trade_state==="SUCCESS"){
  if(!providerOrderMatches(raw,order.provider_payment_id,amountFen)||raw?.payer?.openid!==openid)
   return NextResponse.json({error:"微信订单金额或支付身份不匹配，已停止入账。",orderId:order.id},{status:422});
  const result=await fulfillPaidOrder(order.id,true);
  return result.ok
   ?NextResponse.json({orderId:order.id,paid:true,status:"paid"})
   :NextResponse.json({error:"充值已确认，余额入账正在重试。",orderId:order.id},{status:503});
 }
 if(raw.trade_state==="CLOSED"||raw.trade_state==="REVOKED"||raw.trade_state==="PAYERROR"){
  await admin.from("orders").update({status:"canceled"}).eq("id",order.id).eq("status","pending");
  return NextResponse.json({orderId:order.id,paid:false,closed:true,status:"canceled"});
 }
 if(raw.trade_state==="NOTPAY"&&prepayId&&providerOrderMatches(raw,order.provider_payment_id,amountFen)&&raw?.payer?.openid===openid){
  return NextResponse.json({orderId:order.id,pending:true,providerConfirmedUnpaid:true,payment:buildMiniRequestPayment(prepayId)},
   {headers:{"Cache-Control":"private, no-store"}});
 }
 if(raw.trade_state==="NOTPAY"&&!prepayId){
  try{await closeAndMark(admin,order.id,order.provider_payment_id)}
  catch{return conflict("微信订单已创建但支付凭据未保存，正在安全核验，请勿重复充值。",order.id)}
  return NextResponse.json({orderId:order.id,paid:false,closed:true,status:"canceled"});
 }
 return conflict("微信仍在核验原订单状态，请勿重复充值。",order.id);
}

export async function POST(req:Request){
 if(!miniJsapiTopupsEnabled()){
  return NextResponse.json({error:"小程序人民币商户支付暂未开放。",code:"MINI_JSAPI_TOPUP_NOT_READY",missing:miniJsapiPayMissingReasons()},{status:503});
 }
 const declared=Number(req.headers.get("content-length")||0);
 if(Number.isFinite(declared)&&declared>8192)return NextResponse.json({error:"请求过大"},{status:413});
 if(!(await checkRateLimit(`mini-jsapi-topup-ip:${getClientIp(req)}`,20,600)))
  return NextResponse.json({error:"请稍后再试"},{status:429});
 const session=await requireMiniSession(req);
 if(!session)return NextResponse.json({error:"登录状态已失效"},{status:401});
 if(!session.accountConnected)return NextResponse.json({error:"请先连接灵犀场账户并确认到账账户",code:"ACCOUNT_CONNECTION_REQUIRED"},{status:409});
 if(!(await checkRateLimit(`mini-jsapi-topup-user:${session.userId}`,10,600)))
  return NextResponse.json({error:"请稍后再试"},{status:429});
 const raw=await req.text();
 if(raw.length>8192)return NextResponse.json({error:"请求过大"},{status:413});
 let body:any;try{body=JSON.parse(raw)}catch{body=null}
 const productId=typeof body?.productId==="string"?body.productId:"";
 const code=typeof body?.code==="string"?body.code:"";
 const requestId=typeof body?.requestId==="string"?body.requestId:"";
 if(!/^sasi-balance-(10|88|666|888|custom-(0|[1-9][0-9]{0,4})(\.[0-9]{1,2})?)$/.test(productId)||!REQUEST_ID.test(requestId)||!code||code.length>256)
  return NextResponse.json({error:"充值金额或请求编号无效"},{status:400});
 const product=getProduct(productId);
 if(!product||product.group!=="production"||!Number.isSafeInteger(product.sasiAmountFen)||!product.sasiAmountFen)
  return NextResponse.json({error:"充值金额配置无效"},{status:400});
 const amountFen=product.sasiAmountFen;
 const admin=createAdminClient();
 try{
  if(!(await miniAccountLinked(session.userId)))
   return NextResponse.json({error:"请先连接灵犀场账户，再充值到账户余额",code:"ACCOUNT_LINK_REQUIRED"},{status:409});
  const fresh=await exchangeMiniCode(code);
  if(fresh.openid!==session.openid)return NextResponse.json({error:"微信身份不一致"},{status:403});
  const outTradeNo="LXM"+createHash("sha256").update(session.userId+":"+requestId).digest("hex").slice(0,29).toUpperCase();
  const {data:existing,error:lookupError}=await admin.from("orders")
   .select("id,user_id,product_id,status,provider_payment_id,amount_rmb,created_at")
   .eq("provider","wechat").eq("channel","mini-program").eq("provider_payment_id",outTradeNo).maybeSingle();
  if(lookupError)throw new Error("MINI_JSAPI_IDEMPOTENCY_LOOKUP_FAILED");
  if(existing){
   if(existing.user_id!==session.userId||existing.product_id!==productId||Math.round(Number(existing.amount_rmb)*100)!==amountFen)
    return NextResponse.json({error:"请求编号已用于其他充值，请重新确认金额"},{status:409});
   return await existingOrderResponse(admin,existing,session.openid,amountFen);
  }

  const {data:legacyPending,error:legacyError}=await admin.from("orders").select("id")
   .eq("user_id",session.userId).eq("provider","wechat_mini_virtual").eq("status","pending")
   .like("product_id","sasi-balance-%").order("created_at",{ascending:false}).limit(5);
  if(legacyError)throw new Error("MINI_LEGACY_TOPUP_LOOKUP_FAILED");
  for(const legacy of legacyPending||[]){
   let state:any;
   try{state=await reconcileVirtualToolOrder(legacy.id,session.userId)}
   catch{return conflict("旧充值订单仍在微信核验，请先确认原订单，不会创建新订单。")}
   if(state.paid||state.closed)continue;
   return conflict("检测到尚未结束的旧充值订单，请先核验原订单，不会重复扣款。");
  }

  const orderId=randomUUID();
  const snapshot={kind:"mini_jsapi_topup",orderId,requestId,productId,amountFen,openid:session.openid,
   appId:process.env.WECHAT_MINI_APP_ID,outTradeNo};
  const {data:reservation,error:reserveError}=await admin.rpc("reserve_mini_cny_jsapi_topup_order",{
   p_order_id:orderId,p_user_id:session.userId,p_product_id:productId,p_amount_rmb:amountFen/100,
   p_out_trade_no:outTradeNo,p_snapshot:snapshot,
  });
  if(reserveError)throw new Error("MINI_JSAPI_ATOMIC_RESERVATION_FAILED");
  const reserved=Array.isArray(reservation)?reservation[0]:reservation;
  // The reservation is serialized per account and returns the blocking order.
  // Preserve that identifier so a fresh device can recover it instead of looping
  // forever with a request ID that never owned the existing reservation.
  if(!reserved?.ok)return conflict("还有一笔充值待确认，请继续查看原订单。",
   typeof reserved?.orderId==="string"?reserved.orderId:undefined);

  let prepayId="";
  try{
   prepayId=await createMiniJsapiOrder({outTradeNo,description:"灵犀场人民币余额充值",amountFen,
    notifyUrl:`${trustedSiteOrigin(req)}/api/pay/wechat/notify`,openid:fresh.openid});
  }catch(error){
   try{
    const rawState=await queryMiniJsapiOrder(outTradeNo);
    if(rawState.trade_state==="SUCCESS"){
     if(!providerOrderMatches(rawState,outTradeNo,amountFen)||rawState?.payer?.openid!==fresh.openid)
      throw new Error("MINI_JSAPI_PROVIDER_ORDER_MISMATCH");
     const result=await fulfillPaidOrder(orderId,true);
     if(result.ok)return NextResponse.json({orderId,paid:true,status:"paid"});
     return NextResponse.json({error:"充值已确认，余额入账正在重试。",orderId},{status:503});
    }
    if(rawState.trade_state==="NOTPAY")await closeAndMark(admin,orderId,outTradeNo);
    else if(rawState.trade_state==="CLOSED"||rawState.trade_state==="REVOKED"||rawState.trade_state==="PAYERROR")
     await admin.from("orders").update({status:"canceled"}).eq("id",orderId).eq("status","pending");
   }catch(reconcileError){
    const reconciliationMessage=reconcileError instanceof Error?reconcileError.message:"";
    if(reconciliationMessage.includes("MINI_WECHAT_API_404_ORDER_NOT_EXIST"))
     return conflict("微信订单暂时不可查，原订单已锁定等待后续核验，请勿重复充值。",orderId);
    else return conflict("微信下单结果暂不明确，订单已锁定等待核验，请勿重复充值。",orderId);
   }
   console.error("[mini jsapi create]",error instanceof Error?error.message:"unknown");
   return NextResponse.json({error:"微信支付订单暂未创建成功，请稍后重新检查。",orderId},{status:503});
  }

  const {data:saved,error:saveError}=await admin.from("wechat_mini_payment_events").update({
   payload:{...snapshot,prepayId,prepayCreatedAt:new Date().toISOString()},
  }).eq("event_type","mini_jsapi_topup_order_created").eq("out_trade_no",outTradeNo)
   .eq("transaction_id","created").select("id").maybeSingle();
  if(saveError||!saved){
   try{await closeAndMark(admin,orderId,outTradeNo)}
   catch{return conflict("支付凭据保存失败，微信订单仍在安全核验，请勿重复充值。",orderId)}
   return NextResponse.json({error:"支付凭据未能安全保存，订单已关闭，可重新发起充值。",orderId,closed:true},{status:503});
  }
  return NextResponse.json({orderId,amountFen,payment:buildMiniRequestPayment(prepayId)},
   {headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  console.error("[mini CNY JSAPI topup]",error instanceof Error?error.message:"unknown");
  return NextResponse.json({error:"充值订单准备未完成，请稍后重试；不会重复扣款。"},{status:503});
 }
}
