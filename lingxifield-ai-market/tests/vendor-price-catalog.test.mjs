import test from 'node:test';
import assert from 'node:assert/strict';
import {VENDOR_PLANS,selectBillingCurrency,vendorQuote,checkoutProviderAllowed,validateVendorCheckoutRequest} from '../lib/vendor-price-catalog.mjs';
test('four simple plans retain approved historical nominal prices',()=>{
 assert.deepEqual(VENDOR_PLANS.map(p=>[p.id,p.amount,p.durationDays]),[['listing',0,null],['brand',99,365],['launch',49,7],['category',149,30]]);
 assert.equal(new Set(VENDOR_PLANS.map(p=>p.id)).size,4);
});
test('manual choice overrides geography; auto defaults to CN CNY, elsewhere USD',()=>{
 for(const cur of ['USD','CNY'])assert.equal(selectBillingCurrency(cur,'CN'),cur);
 assert.equal(selectBillingCurrency(null,'CN'),'CNY');
 assert.equal(selectBillingCurrency(null,'SG'),'USD');
 assert.equal(selectBillingCurrency('XXX','US'),'USD');
});
test('equal numeric prices in both currencies with safe minor units',()=>{
 for(const plan of VENDOR_PLANS)for(const currency of ['CNY','USD']){
  const x=vendorQuote(plan.id,currency);
  assert.equal(x.amount,plan.amount);
  assert.equal(x.amountMinor,plan.amount*100);
  assert.equal(x.rankingImpact,false);
 }
});
test('server rejects manipulated plan, currency and provider',()=>{
 for(const bad of [['brand','EUR'],['invalid','USD']])assert.equal(vendorQuote(...bad),null);
 assert.equal(checkoutProviderAllowed('CNY','paypal'),false);
 assert.equal(checkoutProviderAllowed('USD','wechat'),false);
 assert.equal(checkoutProviderAllowed('USD','paypal'),true);
});
test('only a fully identified verified-vendor candidate may reach payment gateway',()=>{
 const base={planId:'brand',currency:'USD',provider:'paypal',companyId:'company_1',productId:'product_1',idempotencyKey:'secure_1234567890123456'};
 assert.equal(validateVendorCheckoutRequest(base)?.plan.amountMinor,9900);
 assert.equal(validateVendorCheckoutRequest({...base,planId:'listing'}),null);
 assert.equal(validateVendorCheckoutRequest({...base,companyId:'bad'}),null);
 assert.equal(validateVendorCheckoutRequest({...base,provider:'alipay'}),null);
});
