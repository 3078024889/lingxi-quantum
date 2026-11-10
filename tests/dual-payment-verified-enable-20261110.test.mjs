import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyWechatReply,verifyPaypalWebhookConfig} from '../scripts/ops/dual-payment-verified-enable-20261110.mjs';

const keys=generateKeyPairSync('rsa',{modulusLength:2048});
const timestamp=1794280000,body=JSON.stringify({code:'ORDER_NOT_EXIST'});
function reply(){
 const nonce='test-nonce';
 const signature=sign('RSA-SHA256',Buffer.from(`${timestamp}\n${nonce}\n${body}\n`),keys.privateKey).toString('base64');
 return new Headers({'Wechatpay-Timestamp':String(timestamp),'Wechatpay-Nonce':nonce,'Wechatpay-Serial':'PUB_KEY_ID_TEST','Wechatpay-Signature':signature});
}
test('signed provider error is accepted only with the exact raw body and matching platform key',()=>{
 assert.doesNotThrow(()=>verifyWechatReply(reply(),body,'PUB_KEY_ID_TEST',keys.publicKey,timestamp));
 assert.throws(()=>verifyWechatReply(reply(),body+' ','PUB_KEY_ID_TEST',keys.publicKey,timestamp),/SIGNATURE_INVALID/);
 assert.throws(()=>verifyWechatReply(reply(),body,'OTHER',keys.publicKey,timestamp),/KEY_ID_MISMATCH/);
});
test('stale and deliberately invalid WeChat signatures cannot authorize activation',()=>{
 assert.throws(()=>verifyWechatReply(reply(),body,'PUB_KEY_ID_TEST',keys.publicKey,timestamp+301),/TIMESTAMP_INVALID/);
 const h=reply();h.set('Wechatpay-Signature','WECHATPAY/SIGNTEST/invalid');
 assert.throws(()=>verifyWechatReply(h,body,'PUB_KEY_ID_TEST',keys.publicKey,timestamp),/SIGNATURE_MISSING/);
});
const events=[{name:'PAYMENT.CAPTURE.COMPLETED'},{name:'PAYMENT.CAPTURE.REFUNDED'}];
test('PayPal webhook must target one of the two owned production receivers',()=>{
 for(const domain of ['lingxifield.cn','lingxifield.com'])assert.doesNotThrow(()=>verifyPaypalWebhookConfig({url:`https://${domain}/api/pay/paypal/webhook`,event_types:events}));
 for(const url of ['https://attacker.test/api/pay/paypal/webhook','https://lingxifield.com.attacker.test/api/pay/paypal/webhook','http://lingxifield.cn/api/pay/paypal/webhook','https://lingxifield.com/api/pay/paypal/webhook?elsewhere=true','https://user:password@lingxifield.com/api/pay/paypal/webhook'])assert.throws(()=>verifyPaypalWebhookConfig({url,event_types:events}),/URL_MISMATCH/);
});
test('PayPal completion and refund subscriptions are required; wildcard also covers both',()=>{
 assert.throws(()=>verifyPaypalWebhookConfig({url:'https://lingxifield.com/api/pay/paypal/webhook',event_types:[events[0]]}),/EVENTS_INCOMPLETE/);
 assert.doesNotThrow(()=>verifyPaypalWebhookConfig({url:'https://lingxifield.com/api/pay/paypal/webhook',event_types:[{name:'*'}]}));
});
