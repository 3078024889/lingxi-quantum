// Conservative payment settlement gate. Call only AFTER the provider's server-side signature
// verification. No UI signal can make an order paid.
const safeRef=s=>typeof s==='string'&&s.length>=6&&s.length<=200&&/^[A-Za-z0-9:_-]+$/.test(s);
const minorUnit=n=>typeof n==='number'&&Number.isSafeInteger(n)&&n>0;
export function validateSettlement({order,notification,verifiedSignature=false,seenEventIds=[]}={}){
 if(!verifiedSignature)return {accept:false,reason:'UNVERIFIED_SIGNATURE'};
 if(!order||!notification||!['USD','CNY'].includes(order.currency)||!minorUnit(order.amountMinor))return {accept:false,reason:'INVALID_ORDER'};
 if(order.status!=='pending_payment')return {accept:false,reason:'ORDER_NOT_PENDING'};
 if(!['paypal','alipay','wechat'].includes(order.provider)||notification.provider!==order.provider)return {accept:false,reason:'PROVIDER_MISMATCH'};
 if(!safeRef(order.id)||!safeRef(notification.orderId)||notification.orderId!==order.id)return {accept:false,reason:'ORDER_MISMATCH'};
 if(!safeRef(notification.eventId)||seenEventIds.includes(notification.eventId))return {accept:false,reason:'DUPLICATE_EVENT'};
 if(notification.currency!==order.currency||notification.amountMinor!==order.amountMinor)return {accept:false,reason:'AMOUNT_MISMATCH'};
 if(notification.status!=='captured'&&notification.status!=='settled')return {accept:false,reason:'NOT_SETTLED'};
 if(!safeRef(notification.providerTransactionId))return {accept:false,reason:'MISSING_PROVIDER_REFERENCE'};
 return {accept:true,reason:'READY_FOR_ATOMIC_DATABASE_SETTLEMENT',
  eventId:notification.eventId,orderId:order.id,providerTransactionId:notification.providerTransactionId};
}
// Database transaction MUST atomically claim event ID + compare pending order state + grant benefit.
