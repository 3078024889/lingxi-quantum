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
for(const row of rows){
 const parsed=new URL(row.website),[owner,name]=parsed.pathname.split('/').filter(Boolean);
 try{
  const response=await fetch('https://api.github.com/repos/'+encodeURIComponent(owner)+'/'+encodeURIComponent(name),{headers:{Accept:'application/vnd.github+json','User-Agent':'LINGXIFIELD-Market-Research'},signal:AbortSignal.timeout(12000)});
  if(!response.ok){errors.push({id:row.id,reason:'HTTP_'+response.status});if(response.status===403||response.status===429)break;continue;}
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
const report={kind:'github_repository_snapshot',collectedAt,source:'https://api.github.com/repos/{owner}/{repo}',
 scope:'repository stars, forks and maintenance only; NOT site visits, app downloads, SEO/GEO, revenue or AI quality',
 requested:rows.length,completed:list.length,errors,records:list};
await mkdir(out,{recursive:true});
const serialized=JSON.stringify(report,null,2)+'\n';
const digest=createHash('sha256').update(serialized).digest('hex');
const target=resolve(out,'github-repository-snapshot.json'),temporary=target+'.tmp';
await writeFile(temporary,serialized);await rename(temporary,target);
await writeFile(resolve(out,'github-repository-snapshot.sha256'),digest+'  github-repository-snapshot.json\n');
console.log(JSON.stringify({file:target,sha256:digest,completed:list.length,requested:rows.length,errorCount:errors.length,scope:report.scope},null,2));
if(!list.length)process.exitCode=2;
