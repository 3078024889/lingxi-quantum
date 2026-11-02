#!/usr/bin/env node
/** SSR-only 9×32 route smoke. Real browser login, generation and downloads NOT tested. */
import {spawn} from 'node:child_process';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../lib/market-api-service-catalog.ts',import.meta.url),'utf8');
const match=source.match(/const ALL=\[([^\]]+)\] as const;/);
if(!match)throw Error('CURATED_IDS_UNAVAILABLE');
const ids=[...match[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
const languages=['zh','en','ja','ko','fr','de','es','pt','ar'];
if(ids.length!==32||new Set(ids).size!==32)throw Error('CURATED_32_REQUIRED');
const origin='http://127.0.0.1:'+String(Number(process.env.AI_MARKET_SMOKE_PORT)||38433);
const processArgs=['node_modules/next/dist/bin/next','start','-p',new URL(origin).port,'-H','127.0.0.1'];
const child=spawn(process.execPath,processArgs,{cwd:new URL('../',import.meta.url).pathname,stdio:'ignore',env:{...process.env,AI_MARKET_INDEX_READY:'0',AI_MARKET_BILLING_ENABLED:'0'}});
let closed=false;child.once('exit',()=>{closed=true});
const cleanup=()=>{if(!closed)child.kill('SIGTERM')};
process.once('exit',cleanup);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ready=false;
try{
 for(let i=0;i<60;i++){
  if(closed)break;
  try{const x=await fetch(origin+'/zh/ai',{signal:AbortSignal.timeout(2500),redirect:'manual'});
   if(x.status===200){ready=true;break}
  }catch{}
  await sleep(700);
 }
 if(!ready)throw Error('NEXT_START_NOT_READY');
 const paths=languages.flatMap(lang=>[
  '/'+lang+'/ai',
  '/'+lang+'/companies',
  ...ids.map(id=>'/'+lang+'/platform/'+id)
 ]);
 const failures=[],statuses={};let cursor=0,checked=0;
 async function worker(){
  while(true){
   const idx=cursor++;if(idx>=paths.length)return;
   const path=paths[idx],lang=path.split('/')[1];
   try{
    const res=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(12000)});
    const ct=res.headers.get('content-type')||'';
    const html=res.status===200&&ct.includes('text/html')?await res.text():'';
    const opening=html.match(/<html\b[^>]*>/i)?.[0]||'';
    const htmlLang=opening.match(/\blang=["']([^"']+)/i)?.[1]||'';
    const dir=opening.match(/\bdir=["']([^"']+)/i)?.[1]||'';
    const expectedLang=lang==='zh'?'zh-CN':lang;
    const isOk=res.status===200&&ct.includes('text/html')&&htmlLang===expectedLang
       &&dir===(lang==='ar'?'rtl':'ltr')&&html.includes('LINGXIFIELD');
    if(!isOk)failures.push({path,status:res.status,htmlLang,dir,contentType:ct.slice(0,60)});
    statuses[res.status]=(statuses[res.status]||0)+1;
   }catch(e){failures.push({path,error:e instanceof Error?e.message:'NETWORK_ERROR'})}
   checked++;
  }
 }
 await Promise.all(Array.from({length:6},worker));
 // Company/API graph is independently queried over HTTP; not just route existence.
 for(const [path,verify] of [
  ['/api/v1/companies?limit=50',data=>data.scope==='curated_32_publishers'&&data.curatedProducts===32&&data.items.length>1],
  ['/api/v1/companies/openai',data=>data.publisher?.products?.some(x=>x.id==='chatgpt')&&data.publisher?.products?.some(x=>x.id==='openai-python')],
  ['/api/v1/model-offers?limit=10',data=>data.scope==='official_rate_rows_for_curated_32'&&data.total>0&&data.items.every(x=>x.source.startsWith('https://'))]
 ]){
  try{
   const response=await fetch(origin+path,{signal:AbortSignal.timeout(12000)});
   const body=response.status===200?await response.json():null;
   if(response.status!==200||!verify(body||{}))failures.push({path,status:response.status,reason:'REGISTRY_API_CONTRACT_INVALID'});
  }catch(e){failures.push({path,error:e instanceof Error?e.message:'API_NETWORK_FAILURE'})}
  checked++;
 }
 const result={scope:'nine_locale_x_32_products_ssr_smoke',checked,total:paths.length+3,
  passed:checked-failures.length,failed:failures.length,failures:failures.slice(0,60),httpStatuses:statuses,
  note:'Local Next.js SSR HTTP smoke only; NOT a real user journey or verified paid service.'};
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(failures.length)process.exitCode=1;
}finally{cleanup()}
