import{NextResponse}from"next/server";
import{decryptWechatNotifyResource,isWechatNotifyTimestampFresh,verifyWechatNotifySignature}from"@/lib/wechatpay";
import{providerRequestKeyFromWechatRefundNo}from"@/lib/money/refund-identifiers";
import{enqueueMoneyWebhookEvent,payloadSha256}from"@/lib/money/webhook-inbox";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=15;

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

  if(!isWechatNotifyTimestampFresh(timestamp,300))return fail("通知时间戳已过期",401);
  if(!verifyWechatNotifySignature({timestamp,nonce,body:rawBody,signature,serial}))return fail("签名验证失败",401);

  const body=JSON.parse(rawBody);
  if(!String(body?.event_type||"").startsWith("REFUND."))return ok();
  if(body?.resource?.original_type&&body.resource.original_type!=="refund")return fail("资源类型错误",422);
  if(!body?.resource)return fail("缺少resource字段");

  const decrypted=decryptWechatNotifyResource(body.resource) as unknown as RefundResource;
  const outRefundNo=String(decrypted.out_refund_no||"");
  const requestKey=providerRequestKeyFromWechatRefundNo(outRefundNo);
  if(!requestKey)return fail("退款单号无效",422);

  const status=String(decrypted.refund_status||"UNKNOWN").toUpperCase();
  const hash=payloadSha256(rawBody);
  await enqueueMoneyWebhookEvent({
   provider:"wechat",
   eventKey:String(body?.id||hash),
   eventType:String(body?.event_type||`REFUND.${status}`),
   objectKey:requestKey,
   payload:{
    providerRefundId:String(decrypted.refund_id||""),
    providerStatus:status,
    outRefundNo,
    outTradeNo:String(decrypted.out_trade_no||""),
    refundMinor:Number(decrypted.amount?.refund||0),
    totalMinor:Number(decrypted.amount?.total||0),
    currency:String(decrypted.amount?.currency||""),
   },
   payloadHash:hash,
  });

  return ok();
 }catch(error){
  const msg=error instanceof Error?error.message:"WEBHOOK_FAILED";
  console.error("[wechat refund notify]",msg);
  if(msg==="WEBHOOK_EVENT_HASH_CONFLICT")return fail("通知冲突",409);
  return fail("处理异常",500);
 }
}
