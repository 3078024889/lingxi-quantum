// Public API snapshots only. Default output is ./reports on D: checkout; never writes production DB.
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const src=JSON.parse(await readFile(resolve(root,'data/catalog.json'),'utf8'));
const out=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||resolve(root,'reports','github-snapshot'));
const max=Math.max(1,Math.min(20,Number(process.env.AI_MARKET_MAX_REPOS)||15));
const rows=src.filter(x=>x.status==='unverified'&&/^https:\/\/github\.com\/[a-z0-9_.-]+\/[a-z0-9_.-]+\/?$/i.test(x.website)).slice(0,max);
const list=[],errors=[];const collectedAt=new Date().toISOString();
const localBase=process.env.AI_MARKET_LOCAL_URL||'http://127.0.0.1:3201';
// Fall back only to an explicitly local running project. It already queried GitHub upstream.
const localUrl=new URL(localBase);
if(!['127.0.0.1','localhost','[::1]'].includes(localUrl.hostname)||localUrl.protocol!=='http:')throw Error('LOCAL_URL_REQUIRED');
let localRows=[];
try{const r=await fetch(new URL('/api/market/public-repos',localUrl),{signal:AbortSignal.timeout(5000)});
 if(r.ok){const v=await r.json();localRows=Array.isArray(v.records)?v.records.filter(x=>x.status==='public_repository_unverified_product'):[];}
}catch{}
const localByRepo=new Map(localRows.map(x=>[String(x.id).toLowerCase(),x]));
for(const row of rows){
 const parsed=new URL(row.website),[owner,name]=parsed.pathname.split('/').filter(Boolean);
 try{
  const response=await fetch('https://api.github.com/repos/'+encodeURIComponent(owner)+'/'+encodeURIComponent(name),{headers:{Accept:'application/vnd.github+json','User-Agent':'LINGXIFIELD-Market-Research'},signal:AbortSignal.timeout(12000)});
  if(!response.ok){errors.push({id:row.id,reason:'HTTP_'+response.status});if(response.status===403||response.status===429){break;}continue;}
  const v=await response.json();
  if(v.private||typeof v.full_name!=='string'||v.full_name.toLowerCase()!==(owner+'/'+name).toLowerCase()){errors.push({id:row.id,reason:'REPOSITORY_IDENTITY_MISMATCH'});continue;}
  list.push({catalogId:row.id,repository:v.full_name,sourceUrl:v.html_url,collectedAt,
   stars:Number.isSafeInteger(v.stargazers_count)?v.stargazers_count:null,
   forks:Number.isSafeInteger(v.forks_count)?v.forks_count:null,
   openIssues:Number.isSafeInteger(v.open_issues_count)?v.open_issues_count:null,
   licenseSpdx:typeof v.license?.spdx_id==='string'&&v.license.spdx_id!=='NOASSERTION'?v.license.spdx_id:null,
   pushedAt:typeof v.pushed_at==='string'?v.pushed_at:null,
   archived:v.archived===true,
   metricScope:'github_repository_only',verification:'official_github_api_repository_metadata'});
 }catch(e){errors.push({id:row.id,reason:e?.name==='TimeoutError'?'TIMEOUT':'NETWORK_UNAVAILABLE'});}
}
// A failed direct request can be covered by the local application official GitHub API response.
// These records may be cached; preserve that uncertainty instead of claiming a fresh direct sample.
for(const row of rows){if(list.some(x=>x.catalogId===row.id))continue;
 const u=new URL(row.website),repo=u.pathname.slice(1).replace(/\/$/,'').toLowerCase();
 const v=localByRepo.get(repo);if(!v||!Number.isSafeInteger(v.stars)||v.stars<0||!v.sourceUrl?.startsWith('https://github.com/'))continue;
 list.push({catalogId:row.id,repository:v.id,sourceUrl:v.sourceUrl,collectedAt,stars:v.stars,forks:Number.isSafeInteger(v.forks)?v.forks:null,
 openIssues:null,licenseSpdx:v.license||null,pushedAt:v.pushedAt||null,archived:null,
 metricScope:'github_repository_only',verification:'local_app_github_api_cached_response',freshness:'unknown_or_cached'});
}
const report={kind:'github_repository_snapshot',collectedAt,source:'https://api.github.com/repos/{owner}/{repo}',
 scope:'repository stars, forks and maintenance only; NOT site visits, app downloads, SEO/GEO, revenue or AI quality',
 requested:rows.length,completed:list.length,errors,localSourceMatched:list.filter(x=>x.verification==='local_app_github_api_cached_response').length,records:list};
await mkdir(out,{recursive:true});
const serialized=JSON.stringify(report,null,2)+'\n';
const digest=createHash('sha256').update(serialized).digest('hex');
const target=resolve(out,'github-repository-snapshot.json'),temporary=target+'.tmp';
await writeFile(temporary,serialized);await rename(temporary,target);
await writeFile(resolve(out,'github-repository-snapshot.sha256'),digest+'  github-repository-snapshot.json\n');
console.log(JSON.stringify({file:target,sha256:digest,completed:list.length,requested:rows.length,errorCount:errors.length,scope:report.scope},null,2));
if(!list.length)process.exitCode=2;
