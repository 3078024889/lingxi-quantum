/** Source completeness is not correctness, freshness, or independent performance proof. */
export const SOURCE_FIELDS=Object.freeze([
 ['price','priceSource'],['free','freeSource'],['region','regionSource'],
 ['models','modelsSource'],['commercial','commercialSource'],
 ['payments','paymentSource']
]);
const httpsSource=x=>{
 if(typeof x!=='string')return false;
 try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password&&!u.port;}
 catch{return false;}
};
const hasText=x=>typeof x==='string'&&x.trim().length>0;
export function auditSourceCoverage(rows){
 if(!Array.isArray(rows)||new Set(rows.map(r=>r.id)).size!==rows.length)throw Error('DUPLICATE_PRODUCT_OR_INVALID_ROWS');
 const missingByProduct=[];
 const fieldCoverage=Object.fromEntries(SOURCE_FIELDS.map(([field])=>[field,0]));
 for(const row of rows){
  if(!row||!hasText(row.id))throw Error('INVALID_PRODUCT_ID');
  const facts=row.facts||{},missing=[];
  for(const [field,sourceField] of SOURCE_FIELDS){
   const value=facts[field],source=facts[sourceField];
   if((field==='payments'?Array.isArray(value)&&value.length>0:hasText(value))&&httpsSource(source))fieldCoverage[field]++;
   else missing.push(field);
  }
  if(missing.length)missingByProduct.push({id:row.id,missing});
 }
 return {total:rows.length,fieldCoverage,fullySourcedProducts:rows.length-missingByProduct.length,missingByProduct};
}
/** Explicit currency prices are not the same as self-hosted costs or unit API rates. */
export function auditPriceDetail(rows){
 if(!Array.isArray(rows))throw Error('INVALID_PRODUCT_ROWS');
 const priced=[],notQuoted=[],freeSelfHosted=[];
 const currencies=/(?:[$€£¥]|(?:USD|CNY|EUR|GBP)\\s*)\\s*\\d+(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?\\s*(?:元|美元|人民币|USD|CNY|EUR|GBP)/i;
 for(const r of rows){
  if(!r||!hasText(r.id))throw Error('INVALID_PRODUCT_ID');
  const price=r.facts?.price||'';
  if(hasText(price)&&httpsSource(r.facts?.priceSource)&&currencies.test(price))priced.push(r.id);
  else notQuoted.push(r.id);
  if(/(?:开源|自托管|本地).{0,28}免费|免费.{0,28}(?:开源|自托管|本地)/i.test(price))freeSelfHosted.push(r.id);
 }
 return {total:rows.length,explicitCurrencyAmountProducts:priced.length,pricedIds:priced,
  withoutFixedCurrencyQuote:notQuoted,freeSelfHostedIds:freeSelfHosted,
  methodology:'An absent fixed subscription is not a defect for free SDKs; listed money is not necessarily a developer API or region-independent checkout price.'};
}
export function auditCompanyCoverage(rows){
 if(!Array.isArray(rows))throw Error('INVALID_COMPANY_ROWS');
 const publishers=new Map();
 for(const row of rows){
  if(!row||!hasText(row.name)||!['company','open_source_project','software_library'].includes(row.kind))throw Error('INVALID_COMPANY_ENTRY');
  if(!publishers.has(row.name))publishers.set(row.name,row);
 }
 const companies=[...publishers.values()].filter(r=>r.kind==='company');
 const projects=[...publishers.values()].filter(r=>r.kind!=='company');
 const validFact=entry=>entry&&hasText(entry.text)&&httpsSource(entry.source);
 const missingFor=field=>companies.filter(r=>!validFact(r.evidence?.[field])).map(r=>r.name);
 return {distinctPublishers:publishers.size,companies:companies.length,projects:projects.length,
  companyFoundedSourced:companies.filter(r=>validFact(r.evidence?.founded)).length,
  missingFounding:missingFor('founded'),missingLocation:missingFor('headquarters'),
  missingFunding:missingFor('funding'),confirmedListedParent:companies.filter(r=>validFact(r.evidence?.listing)).length,
  note:'A missing funding event or stock-exchange filing does not mean zero financing or unlisted status. Office, legal service, and historical business addresses are individually qualified.'};
}
