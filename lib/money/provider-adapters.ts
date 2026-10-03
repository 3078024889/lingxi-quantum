import type{MoneyRefundProviderAdapter}from"./provider-adapter";
import type{ProviderRefundObservation,ProviderRefundRequest}from"./types";
import{createWechatRefund,queryWechatRefund}from"@/lib/wechatpay";
import{createAlipayRefund,queryAlipayRefund}from"@/lib/alipay";
import{createPaypalRefund,queryPaypalRefund,verifyPaypalCompletedOrder}from"@/lib/paypal";
import{wechatRefundNoFromRequestKey}from"./refund-identifiers";

function compactStatus(value:unknown){return String(value??"").slice(0,120)}

function assertWechatRefund(r:ProviderRefundRequest,x:any){
 const raw=x?.raw||{};
 if(raw.out_trade_no&&String(raw.out_trade_no)!==r.providerPaymentId)throw new Error("WECHAT_REFUND_ORDER_MISMATCH");
 const amount=raw.amount;
 if(amount){
  if(String(amount.currency||"CNY")!=="CNY")throw new Error("WECHAT_REFUND_CURRENCY_MISMATCH");
  if(Number(amount.refund)!==Number(r.providerAmountMinor))throw new Error("WECHAT_REFUND_AMOUNT_MISMATCH");
 }
}

function assertPaypalRefund(r:ProviderRefundRequest,x:any){
 const raw=x?.raw||{};
 const amount=raw.amount;
 if(amount?.currency_code&&String(amount.currency_code)!=="USD")throw new Error("PAYPAL_REFUND_CURRENCY_MISMATCH");
 if(amount?.value!=null&&Math.round(Number(amount.value)*100)!==Number(r.providerAmountMinor))throw new Error("PAYPAL_REFUND_AMOUNT_MISMATCH");
}

function mapWechat(x:{refundId:string;status:string;raw:any}):ProviderRefundObservation{
 const s=x.status.toUpperCase();
 if(s==="SUCCESS")return{status:"succeeded",providerRefundId:x.refundId,providerStatus:s,rawStatus:s};
 if(s==="CLOSED")return{status:"failed",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,errorCode:"WECHAT_CLOSED"};
 if(s==="ABNORMAL")return{status:"pending",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,errorCode:"WECHAT_ABNORMAL",retryAfterSeconds:12*60*60};
 return{status:"pending",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,retryAfterSeconds:60};
}

function mapAlipay(x:{refundId:string;status:string;raw:any}):ProviderRefundObservation{
 const s=x.status.toUpperCase();
 if(s==="SUCCESS")return{status:"succeeded",providerRefundId:x.refundId,providerStatus:s,rawStatus:s};
 if(s.startsWith("FAILED:"))return{
  status:"pending",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,
  errorCode:`ALIPAY_${s.slice(7,100)}`,retryAfterSeconds:12*60*60
 };
 if(s==="NOT_EXIST")return{
  status:"pending",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,
  errorCode:"ALIPAY_REFUND_NOT_EXIST",retryAfterSeconds:5*60
 };
 return{status:"pending",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,retryAfterSeconds:60};
}

function mapPaypal(x:{refundId:string;status:string;raw:any}):ProviderRefundObservation{
 const s=x.status.toUpperCase();
 if(s==="COMPLETED")return{status:"succeeded",providerRefundId:x.refundId,providerStatus:s,rawStatus:s};
 if(["FAILED","CANCELLED"].includes(s))return{status:"failed",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,errorCode:`PAYPAL_${s}`};
 return{status:"pending",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,retryAfterSeconds:60};
}

export class WechatRefundAdapter implements MoneyRefundProviderAdapter{
 readonly id="wechat";
 async createRefund(r:ProviderRefundRequest){
  if(r.providerCurrency!=="CNY")throw new Error("WECHAT_PROVIDER_CURRENCY_MISMATCH");
  const x=await createWechatRefund({
   outTradeNo:r.providerPaymentId,
   outRefundNo:wechatRefundNoFromRequestKey(r.idempotencyKey),
   refundFen:r.providerAmountMinor,
   totalFen:(r as ProviderRefundRequest&{orderTotalMinor?:number}).orderTotalMinor||r.providerAmountMinor,
   reason:"LINGXIFIELD balance refund"
  });
  assertWechatRefund(r,x);
  return mapWechat(x);
 }
 async queryRefund(r:ProviderRefundRequest&{providerRefundId?:string|null}){
  const x=await queryWechatRefund(wechatRefundNoFromRequestKey(r.idempotencyKey));
  assertWechatRefund(r,x);
  return mapWechat(x);
 }
}

export class AlipayRefundAdapter implements MoneyRefundProviderAdapter{
 readonly id="alipay";
 async createRefund(r:ProviderRefundRequest){
  if(r.providerCurrency!=="CNY")throw new Error("ALIPAY_PROVIDER_CURRENCY_MISMATCH");
  const outRequestNo=r.idempotencyKey.replace(/^lf-refund-/,"LFR").replace(/[^A-Za-z0-9_-]/g,"").slice(0,64);
  return mapAlipay(await createAlipayRefund({outTradeNo:r.providerPaymentId,outRequestNo,refundFen:r.providerAmountMinor}));
 }
 async queryRefund(r:ProviderRefundRequest&{providerRefundId?:string|null}){
  const outRequestNo=r.idempotencyKey.replace(/^lf-refund-/,"LFR").replace(/[^A-Za-z0-9_-]/g,"").slice(0,64);
  return mapAlipay(await queryAlipayRefund({outTradeNo:r.providerPaymentId,outRequestNo}));
 }
}

export class PaypalRefundAdapter implements MoneyRefundProviderAdapter{
 readonly id="paypal";
 async createRefund(r:ProviderRefundRequest){
  if(r.providerCurrency!=="USD")throw new Error("PAYPAL_PROVIDER_CURRENCY_MISMATCH");
  const orderTotalMinor=(r as ProviderRefundRequest&{orderTotalMinor?:number}).orderTotalMinor;
  if(!orderTotalMinor)throw new Error("PAYPAL_ORDER_TOTAL_REQUIRED");
  const verified=await verifyPaypalCompletedOrder(r.providerPaymentId,orderTotalMinor/100,r.orderId);
  const x=await createPaypalRefund({captureId:verified.captureId,requestId:r.idempotencyKey,amountCents:r.providerAmountMinor});
  assertPaypalRefund(r,x);
  return mapPaypal(x);
 }
 async queryRefund(r:ProviderRefundRequest&{providerRefundId?:string|null}){
  if(!r.providerRefundId)throw new Error("PAYPAL_REFUND_ID_REQUIRED");
  const x=await queryPaypalRefund(r.providerRefundId);
  assertPaypalRefund(r,x);
  return mapPaypal(x);
 }
}

export function moneyProviderAdapters(){
 return new Map<string,MoneyRefundProviderAdapter>([
  ["wechat",new WechatRefundAdapter()],
  ["alipay",new AlipayRefundAdapter()],
  ["paypal",new PaypalRefundAdapter()],
 ]);
}

export function safeProviderError(error:unknown){
 const message=error instanceof Error?error.message:"UNKNOWN";
 return compactStatus(message.replace(/[^\w:.-]/g,"_"));
}
