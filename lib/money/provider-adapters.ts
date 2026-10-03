import type{MoneyRefundProviderAdapter}from"./provider-adapter";
import type{ProviderRefundObservation,ProviderRefundRequest}from"./types";
import{createWechatRefund,queryWechatRefund}from"@/lib/wechatpay";
import{createAlipayRefund,queryAlipayRefund}from"@/lib/alipay";
import{createPaypalRefund,queryPaypalRefund,verifyPaypalCompletedOrder}from"@/lib/paypal";
import{wechatRefundNoFromRequestKey}from"./refund-identifiers";

function compactStatus(value:unknown){return String(value??"").slice(0,120)}

function mapWechat(x:{refundId:string;status:string;raw:any}):ProviderRefundObservation{
 const s=x.status.toUpperCase();
 if(s==="SUCCESS")return{status:"succeeded",providerRefundId:x.refundId,providerStatus:s,rawStatus:s};
 if(["CLOSED","ABNORMAL"].includes(s))return{status:"failed",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,errorCode:`WECHAT_${s}`};
 return{status:"pending",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,retryAfterSeconds:60};
}
function mapAlipay(x:{refundId:string;status:string;raw:any}):ProviderRefundObservation{
 const s=x.status.toUpperCase();
 if(s==="SUCCESS")return{status:"succeeded",providerRefundId:x.refundId,providerStatus:s,rawStatus:s};
 if(s.startsWith("FAILED:"))return{status:"failed",providerRefundId:x.refundId||null,providerStatus:s,rawStatus:s,errorCode:`ALIPAY_${s.slice(7,100)}`};
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
  if(r.currency!=="CNY"||r.providerCurrency!=="CNY")throw new Error("WECHAT_CURRENCY_MISMATCH");
  return mapWechat(await createWechatRefund({
    outTradeNo:r.providerPaymentId,
    outRefundNo:wechatRefundNoFromRequestKey(r.idempotencyKey),
    refundFen:r.providerAmountMinor,
    totalFen:(r as ProviderRefundRequest&{orderTotalMinor?:number}).orderTotalMinor||r.providerAmountMinor,
    reason:"LINGXIFIELD balance refund"
  }));
 }
 async queryRefund(r:ProviderRefundRequest&{providerRefundId?:string|null}){
  const outRefundNo=wechatRefundNoFromRequestKey(r.idempotencyKey);
  return mapWechat(await queryWechatRefund(outRefundNo));
 }
}

export class AlipayRefundAdapter implements MoneyRefundProviderAdapter{
 readonly id="alipay";
 async createRefund(r:ProviderRefundRequest){
  if(r.currency!=="CNY"||r.providerCurrency!=="CNY")throw new Error("ALIPAY_CURRENCY_MISMATCH");
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
  if(r.currency!=="USD"||r.providerCurrency!=="USD")throw new Error("PAYPAL_CURRENCY_MISMATCH");
  const orderTotalMinor=(r as ProviderRefundRequest&{orderTotalMinor?:number}).orderTotalMinor;
  if(!orderTotalMinor)throw new Error("PAYPAL_ORDER_TOTAL_REQUIRED");
  const verified=await verifyPaypalCompletedOrder(r.providerPaymentId,orderTotalMinor/100,r.orderId);
  return mapPaypal(await createPaypalRefund({captureId:verified.captureId,requestId:r.idempotencyKey,amountCents:r.providerAmountMinor}));
 }
 async queryRefund(r:ProviderRefundRequest&{providerRefundId?:string|null}){
  if(!r.providerRefundId)throw new Error("PAYPAL_REFUND_ID_REQUIRED");
  return mapPaypal(await queryPaypalRefund(r.providerRefundId));
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
