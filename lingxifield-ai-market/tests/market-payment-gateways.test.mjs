import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,createSign,createCipheriv,randomBytes,createVerify} from 'node:crypto';
import {paymentDeploymentReadiness} from '../lib/market-billing-readiness.mjs';
import {amountToMinor,alipaySignedWebCheckout,verifyAlipayPaidNotification,wechatAuthorization,wechatCreateNative,verifyWechatPaidNotification,paypalCreateOrder,paypalVerifyCapturedOrder,paypalVerifyWebhook} from '../lib/market-payment-gateways.mjs';
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});
const sig=s=>{const x=createSign('RSA-SHA256');x.update(s,'utf8');x.end();return x.sign(privateKey,'base64')};
test('money is strict integer minor units and merchant readiness is fail-closed',()=>{
 assert.equal(amountToMinor(0.29),29);
 assert.equal(amountToMinor(49),4900);
 for(const v of [0,-1,NaN,Infinity,1.001,2e7])assert.throws(()=>amountToMinor(v));
 const all=paymentDeploymentReadiness({AI_MARKET_BILLING_ENABLED:'1',AI_MARKET_ORDER_LEDGER_READY:'1',AI_MARKET_VENDOR_AUTH_READY:'1',AI_MARKET_FULFILLMENT_READY:'1'});
 assert.equal(all.length,3);assert.ok(all.every(x=>x.checkoutAvailable===false));
 assert.ok(all.every(x=>!Object.keys(x).some(k=>/secret|private_key/i.test(k))));
});
test('Alipay RSA2 signed order enforces CNY and matching callback amount, merchant and order',()=>{
 const url=alipaySignedWebCheckout({orderId:'LX1234567890',amount:49,currency:'CNY',appId:'1234567890123456',privateKey,notifyUrl:'https://lingxifield.com/notify',returnUrl:'https://lingxifield.com/return'});
 const u=new URL(url);assert.equal(u.hostname,'openapi.alipay.com');
 assert.equal(u.searchParams.get('method'),'alipay.trade.page.pay');
 assert.equal(JSON.parse(u.searchParams.get('biz_content')).total_amount,'49.00');
 const all=Object.fromEntries(u.searchParams);
 const check=createVerify('RSA-SHA256');check.update(Object.keys(all).filter(x=>x!=='sign').sort().map(k=>k+'='+all[k]).join('&'));check.end();
 assert.ok(check.verify(publicKey,all.sign,'base64'));
 assert.throws(()=>alipaySignedWebCheckout({orderId:'LX1234567890',amount:49,currency:'USD',appId:'1234567890123456',privateKey,notifyUrl:'https://example.com/a',returnUrl:'https://example.com/b'}));
 const payload={app_id:'1234567890123456',out_trade_no:'LX1234567890',trade_status:'TRADE_SUCCESS',trade_no:'20261031234567890',total_amount:'49.00',seller_id:'merchant-123',sign_type:'RSA2'};
 const canonical=Object.keys(payload).filter(x=>x!=='sign_type').sort().map(k=>k+'='+payload[k]).join('&');
 payload.sign=sig(canonical);
 const expected={alipayPublicKey:publicKey,appId:payload.app_id,orderId:payload.out_trade_no,amount:49,currency:'CNY',sellerId:payload.seller_id};
 assert.equal(verifyAlipayPaidNotification(payload,expected).providerTransactionId,payload.trade_no);
 assert.equal(verifyAlipayPaidNotification({...payload,total_amount:'0.49'},expected),null);
 assert.equal(verifyAlipayPaidNotification(payload,{...expected,orderId:'OTHER1234'}),null);
 assert.equal(verifyAlipayPaidNotification({...payload,trade_status:'WAIT_BUYER_PAY'},expected),null);
});
test('WeChat signed Native order, signed encrypted notification and anti-replay',async()=>{
 const config={appId:'wx123456789',mchId:'1234567890',privateKey,serialNo:'987654321'};
 let sent;const fetcher=async(url,req)=>{sent={url,req};return new Response(JSON.stringify({code_url:'weixin://wxpay/bizpayurl?pr=abcdefg'}),{status:200,headers:{'content-type':'application/json'}})};
 const r=await wechatCreateNative({orderId:'LX1234567890',amount:49,currency:'CNY',notifyUrl:'https://lingxifield.com/wechat-notify',config,fetcher});
 assert.match(r.codeUrl,/^weixin:\/\//);
 assert.equal(JSON.parse(sent.req.body).amount.total,4900);
 assert.match(sent.req.headers.Authorization,/WECHATPAY2-SHA256-RSA2048/);
 const timestamp=String(Math.floor(Date.now()/1000)),nonce='random-123456789',key='0123456789abcdef0123456789abcdef',iv=randomBytes(12);
 const msg={trade_state:'SUCCESS',out_trade_no:'LX1234567890',mchid:'1234567890',amount:{total:4900,currency:'CNY'},transaction_id:'420000202610310001'};
 const cipher=createCipheriv('aes-256-gcm',Buffer.from(key),iv);cipher.setAAD(Buffer.from('transaction'));
 const enc=Buffer.concat([cipher.update(Buffer.from(JSON.stringify(msg))),cipher.final(),cipher.getAuthTag()]);
 const body=JSON.stringify({event_type:'TRANSACTION.SUCCESS',resource:{algorithm:'AEAD_AES_256_GCM',ciphertext:enc.toString('base64'),nonce:iv.toString(),associated_data:'transaction'}});
 const headers=new Headers({'Wechatpay-Timestamp':timestamp,'Wechatpay-Nonce':nonce,'Wechatpay-Serial':'PUB_KEY_ID_111','Wechatpay-Signature':sig(timestamp+'\n'+nonce+'\n'+body+'\n')});
 const args={headers,rawBody:body,publicKey,publicKeyId:'PUB_KEY_ID_111',apiV3Key:key,expectedOrderId:'LX1234567890',expectedAmount:49,expectedMerchantId:'1234567890'};
 assert.equal(verifyWechatPaidNotification(args).providerTransactionId,msg.transaction_id);
 assert.equal(verifyWechatPaidNotification({...args,expectedAmount:50}),null);
 assert.equal(verifyWechatPaidNotification({...args,expectedOrderId:'OTHER1234'}),null);
 assert.equal(verifyWechatPaidNotification({...args,now:Date.now()+600000}),null);
 assert.equal(verifyWechatPaidNotification({...args,publicKeyId:'PUB_KEY_ID_222'}),null);
});
test('PayPal Orders v2 validates server amount and references; webhook requires provider verification',async()=>{
 let n=0;
 const fetcher=async(url,req)=>{
  n++;const u=String(url);
  if(u.endsWith('/v1/oauth2/token'))return new Response(JSON.stringify({access_token:'temporary-token'}),{status:200});
  if(u.endsWith('/v2/checkout/orders')&&req.method==='POST'){
   const data=JSON.parse(req.body);assert.equal(data.purchase_units[0].amount.currency_code,'USD');assert.equal(data.purchase_units[0].amount.value,'149.00');
   return new Response(JSON.stringify({id:'PAYPAL12345678',links:[{rel:'payer-action',href:'https://www.sandbox.paypal.com/checkoutnow?token=PAYPAL12345678'}]}),{status:201});
  }
  if(u.endsWith('/v2/checkout/orders/PAYPAL12345678'))return new Response(JSON.stringify({status:'COMPLETED',purchase_units:[{reference_id:'MARKET123456',amount:{currency_code:'USD',value:'149.00'},payments:{captures:[{id:'CAPTURE1234567',status:'COMPLETED',amount:{currency_code:'USD',value:'149.00'}}]}}]}),{status:200});
  if(u.endsWith('/v1/notifications/verify-webhook-signature'))return new Response(JSON.stringify({verification_status:'SUCCESS'}),{status:200});
  throw Error('UNEXPECTED_PROVIDER_URL '+u);
 };
 const options={clientId:'mock-id',clientSecret:'mock-secret',environment:'sandbox',fetcher};
 const created=await paypalCreateOrder({orderId:'MARKET123456',amount:149,currency:'USD',returnUrl:'https://lingxifield.com/return',cancelUrl:'https://lingxifield.com/cancel',...options});
 assert.equal(created.providerOrderId,'PAYPAL12345678');
 assert.equal((await paypalVerifyCapturedOrder({providerOrderId:created.providerOrderId,expectedOrderId:'MARKET123456',amount:149,currency:'USD',...options})).amountMinor,14900);
 assert.equal(await paypalVerifyCapturedOrder({providerOrderId:created.providerOrderId,expectedOrderId:'MARKET123456',amount:49,currency:'USD',...options}),null);
 assert.throws(()=>amountToMinor(0));
 const headers=new Headers({'paypal-transmission-id':'E1','paypal-transmission-time':new Date().toISOString(),'paypal-cert-url':'https://api.sandbox.paypal.com/v1/notifications/certs/1','paypal-auth-algo':'SHA256withRSA','paypal-transmission-sig':'some-signature'});
 const verified=await paypalVerifyWebhook({headers,rawBody:JSON.stringify({id:'EVT123456',event_type:'PAYMENT.CAPTURE.COMPLETED'}),webhookId:'wh123',...options});
 assert.equal(verified.event_type,'PAYMENT.CAPTURE.COMPLETED');
 assert.equal(await paypalVerifyWebhook({headers:new Headers({'paypal-cert-url':'https://evil.com/cert'}),rawBody:'{}',webhookId:'wh123',...options}),null);
 assert.ok(n>=6);
});
