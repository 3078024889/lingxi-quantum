/**
 * Official-site evidence search queue for human/editorial verification.
 * Uses existing first-party pinned hosts, makes NO network requests, accepts
 * NO untrusted external URLs, does NOT mutate staging or production data.
 */
export const FACT_RESEARCH_RULES=Object.freeze({
 price:{
  query:'pricing plans monthly annual api token credit per model',
  proof:'Actual subscription period, currency, billing cycle, per-token/per-credit units and geographic price scope.',
  reject:'Historic prices, third-party deal pages and monthly equivalents shown as monthly bills.'
 },
 free:{
  query:'free tier trial allowance usage limits credits signup expiration',
  proof:'Explicit current free entitlement, quantity or limits; whether card/purchase is required; which tasks/models qualify.',
  reject:'Promotional/expired offers and a free web tool misrepresented as free API inference.'
 },
 models:{
  query:'supported models model picker model versions image video developer documentation',
  proof:'Exact currently available model or model family for this specific product and feature.',
  reject:'One old announcement as the complete current model list; base model inferred from brand.'
 },
 regions:{
  query:'supported countries regions available countries signup subscription feature availability',
  proof:'Named supported markets for THIS tool/feature, or explicitly named blocked countries scoped as restrictions-only.',
  reject:'Generic export-control clause presented as a complete supported-country whitelist.'
 },
 commercial:{
  query:'terms of service generated output ownership commercial licence intellectual property',
  proof:'Current license for user outputs and third-party stock/models, distinguishing free/paid and product-specific restrictions.',
  reject:'Watermark-free, publicly visible or user-data privacy statements treated as unlimited commercial rights.'
 },
 payment:{
  query:'accepted payment methods subscriptions billing card paypal alipay wechat bank country',
  proof:'Official supported checkout rail, plan/account/country and billing currency. Unknown options stay unknown.',
  reject:'Payments provider inferred as all the wallets supported by that provider; third-party community reports.'
 },
 company:{
  query:'terms legal entity company registration number contracting party about',
  proof:'Actual legal contracting company, jurisdiction, registry number if published and parent/brand separation.',
  reject:'Domain ownership, product label or press release treated as proof of company incorporation/listing.'
 }
});
const safeHost=h=>typeof h==='string'&&/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(h)&&
 !/\.\./.test(h);
function words(s){return String(s||'').replace(/[\r\n"'{}<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,130)}
export function buildOfficialGapQueue(packs,asOf){
 if(!Array.isArray(packs)||packs.length!==3||!/^20\d\d-\d\d-\d\d$/.test(asOf))
  throw Error('BAD_GAP_QUEUE_INPUT');
 const seen=new Set(),items=[],batchSizes={};
 for(const p of packs){
  if(!p||typeof p.batch!=='string'||!Array.isArray(p.products)||
    p.products.some(x=>x.reviewStatus!=='unapproved'))
   throw Error('CANDIDATE_SOURCE_IS_NOT_HELD');
  batchSizes[p.batch]=p.products.length;
  for(const entry of p.products){
   if(seen.has(entry.id))throw Error('DUPLICATE_CANDIDATE');
   seen.add(entry.id);
   const host=entry.officialHosts?.[0];
   if(!safeHost(host))throw Error('INVALID_OFFICIAL_HOST');
   for(const [field,rule] of Object.entries(FACT_RESEARCH_RULES)){
    const f=entry.facts?.[field];
    if(!f||!['missing','observed','conflict'].includes(f.status))
     throw Error('INVALID_FACT_STATUS');
    if(f.status==='observed')continue;
    items.push({
     id:entry.id,product:entry.name,batch:p.batch,field,
     originalStatus:f.status,host,reason:f.reason||null,
     query:'site:'+host+' '+words(entry.name)+' '+rule.query,
     acceptableEvidence:rule.proof,
     misleadingShortcut:rule.reject,
     sourceRequired:true,independentAccountTestRequired:true,
     directPublicationAllowed:false
    });
   }
  }
 }
 const fields=Object.fromEntries(Object.keys(FACT_RESEARCH_RULES).map(k=>[k,items.filter(x=>x.field===k).length]));
 const weight={commercial:3,company:3,payment:3,free:2,price:2,models:2,regions:1};
 const byPriority=items.sort((a,b)=>weight[b.field]-weight[a.field]||
  a.batch.localeCompare(b.batch)||a.product.localeCompare(b.product)||a.field.localeCompare(b.field));
 return {schema:'siai_official_gap_research_v1',asOf,candidates:seen.size,missingFields:items.length,
  perField:fields,batchSizes,allCandidateProductsRemainHidden:true,
  noAutomatedWebScraping:true,notEvidenceVerified:true,notPublished:true,items:byPriority};
}
export function gapQueueMarkdown(report){
 const lines=['# Global SIAI official source gap research queue','',
  'As of '+report.asOf+' · '+report.candidates+' withheld candidate products',
  '',
  '> The queries are discovery hints, NOT verified facts. Confirm on first-party public sources;',
  '> obey the vendor ToS and rate limits; never auto-publish or infer support from a blocked-country list.',
  '',
  '## Missing fields',
  '',
  '| Field | Missing |','| --- | ---: |',
  ...Object.entries(report.perField).map(([k,v])=>'| '+k+' | '+v+' |'),
  '','## First-party research tasks','','| Candidate | Field | First-party query | Required evidence |','| --- | --- | --- | --- |'];
 for(const t of report.items)lines.push('| '+t.product+' | '+t.field+' | '+t.query+' | '+t.acceptableEvidence+' |');
 return lines.join('\n')+'\n';
}
