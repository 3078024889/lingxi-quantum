import {merchantQuote} from './market-order-policy.mjs';
const allowedPlans=new Set(['listing','sponsored','category','brand']);
const currencies=new Set(['CNY','USD']);
const providerCurrency={paypal:'USD',wechat:'CNY',alipay:'CNY'};
/**
 * Read-only marketplace quote; no order creation, payment URL or entitlement.
 * The publisher product ID must refer to an existing curated product.
 */
export function vendorPlacementQuote({productId,planId,currency,provider},curatedIds){
 if(!curatedIds||!curatedIds.includes(productId))throw Error('UNKNOWN_PRODUCT');
 if(typeof planId!=='string'||!allowedPlans.has(planId))throw Error('UNKNOWN_OR_NOT_FOR_SALE_PLAN');
 if(!currencies.has(currency))throw Error('INVALID_CURRENCY');
 if(planId==='listing'){
  if(provider!==null&&provider!==undefined&&provider!=='')throw Error('FREE_PLAN_HAS_NO_PAYMENT_PROVIDER');
  return Object.freeze({productId,planId,currency,provider:null,amountMinor:0,amount:0,
   interval:'monthly',merchantCheckoutReady:false,paymentUrl:null,
   fulfillment:'free_listing_subject_to_identity_review'});
 }
 if(!Object.hasOwn(providerCurrency,provider)||providerCurrency[provider]!==currency)
  throw Error('PROVIDER_CURRENCY_MISMATCH');
 const quote=merchantQuote({planId,currency,provider});
 return Object.freeze({productId,planId,currency,provider,amountMinor:quote.amountMinor,
  amount:quote.amountMinor/100,interval:planId==='brand'?'placement':'monthly',
  merchantCheckoutReady:false,paymentUrl:null,fulfillment:'pending_verified_merchant_and_vendor_identity'});
}
/**
 * No browser assertion may activate a sponsor slot.
 * A genuine future billing adapter must verify provider signature,
 * server-owned order, vendor identity, price/currency and paid settlement.
 */
export function vendorEntitlementDecision({verifiedOrder,approvedClaim,providerProof}){
 if(!verifiedOrder||!approvedClaim||!providerProof)throw Error('ENTITLEMENT_PROOF_REQUIRED');
 if(approvedClaim.status!=='approved'||approvedClaim.publisherId!==verifiedOrder.publisherId||
    approvedClaim.productId!==verifiedOrder.productId||
    approvedClaim.vendorUserId!==verifiedOrder.vendorUserId)throw Error('VENDOR_IDENTITY_MISMATCH');
 if(verifiedOrder.status!=='paid'||!verifiedOrder.paidVerifiedAt||
    providerProof.signatureVerified!==true||providerProof.orderRef!==verifiedOrder.merchantOrderRef||
    providerProof.transactionRef!==verifiedOrder.providerPaymentRef)throw Error('VERIFIED_PAYMENT_REQUIRED');
 const quote=vendorPlacementQuote({productId:verifiedOrder.productId,planId:verifiedOrder.planId,
  currency:verifiedOrder.currency,provider:verifiedOrder.provider},[verifiedOrder.productId]);
 if(quote.amountMinor!==verifiedOrder.amountMinor||providerProof.amountMinor!==quote.amountMinor||
    providerProof.currency!==quote.currency||providerProof.provider!==quote.provider)throw Error('ORDER_PRICE_OR_PROVIDER_MISMATCH');
 if(quote.planId==='listing')throw Error('FREE_LISTING_HAS_NO_PAID_PLACEMENT');
 if(!verifiedOrder.merchantOrderRef||!verifiedOrder.providerPaymentRef)throw Error('ORDER_REFERENCE_MISSING');
 return Object.freeze({decision:'eligible_for_reviewed_placement',productId:quote.productId,
  planId:quote.planId,merchantOrderRef:verifiedOrder.merchantOrderRef});
}
