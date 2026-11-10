import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyWechatReply,verifyPaypalWebhookConfig,repairPaypalWebhook} from '../scripts/ops/dual-payment-verified-enable-20261110.mjs';

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
const config={PAYPAL_ENV:'live',PAYPAL_CLIENT_ID:'test-client',PAYPAL_CLIENT_SECRET:'test-secret'};
const target='https://lingxifield.cn/api/pay/paypal/webhook';
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}})}
test('missing webhook is registered for the fixed owned receiver and re-read before use',async()=>{
 const calls=[];
 const request=async(url,options={})=>{
  calls.push({url,...options});
  if(url.endsWith('/oauth2/token'))return json({access_token:'test-token'});
  if(url.endsWith('/webhooks')&&!options.method)return json({webhooks:[]});
  if(url.endsWith('/webhooks')&&options.method==='POST'){
   const body=JSON.parse(options.body);assert.equal(body.url,target);
   assert.ok(body.event_types.some(x=>x.name==='PAYMENT.CAPTURE.COMPLETED'));
   assert.ok(body.event_types.some(x=>x.name==='PAYMENT.CAPTURE.REFUNDED'));
   return json({id:'NEW-ID'},201);
  }
  if(url.endsWith('/webhooks/NEW-ID'))return json({id:'NEW-ID',url:target,event_types:events});
  throw Error('UNEXPECTED_ENDPOINT');
 };
 assert.equal(await repairPaypalWebhook(config,request),'NEW-ID');
 assert.equal(calls.length,4);
 assert.ok(calls.every(x=>!x.url.includes('/checkout/orders')&&!x.url.includes('/payments/captures')));
});
test('existing webhook is reused and missing subscriptions are added without removing existing events',async()=>{
 let patched=false;
 const request=async(url,options={})=>{
  if(url.endsWith('/oauth2/token'))return json({access_token:'test-token'});
  if(url.endsWith('/webhooks')){assert.notEqual(options.method,'POST');return json({webhooks:[{id:'OLD-ID',url:target,event_types:[{name:'BILLING.SUBSCRIPTION.CREATED'}]}]})}
  if(options.method==='PATCH'){
   const patch=JSON.parse(options.body)[0];
   assert.equal(patch.path,'/event_types');
   assert.ok(patch.value.some(x=>x.name==='BILLING.SUBSCRIPTION.CREATED'));
   patched=true;return new Response(null,{status:204});
  }
  assert.equal(patched,true);
  return json({id:'OLD-ID',url:target,event_types:events});
 };
 assert.equal(await repairPaypalWebhook(config,request),'OLD-ID');
});
test('failed OAuth prevents any webhook registration and duplicate owned receivers stop for review',async()=>{
 let calls=0;
 await assert.rejects(repairPaypalWebhook(config,async()=>{calls++;return json({},401)}),/OAUTH_HTTP_401/);
 assert.equal(calls,1);
 await assert.rejects(repairPaypalWebhook(config,async(url,options={})=>{
  if(url.endsWith('/oauth2/token'))return json({access_token:'test-token'});
  assert.notEqual(options.method,'POST');
  return json({webhooks:[{id:'A',url:target},{id:'B',url:target}]});
 }),/DUPLICATE_WEBHOOKS/);
});
