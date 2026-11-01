// Append-only deduplicated local observation history. No live DB or privileged credentials.
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/github-snapshot');
const source=resolve(dir,'github-repository-snapshot.json');
const file=resolve(dir,'github-observations.json');
const snapshot=JSON.parse(await readFile(source,'utf8'));
if(!Array.isArray(snapshot.records)||!Number.isFinite(Date.parse(snapshot.collectedAt)))throw Error('INVALID_SNAPSHOT');
let old=[];try{const stored=JSON.parse(await readFile(file,'utf8'));if(!Array.isArray(stored))throw Error('INVALID_HISTORY');old=stored;}catch(e){if(e.code!=='ENOENT')throw e;}
const added=[];for(const r of snapshot.records){
 if(!r||typeof r.repository!=='string'||!/^[\w.-]+\/[\w.-]+$/.test(r.repository)||!/^https:\/\/github\.com\//.test(r.sourceUrl)||!Number.isSafeInteger(r.stars)||r.stars<0)continue;
 // A cached or retained record is not a new observation; preserve its original collection date where available.
 if(r.freshness==='retained_not_refreshed'||r.freshness==='unknown_or_cached')continue;
 const observedAt=r.collectedAt||snapshot.collectedAt;
 if(!Number.isFinite(Date.parse(observedAt)))continue;
 added.push({catalogId:r.catalogId,repository:r.repository,stars:r.stars,forks:r.forks??null,observedAt,sourceUrl:r.sourceUrl,method:'official_github_api_repository_metadata',metricScope:'github_repository_only'});
}
const keyed=new Map(old.map(x=>[x.repository+'|'+x.observedAt,x]));for(const x of added)keyed.set(x.repository+'|'+x.observedAt,x);
const all=[...keyed.values()].sort((a,b)=>a.observedAt.localeCompare(b.observedAt)||a.repository.localeCompare(b.repository));
await mkdir(dir,{recursive:true});const body=JSON.stringify(all,null,2)+'\n';const temp=file+'.tmp';await writeFile(temp,body);await rename(temp,file);
const sha256=createHash('sha256').update(body).digest('hex');
await writeFile(file+'.sha256',sha256+'  github-observations.json\n');
console.log(JSON.stringify({file,existing:old.length,added:all.length-old.length,total:all.length,sha256,scope:'github_repository_only'}));
