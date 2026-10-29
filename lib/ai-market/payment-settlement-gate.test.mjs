import test from 'node:test';import assert from 'node:assert/strict';
import{validateSettlement}from'./payment-settlement-gate.mjs';
const order={id:'order_abc123',currency:'USD',amountMinor:2900,status:'pending_payment',provider:'paypal'};
const notification={orderId:order.id,currency:'USD',amountMinor:2900,status:'captured',provider:'paypal',eventId:'event_1234',providerTransactionId:'capture_1234'};
test('never trust unverified callback',()=>assert.equal(validateSettlement({order,notification}).accept,false));
test('signature alone cannot override amount mismatch',()=>assert.equal(validateSettlement({order,notification:{...notification,amountMinor:200},verifiedSignature:true}).accept,false));
test('event replay is rejected',()=>assert.equal(validateSettlement({order,notification,verifiedSignature:true,seenEventIds:['event_1234']}).accept,false));
test('nonpending or unconfirmed payment never grants rights',()=>{assert.equal(validateSettlement({order:{...order,status:'active'},notification,verifiedSignature:true}).accept,false);assert.equal(validateSettlement({order,notification:{...notification,status:'pending'},verifiedSignature:true}).accept,false)});
test('verified consistent settlement is eligible for atomic DB processing, not automatically paid',()=>assert.equal(validateSettlement({order,notification,verifiedSignature:true}).reason,'READY_FOR_ATOMIC_DATABASE_SETTLEMENT'));
