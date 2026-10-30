// GitHub cloud runner: bounded source polling + optional private Supabase persistence.
// Run without SUPABASE_* for evidence-only PR tests. No website data is published here.
import {mkdir,rename,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {normalizeSource,SOURCE_INFO} from './source-delta.mjs';
const SOURCES=Object.keys(SOURCE_INFO);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function restrictSource(source){if(!SOURCES.includes(source))throw Error('UNKNOWN_SOURCE');return source;}
export async function fetchJsonBounded(source,{fetcher=fetch,maxBytes=32*1024*1024,attempts=3}={}){
 restrictSource(source);
 const url=SOURCE_INFO[source].endpoint;
 let error;
 for(let n=0;n<attempts;n++){
  try{
   const r=await fetcher(url,{headers:{accept:'application/json','user-agent':'LINGXIFIELD-AI-Market-Snapshot/1.0'},signal:AbortSignal.timeout(20000),redirect:'error'});
   if(!r.ok){
    if([429,500,502,503,504].includes(r.status)&&n+1<attempts){
     const after=Math.min(6000,Math.max(750,Number(r.headers.get('retry-after'))*1000||750*(n+1)));
     await pause(after);continue;
    }
    throw Error('SOURCE_HTTP_'+r.status);
   }
   const length=Number(r.headers.get('content-length')||0);
   if(length>maxBytes)throw Error('SOURCE_BODY_TOO_LARGE');
   if(r.headers.get('content-type')&&!r.headers.get('content-type').includes('json'))throw Error('SOURCE_NOT_JSON');
   let chunks=[],total=0;
   if(!r.body)throw Error('EMPTY_UPSTREAM');
   for await(const part of r.body){
    total+=part.byteLength;if(total>maxBytes)throw Error('SOURCE_BODY_TOO_LARGE');
    chunks.push(part);
   }
   const raw=Buffer.concat(chunks,total);
   return {raw,body:JSON.parse(raw.toString('utf8')),digest:createHash('sha256').update(raw).digest('hex')};
  }catch(e){error=e;if(n+1<attempts&&/fetch|timeout|abort|SOURCE_HTTP_5/.test(String(e)))await pause(800*(n+1));else break;}
 }
 throw Error('COLLECTION_FAILED_'+source+'_'+(error?.message||'NETWORK'));
}
export async function commitPrivateSource(source,records,{url,key,fetcher=fetch}={}){
 restrictSource(source);
 if(!url||!key)throw Error('PRIVATE_SYNC_CREDENTIALS_REQUIRED');
 const host=new URL(url);
 if(host.protocol!=='https:'||!host.hostname.endsWith('.supabase.co'))throw Error('INVALID_PRIVATE_DATABASE_HOST');
 const endpoint=new URL('/rest/v1/rpc/ai_market_apply_source_batch',host);
 const results=[];
 for(let i=0;i<records.length;i+=100){
  const r=await fetcher(endpoint,{method:'POST',headers:{apikey:key,authorization:'Bearer '+key,'content-type':'application/json','accept':'application/json'},
   body:JSON.stringify({p_source:source,p_records:records.slice(i,i+100)}),signal:AbortSignal.timeout(30000),redirect:'error'});
  if(!r.ok)throw Error('DATABASE_BATCH_FAILED_'+source+'_'+r.status);
  const body=await r.json();
  if(body.source!==source||body.seen!==Math.min(100,records.length-i)||body.publicationApproved!==false)throw Error('DATABASE_ACK_INVALID');
  results.push(body);
 }
 return {batches:results.length,inserted:results.reduce((n,x)=>n+x.inserted,0),changed:results.reduce((n,x)=>n+x.changed,0),unchanged:results.reduce((n,x)=>n+x.unchanged,0)};
}
export async function collectSource(source,{dir='reports/ai-market-deltas',fetcher=fetch,writeDatabase=false,env=process.env}={}){
 const {raw,body,digest}=await fetchJsonBounded(source,{fetcher});
 const records=normalizeSource(source,body,{limit:10000});
 const now=new Date().toISOString();
 const doc={schemaVersion:1,source,sourceUrl:SOURCE_INFO[source].endpoint,sourceClass:SOURCE_INFO[source].class,
  scope:SOURCE_INFO[source].scope,collectedAt:now,upstreamSha256:digest,records,publicationApproved:false};
 const destination=resolve(dir);await mkdir(destination,{recursive:true});
 const dest=join(destination,source+'.json'),tmp=dest+'.'+process.pid+'.tmp';
 await writeFile(tmp,JSON.stringify(doc,null,2)+'\n',{flag:'wx'});
 await rename(tmp,dest);
 let db=null;
 if(writeDatabase)db=await commitPrivateSource(source,records,{url:env.NEXT_PUBLIC_SUPABASE_URL||env.SUPABASE_URL,key:env.SUPABASE_SERVICE_ROLE_KEY,fetcher});
 return {source,count:records.length,upstreamSha256:digest,sourceUrl:SOURCE_INFO[source].endpoint,db,publicationApproved:false};
}
export async function runSync({sources=SOURCES,dir='reports/ai-market-deltas',writeDatabase=false,fetcher=fetch,env=process.env}={}){
 if(!Array.isArray(sources)||sources.length===0||new Set(sources).size!==sources.length)throw Error('SOURCES_INVALID');
 sources.forEach(restrictSource);
 const report={startedAt:new Date().toISOString(),sources:[],errors:[],writeDatabase,publicationApproved:false};
 for(const source of sources){
  try{report.sources.push(await collectSource(source,{dir,fetcher,writeDatabase,env}));}
  catch(e){report.errors.push({source,error:e?.message||String(e)});}
 }
 await mkdir(resolve(dir),{recursive:true});
 await writeFile(join(resolve(dir),'sync-report.json'),JSON.stringify(report,null,2)+'\n');
 return report;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const requested=process.env.AI_MARKET_SOURCES?.split(',').map(x=>x.trim())||SOURCES;
 const writeDatabase=process.env.AI_MARKET_COMMIT_PRIVATE==='1';
 // Never connect private DB on untrusted PRs or without explicit main-branch runtime gate.
 if(writeDatabase&&!(process.env.GITHUB_REF==='refs/heads/main'&&['schedule','workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME)))
  throw Error('PRIVATE_SYNC_ONLY_ON_TRUSTED_DEFAULT_BRANCH');
 const report=await runSync({sources:requested,dir:process.env.AI_MARKET_OUTPUT||'reports/ai-market-deltas',writeDatabase});
 console.log(JSON.stringify({sources:report.sources.map(x=>({source:x.source,count:x.count,digest:x.upstreamSha256,db:x.db})),errors:report.errors,publicationApproved:false}));
 if(report.errors.length)process.exitCode=1;
}
