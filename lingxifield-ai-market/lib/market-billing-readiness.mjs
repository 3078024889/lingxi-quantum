/**
 * Source-of-truth for merchant payment availability.
 * A merchant key alone is never permission to charge: account contract, orders,
 * identity checks, payment verification and fulfilment must be live as well.
 * No credential value or secret presence is returned to public callers.
 */
export const MARKET_PAYMENT_PROVIDERS=['alipay','wechat','paypal'];
const REQUIRED={
 alipay:['ALIPAY_APP_ID','ALIPAY_PRIVATE_KEY','ALIPAY_PUBLIC_KEY'],
 wechat:['WECHAT_APP_ID','WECHAT_MCH_ID','WECHAT_API_V3_KEY','WECHAT_PRIVATE_KEY','WECHAT_CERT_SERIAL_NO','WECHAT_PLATFORM_PUBLIC_KEY','WECHAT_PLATFORM_PUBLIC_KEY_ID'],
 paypal:['PAYPAL_CLIENT_ID','PAYPAL_CLIENT_SECRET','PAYPAL_WEBHOOK_ID']
};
export function paymentDeploymentReadiness(env=process.env){
 const integrationEnabled=env.AI_MARKET_BILLING_ENABLED==='1';
 const orderLedgerReady=env.AI_MARKET_ORDER_LEDGER_READY==='1';
 const vendorAuthReady=env.AI_MARKET_VENDOR_AUTH_READY==='1';
 const fulfillmentReady=env.AI_MARKET_FULFILLMENT_READY==='1';
 return MARKET_PAYMENT_PROVIDERS.map(provider=>{
  const credentialsConfigured=REQUIRED[provider].every(key=>typeof env[key]==='string'&&env[key].trim().length>0);
  const providerEnabled=env[provider==='wechat'?'WECHAT_PAY_ENABLED':provider==='alipay'?'ALIPAY_ENABLED':'PAYPAL_ENABLED']==='true';
  // The isolated marketplace currently has no verified create/capture/refund handlers.
  // This must remain false until those handlers are implemented and reviewed.
  const checkoutImplemented=false;
  const checkoutAvailable=integrationEnabled&&orderLedgerReady&&vendorAuthReady&&fulfillmentReady&&credentialsConfigured&&providerEnabled&&checkoutImplemented;
  return {provider,checkoutAvailable,mode:checkoutAvailable?'live':'not_live',conditions:{
    signedMerchantAccount:credentialsConfigured,providerPermission:providerEnabled,
    orderLedger:orderLedgerReady,vendorIdentity:vendorAuthReady,
    verifiedFulfillment:fulfillmentReady,checkoutImplementation:checkoutImplemented
   },reason:!credentialsConfigured?'merchant_credentials_required':!providerEnabled?'provider_approval_required':!orderLedgerReady?'secure_order_ledger_required':!vendorAuthReady?'verified_vendor_identity_required':!fulfillmentReady?'fulfillment_required':'checkout_handlers_not_activated'};
 });
}
