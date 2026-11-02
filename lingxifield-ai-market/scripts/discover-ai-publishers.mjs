#!/usr/bin/env node
/** Source-backed discovery of HF organizations, NOT verified incorporated companies.
 * Collect only private review leads, max 20 per run. Node 22, no dependencies.
 */
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const API='https://huggingface.co',SAFE=/^[a-zA-Z0-9][a-zA-Z0-9._-]{1,63}$/;
const FIELDS=['legalEntity','officialWebsite','founded','headquarters','listing','funding','products','pricing','freeTier','models','regions','commercialRights','paymentMethods'];
const slug=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,'');
const readJson=p=>JSON.parse(readFileSync(p,'utf8'));
const array=v=>Array.isArray(v)?v:[];
export function knownPublisherTokens(root=ROOT){
 const tokens=new Set(),add=v=>{const k=slug(v);if(k.length>=2)tokens.add(k)};
 const folder=resolve(root,'data/company-intake');
 if(existsSync(folder))for(const f of readdirSync(folder).filter(x=>/^batch-\d{3}\.json$/.test(x))){
  for(const p of array(readJson(resolve(folder,f)).products)){
   [p.id,p.name,p.company,p.publisherGroupId,...array(p.aliases)].forEach(add);
   try{add(new URL(p.website).hostname.replace(/^www\./,'').split('.')[0])}catch{}
  }
 }
 for(const filename of ['data/company-profiles.json','data/catalog.json']){
  const p=resolve(root,filename);if(!existsSync(p))continue;
  const content=readJson(p),rows=Array.isArray(content)?content:array(content.platforms||content.products);
  for(const x of rows)[x.id,x.name,x.company,x.publisherGroupId,x.companyId].forEach(add);
 }
 const source=resolve(root,'lib/market-api-service-catalog.ts');
 if(existsSync(source)){
  const match=readFileSync(source,'utf8').match(/const ALL=\[([^\]]+)\] as const;/);
  if(match)for(const m of match[1].matchAll(/'([^']+)'/g))add(m[1]);
 }
 const archives=[resolve(root,'data/company-discovery/archive'),process.env.DISCOVERY_HISTORY_DIR].filter(Boolean);
 for(const archive of archives)if(existsSync(archive)){
  const seen=resolve(archive,'seen.json');
  if(existsSync(seen))for(const token of array(readJson(seen)))add(token);
  for(const f of readdirSync(archive).filter(x=>/^\d{4}-\d{2}-\d{2}\.json$/.test(x)))
   for(const x of array(readJson(resolve(archive,f)).candidates))add(x.namespace);
 }
 return tokens;
}
export function candidateNamespaces(feeds,excluded=new Set(),maxPool=90){
 const results=new Map();
 for(const feed of feeds){
  if(!Array.isArray(feed.rows))throw Error('INVALID_HF_FEED_ARRAY:'+feed.name);
  for(const item of feed.rows){
   const id=item?.id||item?.modelId,pieces=typeof id==='string'?id.split('/'):[];
   if(pieces.length!==2||!SAFE.test(pieces[0])||pieces[0].includes('..')||!pieces[1])continue;
   const namespace=pieces[0],key=slug(namespace);if(excluded.has(key))continue;
   if(!results.has(key))results.set(key,{namespace,models:[],spaces:[],sourceFeeds:[]});
   const row=results.get(key),target=feed.kind==='space'?row.spaces:row.models;
   const url=API+'/'+(feed.kind==='space'?'spaces/':'')+pieces.map(encodeURIComponent).join('/');
   if(target.length<4&&!target.includes(url))target.push(url);
   if(!row.sourceFeeds.includes(feed.name))row.sourceFeeds.push(feed.name);
  }
 }
 return [...results.values()].slice(0,maxPool);
}
function safeApi(path){const u=new URL(path,API);if(u.origin!==API||!u.pathname.startsWith('/api/'))throw Error('UNTRUSTED_DISCOVERY_API');return u}
export async function hubJson(path,{fetchImpl=fetch,authToken='',retries=2,timeoutMs=12000,sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 const u=safeApi(path),headers={Accept:'application/json','User-Agent':'LINGXIFIELD-SIAI-Discovery/1.0'};
 if(authToken)headers.Authorization='Bearer '+authToken;
 for(let n=0;n<=retries;n++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
   const r=await fetchImpl(u.toString(),{headers,signal:controller.signal,redirect:'error'});
   if(r.status===404)return null;
   if([429,500,502,503,504].includes(r.status)&&n<retries){
    const delay=Number(r.headers?.get?.('retry-after'));
    await sleep(Number.isFinite(delay)&&delay>0?Math.min(delay*1000,30000):750*(n+1));continue;
   }
   if(!r.ok)throw Error('HUB_HTTP_'+r.status);
   const v=await r.json();
   if(JSON.stringify(v)?.length>2_000_000)throw Error('HUB_PAYLOAD_TOO_BIG');
   return v;
  }catch(e){
   if(n===retries||!/abort|timeout|fetch failed/i.test(String(e)))throw e;
   await sleep(500*(n+1));
  }finally{clearTimeout(timer)}
 }
 throw Error('HUB_FETCH_EXHAUSTED');
}
export async function discoverPublishers({fetchImpl=fetch,known=new Set(),date=new Date().toISOString().slice(0,10),max=20,authToken='',feedOverride=null}={}){
 if(!Number.isInteger(max)||max<1||max>20)throw Error('BATCH_LIMIT_1_TO_20');
 if(!/^\d{4}-\d\d-\d\d$/.test(date))throw Error('INVALID_RUN_DATE');
 const feeds=feedOverride||await Promise.all([
  ['/api/models?sort=createdAt&direction=-1&limit=100','latest_models'],
  ['/api/models?sort=downloads&direction=-1&limit=100','popular_models'],
  ['/api/spaces?sort=createdAt&direction=-1&limit=100','latest_spaces']
 ].map(async([path,name])=>({name,kind:name.includes('spaces')?'space':'model',rows:await hubJson(path,{fetchImpl,authToken})})));
 const pool=candidateNamespaces(feeds,known),candidates=[],errors=[];let misses=0;
 for(const p of pool){
  if(candidates.length>=max)break;
  let org;
  try{org=await hubJson('/api/organizations/'+encodeURIComponent(p.namespace),{fetchImpl,authToken,retries:1})}
  catch(e){errors.push({namespace:p.namespace,status:'lookup_failed',reason:String(e).slice(0,80)});continue}
  if(!org||typeof org!=='object'||Array.isArray(org)){misses++;continue}
  if(known.has(slug(p.namespace)))continue;
  candidates.push({
   namespace:p.namespace,displayName:typeof org.name==='string'&&org.name?org.name:p.namespace,
   entityClassification:'huggingface_organization_not_verified_company',
   discoveryDate:date,provider:'huggingface_hub',
   organizationProfileUrl:API+'/'+encodeURIComponent(p.namespace),
   organizationApiEvidenceUrl:API+'/api/organizations/'+encodeURIComponent(p.namespace),
   exampleModelUrls:p.models,exampleSpaceUrls:p.spaces,sourceFeeds:p.sourceFeeds,
   discoveredFacts:{huggingfaceOrganizationObserved:true},
   unverifiedFields:Object.fromEntries(FIELDS.map(f=>[f,null])),
   editorialStatus:'research_queue',publishApproved:false,visibleToPublic:false,
   reviewRequired:['official_legal_company_identity','official_owned_domain','product_identification','source_7_facts','human_check','no_duplicate_parent']
  });
 }
 return {schema:'sia_global_company_leads_v1',date,source:'huggingface_hub_api',
  scope:'unverified_organization_leads_not_legal_companies',maxCandidates:max,
  candidates,reviewGroups:[{name:'group_a',candidates:candidates.slice(0,10).map(x=>x.namespace)},
   {name:'group_b',candidates:candidates.slice(10,20).map(x=>x.namespace)}],
  stats:{discovered:candidates.length,probed:pool.length,profileMisses:misses,lookupErrors:errors.length,excludedKnown:known.size},
  errors,productionPublishAllowed:false};
}
async function main(){
 const args=process.argv.slice(2),i=args.indexOf('--out');if(i<0||!args[i+1])throw Error('USE --out /path/report.json');
 const r=await discoverPublishers({known:knownPublisherTokens(),authToken:process.env.HF_TOKEN||''});
 const p=resolve(args[i+1]);mkdirSync(dirname(p),{recursive:true});
 writeFileSync(p,JSON.stringify(r,null,2)+'\n',{mode:0o600});
 console.log(JSON.stringify({output:p,statistics:r.stats,groupSizes:r.reviewGroups.map(x=>x.candidates.length),publication:false}));
 if(!r.candidates.length)process.exitCode=2;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))
 main().catch(e=>{console.error('DISCOVERY_FAILED: '+e.message);process.exitCode=1});
