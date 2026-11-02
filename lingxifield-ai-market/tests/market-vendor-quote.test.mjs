import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {vendorPlacementQuote,vendorEntitlementDecision} from '../lib/market-vendor-quote.mjs';
const ids=['runway','kling','chatgpt'];
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('official vendor SKU quotes have two independent nominal currency books, no FX or checkout side effects',()=>{
 for(const plan of [['sponsored',49],['category',149],['brand',299]]){
  const cny=vendorPlacementQuote({productId:'runway',planId:plan[0],currency:'CNY',provider:'alipay'},ids);
  const usd=vendorPlacementQuote({productId:'runway',planId:plan[0],currency:'USD',provider:'paypal'},ids);
  assert.equal(cny.amount,plan[1]);assert.equal(usd.amount,plan[1]);assert.equal(cny.amountMinor,usd.amountMinor);
  assert.equal(cny.paymentUrl,null);assert.equal(usd.merchantCheckoutReady,false);
 }
 const free=vendorPlacementQuote({productId:'runway',planId:'listing',currency:'USD',provider:null},ids);
 assert.equal(free.amountMinor,0);assert.equal(free.provider,null);
});
test('server rejects arbitrary products, GEO waitlist, wrong providers and purchases for free listings',()=>{
 for(const [input,code] of [
  [{productId:'not-a-publisher',planId:'sponsored',currency:'USD',provider:'paypal'},'UNKNOWN_PRODUCT'],
  [{productId:'runway',planId:'geo',currency:'USD',provider:'paypal'},'UNKNOWN_OR_NOT_FOR_SALE_PLAN'],
  [{productId:'runway',planId:'sponsored',currency:'CNY',provider:'paypal'},'PROVIDER_CURRENCY_MISMATCH'],
  [{productId:'runway',planId:'sponsored',currency:'EUR',provider:'paypal'},'INVALID_CURRENCY'],
  [{productId:'runway',planId:'listing',currency:'CNY',provider:'wechat'},'FREE_PLAN_HAS_NO_PAYMENT_PROVIDER'],
 ])assert.throws(()=>vendorPlacementQuote(input,ids),new RegExp(code));
 const route=file('app/api/v1/billing/quote/route.ts');
 assert.match(route,/vendorPlacementQuote\(input,MARKET_API_PRODUCTS\)/);
 assert.match(route,/checkoutEnabled:false,checkoutUrl:null/);
});
test('no vendor paid entitlement from client claims, mismatched identity, replay or amount',()=>{
 const verifiedOrder={productId:'runway',planId:'sponsored',currency:'USD',provider:'paypal',publisherId:'owner-company',
  vendorUserId:'signed-vendor-id',merchantOrderRef:'MARKET_ORDER_001',providerPaymentRef:'PAYMENT_REFERENCE_001',
  amountMinor:4900,status:'paid',paidVerifiedAt:'2026-11-02T00:00:00Z'};
 const approvedClaim={status:'approved',productId:'runway',publisherId:'owner-company',vendorUserId:'signed-vendor-id'};
 const providerProof={signatureVerified:true,orderRef:'MARKET_ORDER_001',transactionRef:'PAYMENT_REFERENCE_001',
  amountMinor:4900,currency:'USD',provider:'paypal'};
 const good={verifiedOrder,approvedClaim,providerProof};
 assert.equal(vendorEntitlementDecision(good).decision,'eligible_for_reviewed_placement');
 for(const changed of [
  {...good,approvedClaim:{...approvedClaim,vendorUserId:'attacker'}},
  {...good,providerProof:{...providerProof,signatureVerified:false}},
  {...good,providerProof:{...providerProof,amountMinor:490}},
  {...good,verifiedOrder:{...verifiedOrder,status:'pending'}},
  {...good,verifiedOrder:{...verifiedOrder,productId:'kling'}},
 ])assert.throws(()=>vendorEntitlementDecision(changed));
});
