/**
 * Public vendor price catalog. Amounts are fixed nominal major currency units,
 * NOT foreign-exchange conversions. This module NEVER settles transactions.
 * Approved provider callbacks + atomic ledger settlement are required for activation.
 */
export const VENDOR_PLANS=Object.freeze([
 Object.freeze({id:'listing',amount:0,durationDays:null,unit:'free',visibility:'organic',orderable:false,benefits:['3 verified product claims','Publisher-managed corrections','Respond to published reviews']}),
 Object.freeze({id:'brand',amount:99,durationDays:365,unit:'per_product_year',visibility:'enhanced_profile',orderable:true,benefits:['Enhanced publisher profile','Official examples and product updates','Source-backed product details']}),
 Object.freeze({id:'launch',amount:49,durationDays:7,unit:'seven_days',visibility:'sponsored',orderable:true,benefits:['Clearly labeled new-launch placement','7-day campaign','Campaign metrics when verified']}),
 Object.freeze({id:'category',amount:149,durationDays:30,unit:'thirty_days',visibility:'sponsored',orderable:true,benefits:['Clearly labeled category placement','30-day campaign','Campaign metrics when verified']})
]);
export const VALID_CURRENCIES=Object.freeze(['CNY','USD']);
export function selectBillingCurrency(requested,country){
 if(VALID_CURRENCIES.includes(requested))return requested;
 return String(country||'').trim().toUpperCase()==='CN'?'CNY':'USD';
}
export function vendorQuote(planId,currency){
 const plan=VENDOR_PLANS.find(p=>p.id===planId);
 if(!plan||!VALID_CURRENCIES.includes(currency))return null;
 return Object.freeze({planId:plan.id,amount:plan.amount,currency,amountMinor:plan.amount*100,durationDays:plan.durationDays,unit:plan.unit,paid:plan.amount>0,rankingImpact:false,sponsored:plan.visibility==='sponsored',requiresVerifiedVendor:plan.amount>0});
}
export function checkoutProviderAllowed(currency,provider){
 return currency==='CNY'?provider==='alipay'||provider==='wechat':currency==='USD'?provider==='paypal':false;
}
export function validateVendorCheckoutRequest(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return null;
 const plan=vendorQuote(input.planId,input.currency);
 if(!plan||!plan.paid||!checkoutProviderAllowed(plan.currency,input.provider))return null;
 const companyId=String(input.companyId||'');
 const productId=String(input.productId||'');
 const idempotencyKey=String(input.idempotencyKey||'');
 if(!/^[A-Za-z0-9_-]{6,100}$/.test(companyId)||!/^[A-Za-z0-9_-]{6,100}$/.test(productId)||!/^[A-Za-z0-9:_-]{16,128}$/.test(idempotencyKey))return null;
 return {plan,...{companyId,productId,idempotencyKey,provider:input.provider}};
}
