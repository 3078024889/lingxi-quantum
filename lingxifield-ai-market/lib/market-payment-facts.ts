import type {RegionCode} from './global-region-market';
import {globalRegionFact} from './global-region-market';
import {accessFor} from './platform-access-facts';
export type PaymentKey='card'|'alipay'|'wechat'|'paypal'|'appstore';
export type PaymentFact={methods:string[];source:string|null;scope:'global_offer'|'selected_region'|'unverified_region'|'unsupported';checkedAt:string|null};
function normalized(method:string){return method.toLowerCase().normalize('NFKC');}
const methodMatches=(method:string,key:PaymentKey)=>{
 const m=normalized(method);
 if(/不支持|不接受|not accepted|not supported|unavailable|不能使用/.test(m))return false;
 if(key==='card')return /credit|debit|visa|mastercard|银行卡|信用卡|借记卡|bank card|美国运通/.test(m);
 if(key==='alipay')return /alipay|支付宝/.test(m);
 if(key==='wechat')return /wechat pay|微信支付|微信付款|微信付款码/.test(m);
 if(key==='paypal')return /paypal/.test(m);
 return /app store|google play|苹果商店|应用商店/.test(m);
};
export function paymentFactsFor(id:string,region:RegionCode):PaymentFact{
 const snapshot=globalRegionFact(id,region);
 if(region!=='GLOBAL'&&snapshot.policy.status==='unsupported')
   return {methods:[],source:snapshot.policy.source||null,scope:'unsupported',checkedAt:snapshot.policy.checkedAt||null};
 const access=accessFor(id);
 const verified=access?.paymentSource?access.payment.filter(s=>!/不支持|不接受|not accepted|not supported/i.test(s)):[];
 const methods=[...new Set([...snapshot.payments.methods,...verified])];
 const source=snapshot.payments.source||access?.paymentSource||null;
 // Only an attributed publisher source can assert that a checkout method is offered.
 return {methods:source?methods:[],source,scope:region==='GLOBAL'?'global_offer':snapshot.policy.status==='supported'?'selected_region':'unverified_region',
 checkedAt:snapshot.payments.checkedAt||access?.checkedAt||null};
}
export function matchesOfficialPayment(id:string,key:PaymentKey,region:RegionCode):boolean {
 const result=paymentFactsFor(id,region);
 return result.scope!=='unsupported'&&Boolean(result.source)&&result.methods.some(m=>methodMatches(m,key));
}
export function matchingPaymentMethods(id:string,key:PaymentKey,region:RegionCode):string[]{
 return paymentFactsFor(id,region).methods.filter(m=>methodMatches(m,key));
}
