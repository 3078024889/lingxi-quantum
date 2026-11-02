import test from 'node:test';
import assert from 'node:assert/strict';
import {merchantQuote,decideCapturedPayment,authorizeRefund,PAID_PLANS} from '../lib/market-order-policy.mjs';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('paid catalog matches the existing public 49/149/299 vendor plans',()=>{
 assert.deepEqual(PAID_PLANS,{sponsored:4900,category:14900,brand:29900});
 const s=read('lib/v2.ts');
 for(const [id,minor] of Object.entries(PAID_PLANS)){
  assert.match(s,new RegExp("id:'"+id+"',amount:"+String(minor/100)+"\\b"));
 }
 assert.throws(()=>merchantQuote({planId:'geo',currency:'USD',provider:'paypal'}),/UNKNOWN/);
 assert.throws(()=>merchantQuote({planId:'listing',currency:'USD',provider:'paypal'}),/UNKNOWN/);
});
test('merchant quote fixes currency, amount and provider server-side',()=>{
 assert.equal(merchantQuote({planId:'sponsored',currency:'USD',provider:'paypal'}).amountMinor,4900);
 assert.equal(merchantQuote({planId:'brand',currency:'CNY',provider:'wechat'}).amountMinor,29900);
 assert.throws(()=>merchantQuote({planId:'sponsored',currency:'CNY',provider:'paypal'}),/CURRENCY/);
 assert.throws(()=>merchantQuote({planId:'category',currency:'USD',provider:'alipay'}),/CURRENCY/);
});
const order={merchantOrderRef:'ord_12345678',planId:'sponsored',provider:'paypal',currency:'USD',amountMinor:4900,status:'pending',paidVerifiedAt:null};
const proof={merchantOrderRef:'ord_12345678',provider:'paypal',currency:'USD',amountMinor:4900,providerTransactionId:'txn_12345678',providerEventId:'evt_12345678',signatureVerified:true,verifiedAt:'2026-11-01T02:00:00Z'};
test('payment status rejects wrong signatures, cross-merchant IDs and amount tampering',()=>{
 assert.equal(decideCapturedPayment({order,verifiedProof:proof}).action,'capture');
 assert.throws(()=>decideCapturedPayment({order,verifiedProof:{...proof,amountMinor:1}}),/MISMATCH/);
 assert.throws(()=>decideCapturedPayment({order,verifiedProof:{...proof,signatureVerified:false}}),/SIGNATURE/);
 assert.throws(()=>decideCapturedPayment({order,verifiedProof:{...proof,merchantOrderRef:'ord_87654321'}}),/REFERENCE/);
 assert.throws(()=>decideCapturedPayment({order,verifiedProof:{...proof,currency:'CNY'}}),/MISMATCH/);
});
test('replayed paid callback is a no-op only for same captured transaction',()=>{
 const paid={...order,status:'paid',providerPaymentRef:'txn_12345678'};
 assert.equal(decideCapturedPayment({order:paid,verifiedProof:proof,seenEventId:true}).action,'noop');
 assert.throws(()=>decideCapturedPayment({order:paid,verifiedProof:{...proof,providerTransactionId:'txn_87654321'},seenEventId:true}),/IDEMPOTENCY/);
});
test('refunds never exceed verified capture or issue without paid confirmation',()=>{
 const paid={...order,status:'paid',paidVerifiedAt:'2026-11-01T02:00:00Z',providerPaymentRef:'txn_12345678'};
 assert.equal(authorizeRefund({order:paid,refundAmountMinor:2000,providerRefundRef:'ref_12345678'}).nextRefundedMinor,2000);
 assert.throws(()=>authorizeRefund({order:paid,previousRefundedMinor:4000,refundAmountMinor:1000,providerRefundRef:'ref_12345678'}),/EXCEEDS/);
 assert.throws(()=>authorizeRefund({order,refundAmountMinor:100,providerRefundRef:'ref_12345678'}),/NOT_REFUNDABLE/);
});
test('checkout route remains closed regardless of frontend flags',()=>{
 const route=read('app/api/v1/billing/checkout/route.ts');
 assert.match(route,/MARKET_CHECKOUT_NOT_LIVE/);
 const readiness=read('lib/market-billing-readiness.mjs');
 assert.match(readiness,/checkoutImplemented=false/);
});
