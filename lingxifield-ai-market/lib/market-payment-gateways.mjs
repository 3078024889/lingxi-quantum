/**
 * Real payment protocol adapters, NOT an activated checkout.
 * These functions never grant access, mutate an order or mark payment paid.
 * A separate authenticated, atomic order ledger and human-approved merchant
 * account are mandatory before these adapters can be exposed in checkout.
 */
import {createSign,createVerify,randomBytes,createDecipheriv} from 'node:crypto';

export const amountToMinor=(amount)=>{
 if(typeof amount!=='number'||!Number.isFinite(amount)||amount<=0||Math.abs(Math.round(amount*100)-amount*100)>1e-7)throw Error('INVALID_AMOUNT');
 const minor=Math.round(amount*100);
 if(!Number.isSafeInteger(minor)||minor>100000000)throw Error('INVALID_AMOUNT');
 return minor;
};
export const asPem=(s,kind)=>{
 if(typeof s!=='string'||!s.trim())throw Error('KEY_MISSING');
 const t=s.replace(/\\n/g,'\n').trim();
 return t.includes('-----BEGIN')?t:'-----BEGIN '+kind+'-----\n'+t.match(/.{1,64}/g).join('\n')+'\n-----END '+kind+'-----';
};
const sign=(text,key)=>{const s=createSign('RSA-SHA256');s.update(text,'utf8');s.end();return s.sign(asPem(key,'PRIVATE KEY'),'base64')};
const verify=(text,key,sig)=>{try{const v=createVerify('RSA-SHA256');v.update(text,'utf8');v.end();return v.verify(asPem(key,'PUBLIC KEY'),sig,'base64')}catch{return false}};
const safeId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{8,64}$/.test(id);
function httpsUrl(s){const u=new URL(s);if(u.protocol!=='https:'||u.username||u.password)throw Error('INVALID_URL');return u.href}
async function jsonFetch(fetcher,url,opts,timeoutMs=15000){
 const r=await fetcher(url,{...opts,signal:AbortSignal.timeout(timeoutMs),redirect:'error',cache:'no-store'});
 if(!r.ok)throw Error('PROVIDER_HTTP_'+r.status);
 return {data:await r.json(),headers:r.headers};
}
export function alipaySignedWebCheckout({orderId,amount,currency,appId,privateKey,notifyUrl,returnUrl,mobile=false,gateway='https://openapi.alipay.com/gateway.do'}){
 if(!safeId(orderId)||currency!=='CNY'||!/^\d{10,32}$/.test(appId))throw Error('INVALID_ORDER');
 const host=new URL(httpsUrl(gateway)).hostname;
 if(!['openapi.alipay.com','openapi.alipaydev.com'].includes(host))throw Error('UNTRUSTED_GATEWAY');
 const p={app_id:appId,method:mobile?'alipay.trade.wap.pay':'alipay.trade.page.pay',format:'JSON',charset:'utf-8',sign_type:'RSA2',timestamp:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).format(new Date()),version:'1.0',
  notify_url:httpsUrl(notifyUrl),return_url:httpsUrl(returnUrl),biz_content:JSON.stringify({out_trade_no:orderId,total_amount:(amountToMinor(amount)/100).toFixed(2),subject:'LINGXIFIELD marketplace promotion',product_code:mobile?'QUICK_WAP_WAY':'FAST_INSTANT_TRADE_PAY'})};
 const base=Object.keys(p).sort().map(k=>k+'='+p[k]).join('&');
 p.sign=sign(base,privateKey);
 return gateway+'?'+new URLSearchParams(p);
}
export function verifyAlipayPaidNotification(data,{alipayPublicKey,appId,orderId,amount,currency='CNY',sellerId}){
 if(currency!=='CNY'||!safeId(orderId)||!data||typeof data!=='object'||!data.sign||data.sign_type!=='RSA2')return null;
 if(String(data.app_id)!==appId||String(data.out_trade_no)!==orderId||!['TRADE_SUCCESS','TRADE_FINISHED'].includes(data.trade_status))return null;
 if(sellerId&&String(data.seller_id)!==sellerId)return null;
 if(!data.trade_no||!/^\d{8,64}$/.test(String(data.trade_no)))return null;
 const v=Number(data.total_amount);if(!Number.isFinite(v)||Math.round(v*100)!==amountToMinor(amount))return null;
 const canonical=Object.keys(data).filter(k=>k!=='sign'&&k!=='sign_type'&&data[k]!=='').sort().map(k=>k+'='+data[k]).join('&');
 if(!verify(canonical,alipayPublicKey,String(data.sign)))return null;
 return {provider:'alipay',providerTransactionId:String(data.trade_no),orderId,amountMinor:amountToMinor(amount),currency};
}
export function wechatAuthorization(method,path,body,{mchId,serialNo,privateKey},now=Date.now()){
 if(!/^(GET|POST)$/.test(method)||!path.startsWith('/v3/')||path.startsWith('//'))throw Error('INVALID_PATH');
 const ts=String(Math.floor(now/1000)),nonce=randomBytes(16).toString('hex');
 const message=[method,path,ts,nonce,body,''].join('\n');
 return 'WECHATPAY2-SHA256-RSA2048 mchid="'+mchId+'",nonce_str="'+nonce+'",timestamp="'+ts+'",serial_no="'+serialNo+'",signature="'+sign(message,privateKey)+'"';
}
export function verifyWechatSignedResponse(headers,rawBody,{platformPublicKey,platformPublicKeyId},now=Date.now()){
 const ts=headers.get('wechatpay-timestamp'),nonce=headers.get('wechatpay-nonce');
 const serial=headers.get('wechatpay-serial'),signature=headers.get('wechatpay-signature');
 return Boolean(platformPublicKey&&platformPublicKeyId&&serial===platformPublicKeyId&&/^\d{10}$/.test(ts||'')&&Math.abs(now-Number(ts)*1000)<=300000
  &&nonce&&signature&&verify(ts+'\n'+nonce+'\n'+rawBody+'\n',platformPublicKey,signature));
}
export async function wechatCreateNative({orderId,amount,currency,notifyUrl,config,fetcher=fetch}){
 if(!safeId(orderId)||orderId.length>32||currency!=='CNY'||!/^\d{6,32}$/.test(config.mchId)||!config.appId)throw Error('INVALID_ORDER');
 const path='/v3/pay/transactions/native',url='https://api.mch.weixin.qq.com'+path;
 const body=JSON.stringify({appid:config.appId,mchid:config.mchId,description:'LINGXIFIELD marketplace promotion',out_trade_no:orderId,notify_url:httpsUrl(notifyUrl),amount:{total:amountToMinor(amount),currency:'CNY'}});
 const auth=wechatAuthorization('POST',path,body,config);
 const response=await fetcher(url,{method:'POST',headers:{Authorization:auth,'Content-Type':'application/json',Accept:'application/json'},body,signal:AbortSignal.timeout(15000),redirect:'error',cache:'no-store'});
 const raw=await response.text();
 if(!verifyWechatSignedResponse(response.headers,raw,config))throw Error('WECHAT_RESPONSE_SIGNATURE_INVALID');
 if(!response.ok)throw Error('WECHAT_HTTP_'+response.status);
 const data=JSON.parse(raw);
 if(typeof data.code_url!=='string'||!data.code_url.startsWith('weixin://'))throw Error('WECHAT_CODE_URL_INVALID');
 return {codeUrl:data.code_url};
}
export function verifyWechatPaidNotification({headers,rawBody,publicKey,publicKeyId,apiV3Key,expectedOrderId,expectedAmount,expectedMerchantId,now=Date.now()}){
 try{
  const h=k=>headers.get(k)||headers.get(k.toLowerCase())||'';
  const ts=h('Wechatpay-Timestamp'),nonce=h('Wechatpay-Nonce'),signature=h('Wechatpay-Signature'),serial=h('Wechatpay-Serial');
  if(!/^\d{10}$/.test(ts)||Math.abs(now-Number(ts)*1000)>300000||!nonce||!signature||serial!==publicKeyId||!publicKeyId)return null;
  if(!verify(ts+'\n'+nonce+'\n'+rawBody+'\n',publicKey,signature))return null;
  const envelope=JSON.parse(rawBody);if(envelope.event_type!=='TRANSACTION.SUCCESS'||envelope.resource?.algorithm!=='AEAD_AES_256_GCM')return null;
  const v=envelope.resource,encrypted=Buffer.from(v.ciphertext,'base64');
  if(encrypted.length<17||Buffer.byteLength(apiV3Key)!==32)return null;
  const decipher=createDecipheriv('aes-256-gcm',Buffer.from(apiV3Key),Buffer.from(v.nonce));
  decipher.setAuthTag(encrypted.subarray(encrypted.length-16));
  decipher.setAAD(Buffer.from(v.associated_data||''));
  const detail=JSON.parse(decipher.update(encrypted.subarray(0,-16),undefined,'utf8')+decipher.final('utf8'));
  if(detail.trade_state!=='SUCCESS'||detail.out_trade_no!==expectedOrderId||detail.mchid!==expectedMerchantId||detail.amount?.currency!=='CNY'||detail.amount?.total!==amountToMinor(expectedAmount))return null;
  if(!detail.transaction_id||!/^\d{8,64}$/.test(detail.transaction_id))return null;
  return {provider:'wechat',orderId:expectedOrderId,providerTransactionId:detail.transaction_id,currency:'CNY',amountMinor:detail.amount.total};
 }catch{return null}
}
const paypalHost=env=>env==='sandbox'?'https://api-m.sandbox.paypal.com':'https://api-m.paypal.com';
export async function paypalToken({clientId,clientSecret,environment='sandbox',fetcher=fetch}){
 if(!clientId||!clientSecret)throw Error('PAYPAL_CREDENTIALS_REQUIRED');
 const {data}=await jsonFetch(fetcher,paypalHost(environment)+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(clientId+':'+clientSecret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
 if(typeof data.access_token!=='string'||!data.access_token)throw Error('PAYPAL_TOKEN_INVALID');
 return data.access_token;
}
export async function paypalCreateOrder({orderId,amount,currency,returnUrl,cancelUrl,clientId,clientSecret,environment='sandbox',fetcher=fetch}){
 if(!safeId(orderId)||currency!=='USD')throw Error('INVALID_ORDER');
 const token=await paypalToken({clientId,clientSecret,environment,fetcher});
 const body={intent:'CAPTURE',purchase_units:[{reference_id:orderId,description:'LINGXIFIELD marketplace promotion',amount:{currency_code:'USD',value:(amountToMinor(amount)/100).toFixed(2)}}],payment_source:{paypal:{experience_context:{brand_name:'LINGXIFIELD',user_action:'PAY_NOW',shipping_preference:'NO_SHIPPING',return_url:httpsUrl(returnUrl),cancel_url:httpsUrl(cancelUrl)}}}};
 const {data}=await jsonFetch(fetcher,paypalHost(environment)+'/v2/checkout/orders',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','PayPal-Request-Id':orderId},body:JSON.stringify(body)});
 if(!safeId(data.id)||!Array.isArray(data.links))throw Error('PAYPAL_ORDER_RESPONSE_INVALID');
 const link=data.links.find(x=>x.rel==='payer-action'||x.rel==='approve');
 if(!link||!/^https:\/\//.test(link.href))throw Error('PAYPAL_APPROVAL_MISSING');
 const allowed=new URL(link.href).hostname;
 if(!['www.paypal.com','www.sandbox.paypal.com'].includes(allowed))throw Error('PAYPAL_APPROVAL_UNTRUSTED');
 return {providerOrderId:data.id,approveUrl:link.href};
}
export async function paypalVerifyWebhook({headers,rawBody,webhookId,clientId,clientSecret,environment='sandbox',fetcher=fetch}){
 const transmissionTime=headers.get('paypal-transmission-time');
 if(!transmissionTime||!Number.isFinite(Date.parse(transmissionTime))||Math.abs(Date.now()-Date.parse(transmissionTime))>300000)return null;
 const token=await paypalToken({clientId,clientSecret,environment,fetcher});
 let event;try{event=JSON.parse(rawBody)}catch{return null}
 const required=['paypal-transmission-id','paypal-transmission-time','paypal-cert-url','paypal-auth-algo','paypal-transmission-sig'];
 if(required.some(k=>!headers.get(k)))return null;
 const certUrl=new URL(headers.get('paypal-cert-url'));
 if(certUrl.protocol!=='https:'||!['api.paypal.com','api.sandbox.paypal.com'].includes(certUrl.hostname))return null;
 const payload={transmission_id:headers.get('paypal-transmission-id'),transmission_time:headers.get('paypal-transmission-time'),cert_url:certUrl.href,auth_algo:headers.get('paypal-auth-algo'),transmission_sig:headers.get('paypal-transmission-sig'),webhook_id:webhookId,webhook_event:event};
 const {data}=await jsonFetch(fetcher,paypalHost(environment)+'/v1/notifications/verify-webhook-signature',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(payload)});
 return data.verification_status==='SUCCESS'?event:null;
}
export async function paypalVerifyCapturedOrder({providerOrderId,expectedOrderId,amount,currency,clientId,clientSecret,environment='sandbox',fetcher=fetch}){
 if(!safeId(providerOrderId)||!safeId(expectedOrderId)||currency!=='USD')return null;
 const token=await paypalToken({clientId,clientSecret,environment,fetcher});
 const {data}=await jsonFetch(fetcher,paypalHost(environment)+'/v2/checkout/orders/'+encodeURIComponent(providerOrderId),{method:'GET',headers:{Authorization:'Bearer '+token}});
 const unit=data.purchase_units?.find(x=>x.reference_id===expectedOrderId);
 const cap=unit?.payments?.captures?.find(x=>x.status==='COMPLETED');
 if(data.status!=='COMPLETED'||!cap||unit.amount?.currency_code!=='USD'||Math.round(Number(unit.amount.value)*100)!==amountToMinor(amount)||cap.amount?.currency_code!=='USD'||Math.round(Number(cap.amount.value)*100)!==amountToMinor(amount))return null;
 return {provider:'paypal',orderId:expectedOrderId,providerTransactionId:cap.id,currency:'USD',amountMinor:amountToMinor(amount)};
}
