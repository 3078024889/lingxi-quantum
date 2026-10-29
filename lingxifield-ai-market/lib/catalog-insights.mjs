// Pure, deterministic catalog quality and discovery logic. No networking or fabricated metrics.
import {validCatalogEntry} from './catalog-engine.mjs';
function host(value){try{const u=new URL(value);return u.hostname.toLowerCase().replace(/^www\./,'');}catch{return null}}
function tokenize(value){return String(value||'').normalize('NFKC').toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>=2).slice(0,32)}
// User problems, phrased in Chinese or English, map to documented catalog capabilities.
// This is relevance matching only; no unsupported quality, price or free-quota claim.
const intentRules=[
 {patterns:[/视频|video|字幕|subtitle/i],terms:['视频','字幕','video']},
 {patterns:[/图片|照片|绘画|image|photo|picture/i],terms:['图片','图像','文生图']},
 {patterns:[/语音|音频|录音|转文字|转录|audio|voice|transcri/i],terms:['语音','音频','字幕','转文字']},
 {patterns:[/离线|本地|隐私|offline|local|privacy/i],terms:['本地','离线','自托管']},
 {patterns:[/编程|代码|开发|coding|code|program/i],terms:['代码','编程','API','开发']},
 {patterns:[/知识库|文件|文档|检索|搜索|pdf|document|search|rag/i],terms:['RAG','文档','搜索','数据连接']},
 {patterns:[/自动化|智能体|工作流|agent|workflow|automat/i],terms:['智能体','工作流','自动化']},
];
function intentTerms(q){return [...new Set(intentRules.filter(r=>r.patterns.some(p=>p.test(q))).flatMap(r=>r.terms))]}
/** Preview and reject unsafe/stale/duplicate data without changing stored files. */
export function auditCatalogImport(current,candidate){
 if(!Array.isArray(current)||!Array.isArray(candidate))throw Error('CATALOG_INPUT_MUST_BE_ARRAY');
 const issues=[];const existingIds=new Map();const seenIds=new Set();const existingHosts=new Map();
 current.forEach((r,i)=>{if(!validCatalogEntry(r))issues.push({index:i,code:'EXISTING_INVALID'});else{existingIds.set(r.id,r);const h=host(r.website);if(h&&!existingHosts.has(h))existingHosts.set(h,r.id)}});
 const pendingHosts=new Map();let insertable=0,updateable=0,identical=0;
 candidate.forEach((r,i)=>{
  if(!validCatalogEntry(r)){issues.push({index:i,code:'INVALID_ENTRY'});return}
  if(seenIds.has(r.id)){issues.push({index:i,code:'DUPLICATE_ID_IN_BATCH',id:r.id});return}
  seenIds.add(r.id);
  const h=host(r.website),other=pendingHosts.get(h)||existingHosts.get(h);
  if(other&&other!==r.id)issues.push({index:i,code:'POSSIBLE_DOMAIN_DUPLICATE',id:r.id,other});
  if(h&&!pendingHosts.has(h))pendingHosts.set(h,r.id);
  const prior=existingIds.get(r.id);
  if(!prior){insertable++;return}
  if(JSON.stringify(prior)===JSON.stringify(r)){identical++;return}
  if(Date.parse(r.updatedAt)<=Date.parse(prior.updatedAt)){issues.push({index:i,code:'STALE_UPDATE',id:r.id});return}
  updateable++;
 });
 return {total:candidate.length,insertable,updateable,identical,canImport:issues.length===0,issues};
}
/** Search intents and candidate matches, not unsupported assertions about best products. */
export function discoverCatalog(rows,input,{limit=8}={}){
 const q=String(input||'').trim().slice(0,240),terms=tokenize(q),intents=intentTerms(q),max=Math.min(30,Math.max(1,Math.floor(Number(limit)||8)));
 if(!q)return {query:q,dataAvailability:rows.length?'catalog_only':'no_imported_records',items:[],matched:0,notice:'Enter a task, product, company, or capability.'};
 const scored=rows.filter(validCatalogEntry).map(r=>{
  const text=[r.name,r.company,r.category,r.description,...r.capabilities].join(' ').normalize('NFKC').toLocaleLowerCase();
  const n=r.name.normalize('NFKC').toLocaleLowerCase();let score=0;
  if(n===q.toLocaleLowerCase())score+=12;
  if(n.includes(q.toLocaleLowerCase()))score+=6;
  for(const t of terms){if(n.includes(t))score+=4;else if(r.capabilities.some(c=>c.toLocaleLowerCase().includes(t)))score+=3;else if(text.includes(t))score+=1;}
  for(const t of intents)if(text.includes(t.toLocaleLowerCase()))score+=2;
  return {r,score};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.r.id.localeCompare(b.r.id));
 return {query:q,dataAvailability:rows.length?'catalog_only':'no_imported_records',matched:scored.length,items:scored.slice(0,max).map(x=>({...x.r,matchScore:x.score})),notice:'Matches are catalog relevance suggestions, not evidence-based performance rankings.'};
}
export function catalogReadiness(rows,evidence=[]){
 const valid=rows.filter(validCatalogEntry),status={active:0,unverified:0,discontinued:0};
 for(const r of valid)status[r.status]++;
 return {catalogEntries:valid.length,invalidEntries:rows.length-valid.length,status,marketEvidenceRecords:Array.isArray(evidence)?evidence.length:0,hasVerifiedRankings:false,notes:['Catalog record counts are not global market coverage.','Market rankings require independently verified and comparable evidence.']};
}
