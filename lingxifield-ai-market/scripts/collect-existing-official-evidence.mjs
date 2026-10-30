// Existing 25 products only. Source-first conditional HTTP collector, no automated factual approval.
// Output is evidence candidates: NEVER claim verified price/free allowance from HTML alone.
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(process.env.AI_MARKET_EVIDENCE_DIR||resolve(root,'reports/official-evidence'));
await mkdir(dir,{recursive:true});
const list=JSON.parse(await readFile(resolve(root,'data/existing-product-official-sources.json'),'utf8')).sources;
const statePath=resolve(dir,'fetch-state.json');
let state={};try{state=JSON.parse(await readFile(statePath,'utf8'))}catch{}
const max=Math.max(1,Math.min(25,Number(process.env.AI_MARKET_OFFICIAL_LIMIT)||25));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const sha=x=>createHash('sha256').update(x).digest('hex');
const atom=async(file,value)=>{const dest=resolve(dir,file);await writeFile(dest+'.tmp',value);await rename(dest+'.tmp',dest)};
const compactText=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim().slice(0,50000);
const results=[];
for(const item of list.slice(0,max)){
 const old=state[item.id]||{};
 let url;try{url=new URL(item.url)}catch{results.push({id:item.id,state:'INVALID_URL'});continue}
 if(url.protocol!=='https:'||url.username||url.password){results.push({id:item.id,state:'INVALID_URL'});continue}
 // Explicitly no cross-host redirect chain: redirect targets must be reviewed before trust.
 const headers={Accept:item.sourceType==='github_official_repository_api'?'application/vnd.github+json':'text/html,application/xhtml+xml', 'User-Agent':'LINGXIFIELD-Official-Evidence-Research'};
 if(old.etag)headers['If-None-Match']=old.etag;
 if(old.lastModified)headers['If-Modified-Since']=old.lastModified;
 let response;
 try{response=await fetch(url,{headers,redirect:'manual',signal:AbortSignal.timeout(20000)})}
 catch(e){results.push({id:item.id,state:'NETWORK_ERROR',error:String(e).slice(0,140)});continue}
 const date=new Date().toISOString();
 if(response.status===304){results.push({id:item.id,state:'UNCHANGED',checkedAt:date,priorHash:old.hash||null});continue}
 if(response.status>=300&&response.status<400){results.push({id:item.id,state:'REDIRECT_REVIEW',location:response.headers.get('location'),checkedAt:date});continue}
 if(!response.ok){results.push({id:item.id,state:response.status===429?'RATE_LIMITED':'HTTP_ERROR',status:response.status,checkedAt:date});if(response.status===429)break;continue}
 const type=response.headers.get('content-type')||'';
 if(!(item.sourceType==='github_official_repository_api'?type.includes('json'):type.includes('html'))){results.push({id:item.id,state:'CONTENT_TYPE_REVIEW',contentType:type,checkedAt:date});continue}
 const declared=Number(response.headers.get('content-length')||0);
 if(declared>1200000){results.push({id:item.id,state:'TOO_LARGE',checkedAt:date});continue}
 const raw=await response.text();
 if(raw.length>1200000){results.push({id:item.id,state:'TOO_LARGE',checkedAt:date});continue}
 const hash=sha(raw),changed=old.hash!==hash;
 let evidence;
 if(item.sourceType==='github_official_repository_api'){
  let data;try{data=JSON.parse(raw)}catch{results.push({id:item.id,state:'INVALID_JSON'});continue}
  const expected=url.pathname.replace(/^\/repos\//,'').toLowerCase();
  if(!data.full_name||data.full_name.toLowerCase()!==expected||data.private){results.push({id:item.id,state:'REPOSITORY_IDENTITY_MISMATCH'});continue}
  evidence={repo:data.full_name,stars:data.stargazers_count??null,forks:data.forks_count??null,license:data.license?.spdx_id??null,
   pushedAt:data.pushed_at??null,note:'Repository-only signals, not AI product users, traffic, model quality or prices.'};
 }else{
  const text=compactText(raw);
  const keyword=/(free|pricing|month|annual|credit|commercial|refund|免费|价格|积分|包月|订阅|商用|退款)/ig;
  const snippets=[];let hit;
  while((hit=keyword.exec(text))&&snippets.length<15){const start=Math.max(0,hit.index-100);snippets.push(text.slice(start,Math.min(text.length,hit.index+190)));keyword.lastIndex=hit.index+Math.max(1,hit[0].length)}
  evidence={snippets,bodyLength:raw.length,note:'Unverified extraction hints only. No pricing, free allowance, regions or terms auto-approved.'};
 }
 const output={schema:'existing_official_evidence_candidate_v1',id:item.id,sourceType:item.sourceType,sourceUrl:item.url,checkedAt:date,
   sha256:hash,etag:response.headers.get('etag'),lastModified:response.headers.get('last-modified'),changed,reviewStatus:'candidate_unverified',
   evidence};
 await atom(item.id+'.json',JSON.stringify(output,null,2)+'\n');
 state[item.id]={hash,etag:output.etag,lastModified:output.lastModified,checkedAt:date};
 results.push({id:item.id,state:changed?'CHANGED_REVIEW_REQUIRED':'UNCHANGED_HASH',checkedAt:date,sha256:hash});
 await delay(650);
}
await atom('fetch-state.json',JSON.stringify(state,null,2)+'\n');
const report={schema:'existing_official_evidence_run_v1',at:new Date().toISOString(),totalSources:list.length,processed:results.length,
 reviewRequired:results.filter(x=>x.state==='CHANGED_REVIEW_REQUIRED').length,results,
 note:'No automatic verified facts, no production database mutation; redirects and unknown content types require review.'};
await atom('collection-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({report:resolve(dir,'collection-report.json'),processed:results.length,reviewRequired:report.reviewRequired,statuses:results.reduce((o,x)=>(o[x.state]=(o[x.state]||0)+1,o),{})},null,2));
