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
 listing:'listed_parent'|'listed_company'|'unconfirmed'|'not_applicable';year:string|null;category:string;
 about:string;strength:string;features:string[];searchTerms?:readonly string[];models:string;region:string;payment:string;
 paymentSource:string|null;verifiedPaymentRails?:readonly PaymentFacet[];free:string;freeSource:string|null;price:string;commercial:string;
 localizedSummary?:string;localizedCategory?:string;
};
export const TASK_FACETS:readonly TaskFacet[]=['all','video','image','code','research','audio','agent','local'];
export const PAYMENT_FACETS:readonly PaymentFacet[]=['any','card','alipay','wechat','paypal','appstore'];
export const EVIDENCE_FACETS:readonly EvidenceFacet[]=['all','verified_free','listed_parent','company','open_source'];
export const SORT_OPTIONS:readonly MarketOrder[]=['catalog','name','oldest','newest'];
/** Capability labels are evidence-backed feature tags, never keywords in pricing or company names.
 * In particular: image-to-video is NOT proof of text-to-image, and video editing
 * alone is NOT proof of video generation. One product may have many capabilities. */
const TASK_MATCH:Record<Exclude<TaskFacet,'all'>,RegExp>={
 video:/视频生成|生成视频|文生视频|图生视频|短剧视频|数字人视频|文本生成视频|视频制作|图片视频生成|AI视频|video generation|text.to.video|image.to.video/i,
 image:/图片生成|生成图片|图片创作|AI图片|文生图|文本生图|图像生成|图像创作|绘图|画图|生成插画|实时绘图|设计海报|营销图片|图片设计|图片增强|image generation|text.to.image/i,
 code:/编程|代码|代码开发|网站构建|建网站|建站|网页设计|网页原型|应用搭建|软件开发|开发代理|程序开发|coding|code completion|website builder/i,
 research:/搜索研究|联网搜索|论文搜索|文献|引文|学术研究|资料研究|深度研究|搜索资料|证据综述|文档搜索|资料提取|research|citation|literature/i,
 audio:/语音|音频|音乐|配音|旁白|歌曲|录音|转录|声音|字幕|speech|voice|audio|music|transcription/i,
 agent:/智能体|编程代理|软件开发代理|自动化|工作流|工具调用|agent|workflow|automation|orchestrat/i,
 local:/本地|离线|自托管|私有部署|本地模型|离线部署|local|offline|self.host/i
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
export function taskMatches(row:FacetRow,task:TaskFacet):boolean{
 if(task==='all')return true;
 // Use only the reviewed catalog category/feature tags; marketing copy is too broad.
 const indexed=[row.category,...row.features].join(' ');
 if(task==='image'&&/^(?:图片|图片生成|图片设计|设计|多模态创作)$/u.test(row.category))return true;
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
 case 'listed_parent':return row.listing==='listed_parent'||row.listing==='listed_company';
 case 'company':return row.kind==='company';
 case 'open_source':return row.kind==='open_source_project'||row.kind==='software_library';
 }
}
function paymentMatches(row:FacetRow,payment:PaymentFacet){
 if(payment==='any')return true;
 // Only publisher-supported checkout rails with independent source evidence.
 if(!knownSource(row.paymentSource))return false;
 if(row.verifiedPaymentRails)return row.verifiedPaymentRails.includes(payment);
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
  const compact=query.replace(/[\\s，,。！!？?、：:（）()·]/g,'');
  const imageQuestion=/图片生成|图片创作|生成图片|做图片|ai绘画|image generation|create images/i.test(compact);
  const videoQuestion=/视频生成|生成视频|做视频|制作视频|免费视频|短剧生成|video generation|create videos/i.test(compact);
  // Common real task questions are capability intersections, not one literal string.
  if(imageQuestion&&videoQuestion)return taskMatches(row,'image')&&taskMatches(row,'video')&&(!/免费|free/i.test(compact)||hasSourcedFreeOffer(row));
  if(videoQuestion&&/免费|free/i.test(compact))return taskMatches(row,'video')&&hasSourcedFreeOffer(row);
  if(/微信支付|wechatpay|weixinpay/i.test(compact))return paymentMatches(row,'wechat');
  if(/支付宝|alipay/i.test(compact))return paymentMatches(row,'alipay');
  if(/paypal/i.test(compact))return paymentMatches(row,'paypal');
  if(/^(?:图片生成|图片创作|ai绘画|文生图|imagegeneration)$/i.test(compact))return taskMatches(row,'image');
  if(/^(?:视频生成|视频创作|文生视频|图生视频|videogeneration)$/i.test(compact))return taskMatches(row,'video');
  if(/^(?:编程建站|ai编程建站|编程助手)$/i.test(compact))return taskMatches(row,'code');
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
  // Company incorporation and open-source project start are different fields, never compare as the same kind of rank.
  const at=a.kind==='company'?(ya===null?1:0):(ya===null?3:2);
  const bt=b.kind==='company'?(yb===null?1:0):(yb===null?3:2);
  if(at!==bt)return at-bt;
  if(ya===null&&yb===null)return collator.compare(a.name,b.name);
  return (criteria.sort==='oldest'?ya!-yb!:yb!-ya!)||collator.compare(a.name,b.name);
 });
}
export const MAX_COMPARISONS=3;
export function toggleMarketComparison(ids:readonly string[],id:string,knownIds:readonly string[]):string[]{
 if(!knownIds.includes(id))return [...ids];
 if(ids.includes(id))return ids.filter(x=>x!==id);
 return ids.length>=MAX_COMPARISONS?[...ids]:[...ids,id];
}

/** Facet counts obey current search/evidence/other facet while excluding their own selector.
 * Multi-capability products count once in each applicable facet; never a global total sum. */
export function marketFacetCounts<T extends FacetRow>(rows:readonly T[],criteria:MarketCriteria,locale='zh'){
 const byTask={...criteria,task:'all' as const};
 const byPayment={...criteria,payment:'any' as const};
 const task=Object.fromEntries(TASK_FACETS.map(key=>[key,filterMarketRows(rows,{...byTask,task:key},locale).length])) as Record<TaskFacet,number>;
 const payment=Object.fromEntries(PAYMENT_FACETS.map(key=>[key,filterMarketRows(rows,{...byPayment,payment:key},locale).length])) as Record<PaymentFacet,number>;
 return {task,payment};
}
