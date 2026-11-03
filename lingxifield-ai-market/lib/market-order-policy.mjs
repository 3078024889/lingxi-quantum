/**
 * Marketplace-order state machine and currency/amount invariants.
 * Does not contact a payment network, write a ledger or authorize fulfillment.
 * Every proof passed here MUST ALREADY have been cryptographically verified by
 * the provider adapter; client input must never be used as a proof.
 */
export const PAID_PLANS=Object.freeze({sponsored:4900,category:14900,brand:29900});
const providerCurrency=Object.freeze({alipay:'CNY',wechat:'CNY',paypal:'USD'});
const safeRef=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{8,64}$/.test(v);
const isMinor=v=>Number.isSafeInteger(v)&&v>0&&v<=100000000;
export function merchantQuote({planId,currency,provider}){
 if(!Object.hasOwn(PAID_PLANS,planId))throw Error('UNKNOWN_OR_NOT_FOR_SALE_PLAN');
 if(!Object.hasOwn(providerCurrency,provider))throw Error('UNKNOWN_PAYMENT_PROVIDER');
 if(providerCurrency[provider]!==currency)throw Error('PROVIDER_CURRENCY_MISMATCH');
 return Object.freeze({planId,currency,provider,amountMinor:PAID_PLANS[planId]});
}
/** Only a verified provider notification, never a browser redirect, can advance payment. */
export function decideCapturedPayment({order,verifiedProof,seenEventId=false}){
 if(!order||!verifiedProof||seenEventId===undefined)throw Error('INVALID_LEDGER_EVENT');
 if(!safeRef(order.merchantOrderRef)||!safeRef(verifiedProof.merchantOrderRef))throw Error('INVALID_ORDER_REF');
 if(order.merchantOrderRef!==verifiedProof.merchantOrderRef)throw Error('ORDER_REFERENCE_MISMATCH');
 if(!Object.hasOwn(PAID_PLANS,order.planId))throw Error('UNKNOWN_OR_NOT_FOR_SALE_PLAN');
 const expected=merchantQuote({planId:order.planId,currency:order.currency,provider:order.provider});
 if(order.amountMinor!==expected.amountMinor||
    verifiedProof.amountMinor!==expected.amountMinor||
    verifiedProof.currency!==expected.currency||
    verifiedProof.provider!==expected.provider)throw Error('SETTLEMENT_MISMATCH');
 if(!safeRef(verifiedProof.providerTransactionId)||!safeRef(verifiedProof.providerEventId))throw Error('INVALID_PROVIDER_REFERENCE');
 if(verifiedProof.signatureVerified!==true)throw Error('PROVIDER_SIGNATURE_NOT_VERIFIED');
 if(!Number.isFinite(Date.parse(verifiedProof.verifiedAt||'')))throw Error('VERIFICATION_TIMESTAMP_MISSING');
 if(seenEventId||order.status==='paid'){
  if(order.status!=='paid'||order.providerPaymentRef!==verifiedProof.providerTransactionId)throw Error('IDEMPOTENCY_CONFLICT');
  return Object.freeze({action:'noop',reason:'already_paid'});
 }
 if(!['created','pending'].includes(order.status))throw Error('INVALID_PAYMENT_STATE');
 return Object.freeze({action:'capture',providerPaymentRef:verifiedProof.providerTransactionId,amountMinor:expected.amountMinor,currency:expected.currency});
}
/** Validate refund totals against the captured amount before sending to a provider. */
export function authorizeRefund({order,refundAmountMinor,previousRefundedMinor=0,providerRefundRef}){
 if(!order||!['paid','partially_refunded'].includes(order.status))throw Error('ORDER_NOT_REFUNDABLE');
 if(!safeRef(providerRefundRef))throw Error('INVALID_REFUND_REF');
 const q=merchantQuote({planId:order.planId,currency:order.currency,provider:order.provider});
 if(!order.paidVerifiedAt||!order.providerPaymentRef||order.amountMinor!==q.amountMinor)throw Error('ORDER_NOT_VERIFIED');
 if(!Number.isSafeInteger(previousRefundedMinor)||previousRefundedMinor<0||previousRefundedMinor>order.amountMinor)throw Error('INVALID_REFUNDED_TOTAL');
 if(!isMinor(refundAmountMinor)||previousRefundedMinor+refundAmountMinor>order.amountMinor)throw Error('REFUND_EXCEEDS_CAPTURE');
 return Object.freeze({amountMinor:refundAmountMinor,currency:order.currency,provider:order.provider,nextRefundedMinor:previousRefundedMinor+refundAmountMinor});
}
