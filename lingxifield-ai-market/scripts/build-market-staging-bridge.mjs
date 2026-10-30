// Convert public candidate snapshots into a reviewable, idempotent import manifest.
// Deliberately NO database writes, external requests, or verified-status promotion.
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||resolve(root,'reports/source-pipeline'));
const out=resolve(dir,'staging-bridge');
const canonical=v=>{try{
 const u=new URL(v);
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return null;
 u.hostname=u.hostname.toLowerCase().replace(/^www\./,'');
 u.hash='';u.search='';
 u.pathname=u.pathname.replace(/\/+$/,'')||'/';
 return u;
}catch{return null}};
const sha=x=>createHash('sha256').update(x).digest('hex');
const stable=x=>JSON.stringify(x);
const read=async(path,fallback)=>{try{return JSON.parse(await readFile(path,'utf8'))}catch(e){if(e.code==='ENOENT')return fallback;throw e}};
const incoming=await read(resolve(dir,'products-unified.json'),null);
if(!incoming||incoming.schema!=='lingxifield_product_candidates_v1'||!Array.isArray(incoming.products))throw Error('UNIFIED_CATALOG_NOT_FOUND_OR_INVALID');
const prior=await read(resolve(out,'accepted-last.json'),{records:[]});
if(!Array.isArray(prior.records))throw Error('INVALID_PREVIOUS_BRIDGE');
const priorByKey=new Map(prior.records.map(x=>[x.candidate_key,x]));
const groups=new Map();const rejected=[];
for(const p of incoming.products){
 const u=canonical(p.url);
 if(!u||typeof p.name!=='string'||!p.name.trim()){rejected.push({sourceId:p.id||null,reason:'INVALID_URL_OR_NAME'});continue}
 const kind=p.evidence?.kind==='huggingface_public_space'?'hf_space':'catalog_product';
 // Full path matters for HF Spaces; do not merge unrelated demos on one hostname.
 const identity=kind==='hf_space'?u.hostname+u.pathname.toLowerCase():u.hostname;
 const key=kind+':'+sha(identity).slice(0,24);
 const item={candidate_key:key,kind,display_name:p.name.trim().slice(0,200),
 publisher:typeof p.company==='string'&&p.company.trim()?p.company.trim().slice(0,200):null,
 source_url:u.href,source_kind:p.evidence?.kind||'unknown',source_id:String(p.id||''),
 source_observed_at:p.evidence?.observedAt||null,capabilities:Array.isArray(p.capabilities)?p.capabilities.filter(x=>typeof x==='string').slice(0,30):[],
 verification_status:'candidate',price:null,free_quota:null,geo_rank:null,seo_rank:null};
 const old=groups.get(key);
 if(!old){groups.set(key,item);continue}
 // Collision with different products on the same commercial hostname requires review.
 if(kind==='catalog_product'&&(old.display_name.toLowerCase()!==item.display_name.toLowerCase())){
  rejected.push({sourceId:item.source_id,reason:'SAME_DOMAIN_DIFFERENT_PRODUCT_REVIEW',candidate_key:key});continue;
 }
 if(item.source_id.localeCompare(old.source_id)<0)groups.set(key,item);
}
const records=[...groups.values()].sort((a,b)=>a.candidate_key.localeCompare(b.candidate_key));
const normalized=x=>{const {source_observed_at,...rest}=x;return stable(rest)};
const changes={created:[],updated:[],unchanged:[],removed:[],rejected};
for(const item of records){const prev=priorByKey.get(item.candidate_key);const status=!prev?'created':normalized(prev)!==normalized(item)?'updated':'unchanged';changes[status].push(item.candidate_key)}
for(const [key] of priorByKey)if(!groups.has(key))changes.removed.push(key);
// Never auto-delete previously accepted candidates: a missing public source might be a transient fetch failure.
const summary={schema:'lingxifield_candidate_staging_bridge_v1',generatedAt:new Date().toISOString(),inputCount:incoming.products.length,
 retained:records.length,created:changes.created.length,updated:changes.updated.length,
 unchanged:changes.unchanged.length,missingFromLatest:changes.removed.length,rejected:rejected.length,
 policy:'STAGING_ONLY. Review before ingestion. Missing records do not imply discontinued products.'};
await mkdir(out,{recursive:true});
const atomic=async(name,data)=>{const path=resolve(out,name);await writeFile(path+'.tmp',data);await rename(path+'.tmp',path)};
await atomic('candidates-staging.jsonl',records.map(x=>stable(x)).join('\n')+'\n');
await atomic('change-report.json',JSON.stringify({summary,changes},null,2)+'\n');
await atomic('accepted-last.json',JSON.stringify({schema:summary.schema,records},null,2)+'\n');
console.log(JSON.stringify({...summary,output:out},null,2));
