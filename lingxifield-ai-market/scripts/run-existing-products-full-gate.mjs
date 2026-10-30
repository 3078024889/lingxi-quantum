// LINGXIFIELD full existing-product acceptance gate: zero new products, zero DB writes.
// Run from any working directory: node scripts/run-existing-products-full-gate.mjs
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(process.env.AI_MARKET_REVIEW_DIR||resolve(root,'reports/existing-product-gate'));
await mkdir(output,{recursive:true});
const catalog=JSON.parse(await readFile(resolve(root,'data/catalog.json'),'utf8'));
if(!Array.isArray(catalog))throw Error('CATALOG_NOT_ARRAY');
const reviewed=await readFile(resolve(root,'lib/reviewed-product-facts.ts'),'utf8');
const snapshots=[...reviewed.matchAll(/\{product:\s*"([^"]+)",observedAt:/g)].map(x=>x[1]);
const covered=new Set(snapshots), ids=new Set(), hosts=new Map(), rows=[],conflicts=[];
for(const item of catalog){
 if(!item||typeof item.id!=='string'||!item.id||ids.has(item.id))throw Error('DUPLICATE_OR_INVALID_PRODUCT');
 ids.add(item.id);
 let host=null;
 try{const url=new URL(item.website);if(url.protocol==='https:'&&!url.username&&!url.password)host=url.hostname.replace(/^www\./,'').toLowerCase()}catch{}
 if(!host)conflicts.push({id:item.id,problem:'INVALID_WEBSITE'});
 if(host){const previous=hosts.get(host);if(previous&&previous!==item.id)conflicts.push({id:item.id,other:previous,problem:'SAME_HOST_NEEDS_REVIEW'});else hosts.set(host,item.id)}
 rows.push({id:item.id,name:item.name,company:item.company,category:item.category,officialOrProjectUrl:item.website,
  hasReviewedSnapshot:covered.has(item.id),price:'NOT_REVIEWED_IN_THIS_GATE',freeQuota:'NOT_REVIEWED_IN_THIS_GATE',
  region:'NOT_REVIEWED_IN_THIS_GATE',geo:'NOT_REVIEWED_IN_THIS_GATE',seo:'NOT_REVIEWED_IN_THIS_GATE',
  actions:covered.has(item.id)?['check_source_recency','complete_missing_commercial_claims']:['verify_identity','review_free_price_limits','verify_access_and_official_sources']});
}
const steps=[
 ['catalog_validation','scripts/validate-catalog-v25.mjs'],
 ['evidence_validation','scripts/validate-evidence.mjs']
];
const checks=[];
for(const [name,script] of steps){
 const r=spawnSync(process.execPath,[resolve(root,script)],{cwd:root,env:process.env,encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024});
 checks.push({name,ok:r.status===0,exitCode:r.status,stdout:(r.stdout||'').slice(-1500),stderr:(r.stderr||'').slice(-1500)});
}
const summary={schema:'lingxifield_existing_products_gate_v1',createdAt:new Date().toISOString(),productCount:rows.length,
 withAnyReviewedSnapshot:rows.filter(x=>x.hasReviewedSnapshot).length,
 lackingReviewedSnapshot:rows.filter(x=>!x.hasReviewedSnapshot).length,
 identitiesRequiringReview:conflicts.length,checksPassed:checks.every(x=>x.ok),
 note:'Audit coverage is not proof that price, licensing, SEO/GEO or regional terms are accurate. No new records collected or production DB written.'};
const result={summary,checks,conflicts,products:rows};
const body=JSON.stringify(result,null,2)+'\n';
const file=resolve(output,'existing-products-full-gate.json');
await writeFile(file+'.tmp',body);await rename(file+'.tmp',file);
await writeFile(file+'.sha256',createHash('sha256').update(body).digest('hex')+'  existing-products-full-gate.json\n');
console.log(JSON.stringify({...summary,report:file},null,2));
if(!summary.checksPassed||conflicts.some(x=>x.problem==='INVALID_WEBSITE'))process.exitCode=2;
