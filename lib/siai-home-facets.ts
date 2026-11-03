/**
 * Global SIAI homepage selectors.
 * Pure, deterministic and readable without production DB/checkout dependencies.
 * Order is editorial catalog order, NOT a measured popularity ranking.
 */
export type TaskFacet='all'|'video'|'image'|'code'|'research'|'audio'|'agent'|'local';
export type PaymentFacet='any'|'card'|'alipay'|'wechat'|'paypal'|'appstore';
export type EvidenceFacet='all'|'verified_free'|'listed_parent'|'company'|'open_source';
export type MarketOrder='catalog'|'name'|'oldest'|'newest';
export type MarketCriteria={
 query:string;category:string;task:TaskFacet;payment:PaymentFacet;
 evidence:EvidenceFacet;sort:MarketOrder;
};
export type FacetRow={
 id:string;name:string;company:string;legal:string|null;kind:'company'|'open_source_project'|'software_library';
 listing:'listed_parent'|'unconfirmed'|'not_applicable';year:string|null;category:string;
 about:string;strength:string;features:string[];searchTerms?:readonly string[];models:string;region:string;payment:string;
 paymentSource:string|null;free:string;freeSource:string|null;price:string;commercial:string;
 localizedSummary?:string;localizedCategory?:string;
};
export const TASK_FACETS:readonly TaskFacet[]=['all','video','image','code','research','audio','agent','local'];
export const PAYMENT_FACETS:readonly PaymentFacet[]=['any','card','alipay','wechat','paypal','appstore'];
export const EVIDENCE_FACETS:readonly EvidenceFacet[]=['all','verified_free','listed_parent','company','open_source'];
export const SORT_OPTIONS:readonly MarketOrder[]=['catalog','name','oldest','newest'];
const TASK_MATCH:Record<Exclude<TaskFacet,'all'>,RegExp>={
 video:/视频|短剧|动画|影片|video|film|animation|movie/i,
 image:/图像|图片|绘图|画图|画面|设计|image|photo|picture|design|illustrat/i,
 code:/代码|编程|开发|网页|网站|编译|code|coding|developer|programming|website/i,
 research:/研究|搜索|检索|文献|资料|论文|research|search|citation|literature/i,
 audio:/语音|声音|音频|音乐|配音|转录|录音|voice|speech|audio|music|transcription/i,
 agent:/智能体|代理|工作流|自动化|agent|workflow|automation|orchestrat/i,
 local:/本地|离线|自托管|开源|部署|local|offline|self.host|open.source/i
};
const PAYMENT_MATCH:Record<Exclude<PaymentFacet,'any'>,RegExp>={
 card:/银行卡|借记卡|信用卡|credit\s*card|debit\s*card|bank\s*card|visa|mastercard/i,
 alipay:/支付宝|alipay/i,
 wechat:/微信支付|wechat\s*pay|weixin\s*pay/i,
 paypal:/paypal/i,
 appstore:/apple\s*(?:app\s*)?store|google\s*play|app\s*store|应用商店/i
};
const knownSource=(url:string|null)=>Boolean(url&&/^https:\/\//i.test(url));
const norm=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().trim();
function taskMatches(row:FacetRow,task:TaskFacet){
 if(task==='all')return true;
 const indexed=[row.category,row.about,row.strength,...row.features,row.localizedSummary||'',row.localizedCategory||''].join(' ');
 return TASK_MATCH[task].test(indexed);
}
/** Prove the *offer*, not merely the presence of a "free" token on a pricing page. */
export function hasSourcedFreeOffer(row:FacetRow){
 // The niji mobile trial does not make Midjourney's web/Discord product free.
 if(row.id==='midjourney')return false;
 if(!knownSource(row.freeSource))return false;
 const text=norm(row.free);
 if(!text||text==='—'||/^(?:无免费|不提供免费|没有免费|no free|not free|paid only)/i.test(text))return false;
 return /免费|免费额度|赠送|free|gratuit|kostenlos|gr[aá]tis/i.test(text);
}
function evidenceMatches(row:FacetRow,v:EvidenceFacet){
 switch(v){
 case 'all':return true;
 case 'verified_free':return hasSourcedFreeOffer(row);
 case 'listed_parent':return row.listing==='listed_parent';
 case 'company':return row.kind==='company';
 case 'open_source':return row.kind==='open_source_project'||row.kind==='software_library';
 }
}
function paymentMatches(row:FacetRow,payment:PaymentFacet){
 if(payment==='any')return true;
 // Only publisher-supported checkout rails with independent source evidence.
 if(!knownSource(row.paymentSource))return false;
 // One negative rail must never leak into a positive filter alongside another rail.
 return row.payment.split(/\s+[·•]\s+|[,，;；\n]/).some(method=>
  PAYMENT_MATCH[payment].test(method)&&
  !/(?:不支持|不接受|不可用|未开通|无此支付|not\s+supported|not\s+accepted|unavailable|disabled)/i.test(method));
}
function yearNumber(row:FacetRow){
 const year=row.year?.match(/^(?:19|20)\d{2}/)?.[0];
 return year?Number(year):null;
}
export function filterMarketRows<T extends FacetRow>(rows:readonly T[],criteria:MarketCriteria,locale='zh'):T[]{
 const query=norm(criteria.query);
 const filtered=rows.filter(row=>{
  if(criteria.category!=='*'&&row.category!==criteria.category)return false;
  if(!taskMatches(row,criteria.task)||!evidenceMatches(row,criteria.evidence)||!paymentMatches(row,criteria.payment))return false;
  if(!query)return true;
  const text=[row.name,row.company,row.legal||'',row.category,row.localizedCategory||'',row.about,
   row.strength,row.localizedSummary||'',row.models,row.region,row.payment,...(row.searchTerms||[]),
   ...row.features].join(' ');
  return norm(text).includes(query);
 });
 if(criteria.sort==='catalog')return filtered;
 const collator=new Intl.Collator(locale,{sensitivity:'base',numeric:true});
 return filtered.sort((a,b)=>{
  if(criteria.sort==='name')return collator.compare(a.name,b.name)||collator.compare(a.id,b.id);
  const ya=yearNumber(a),yb=yearNumber(b);
  if(ya===null&&yb===null)return collator.compare(a.name,b.name);
  if(ya===null)return 1; // unknown dates always last
  if(yb===null)return -1;
  return (criteria.sort==='oldest'?ya-yb:yb-ya)||collator.compare(a.name,b.name);
 });
}
export const MAX_COMPARISONS=3;
export function toggleMarketComparison(ids:readonly string[],id:string,knownIds:readonly string[]):string[]{
 if(!knownIds.includes(id))return [...ids];
 if(ids.includes(id))return ids.filter(x=>x!==id);
 return ids.length>=MAX_COMPARISONS?[...ids]:[...ids,id];
}
