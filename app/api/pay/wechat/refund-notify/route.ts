import{NextResponse}from"next/server";
import{createAdminClient}from"@/lib/supabase/admin";
import{decryptWechatNotifyResource,verifyWechatNotifySignature}from"@/lib/wechatpay";
import{providerRequestKeyFromWechatRefundNo,wechatRefundNoFromRequestKey}from"@/lib/money/refund-identifiers";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=30;

type RefundResource={
 out_trade_no?:string;
 out_refund_no?:string;
 refund_id?:string;
 refund_status?:string;
 amount?:{refund?:number;total?:number;currency?:string};
};

function ok(){return NextResponse.json({code:"SUCCESS",message:"成功"})}
function fail(message:string,status=400){return NextResponse.json({code:"FAIL",message},{status})}

export async function POST(req:Request){
 try{
  const rawBody=await req.text();
  const timestamp=req.headers.get("Wechatpay-Timestamp")??"";
  const nonce=req.headers.get("Wechatpay-Nonce")??"";
  const signature=req.headers.get("Wechatpay-Signature")??"";
  const serial=req.headers.get("Wechatpay-Serial")??"";

  if(!verifyWechatNotifySignature({timestamp,nonce,body:rawBody,signature,serial})){
   return fail("签名验证失败",401);
  }

  const body=JSON.parse(rawBody);
  if(!String(body?.event_type||"").startsWith("REFUND."))return ok();
  if(body?.resource?.original_type&&body.resource.original_type!=="refund")return fail("资源类型错误",422);
  if(!body?.resource)return fail("缺少resource字段");

  const decrypted=decryptWechatNotifyResource(body.resource) as unknown as RefundResource;
  const outRefundNo=String(decrypted.out_refund_no||"");
  const requestKey=providerRequestKeyFromWechatRefundNo(outRefundNo);
  if(!requestKey)return fail("退款单号无效",422);

  const admin=createAdminClient();
  const{data:w,error:we}=await admin.from("balance_withdrawals")
   .select("id,order_id,provider,currency,provider_currency,provider_amount_minor,provider_request_key,status")
   .eq("provider_request_key",requestKey)
   .maybeSingle();
  if(we)return fail("查询失败",503);
  if(!w)return ok();

  if(
   w.provider!=="wechat"||
   w.currency!=="CNY"||
   w.provider_currency!=="CNY"||
   wechatRefundNoFromRequestKey(w.provider_request_key)!==outRefundNo
  )return fail("退款记录校验失败",422);

  const{data:order}=await admin.from("orders")
   .select("provider_payment_id")
   .eq("id",w.order_id)
   .maybeSingle();
  if(!order||String(order.provider_payment_id)!==String(decrypted.out_trade_no||"")){
   return fail("原订单校验失败",422);
  }

  const amount=decrypted.amount;
  if(!amount||amount.currency!=="CNY"||Number(amount.refund)!==Number(w.provider_amount_minor)){
   return fail("退款金额校验失败",422);
  }

  const refundId=String(decrypted.refund_id||"").trim();
  const status=String(decrypted.refund_status||"").toUpperCase();

  if(status==="SUCCESS"){
   if(!refundId)return fail("缺少微信退款号",422);
   const{error}=await admin.rpc("complete_balance_withdrawal",{
    p_withdrawal_id:w.id,
    p_provider_refund_id:refundId,
    p_provider_status:"SUCCESS",
   });
   if(error){
    console.error("[wechat refund notify complete]",error.message);
    return fail("处理失败",500);
   }
   return ok();
  }

  if(status==="CLOSED"){
   const{error}=await admin.rpc("release_balance_withdrawal",{
    p_withdrawal_id:w.id,
    p_failure_code:"WECHAT_CLOSED",
    p_provider_status:"CLOSED",
   });
   if(error){
    console.error("[wechat refund notify release]",error.message);
    return fail("处理失败",500);
   }
   return ok();
  }

  if(status==="ABNORMAL"){
   await admin.from("balance_withdrawals").update({
    provider_refund_id:refundId||null,
    provider_status:"ABNORMAL",
    failure_code:"PROVIDER_ACTION_REQUIRED",
    last_provider_error_code:"WECHAT_ABNORMAL",
    last_provider_checked_at:new Date().toISOString(),
    next_reconcile_at:new Date(Date.now()+12*60*60*1000).toISOString(),
    updated_at:new Date().toISOString(),
   }).eq("id",w.id).in("status",["requested","processing"]);
   return ok();
  }

  await admin.from("balance_withdrawals").update({
   provider_refund_id:refundId||null,
   provider_status:status||"PROCESSING",
   failure_code:"PROVIDER_CONFIRMATION_PENDING",
   last_provider_checked_at:new Date().toISOString(),
   next_reconcile_at:new Date(Date.now()+5*60*1000).toISOString(),
   updated_at:new Date().toISOString(),
  }).eq("id",w.id).in("status",["requested","processing"]);
  return ok();
 }catch(error){
  console.error("[wechat refund notify]",error instanceof Error?error.message:"unknown");
  return fail("处理异常",500);
 }
}
