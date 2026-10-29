import {readFile} from 'node:fs/promises';import {resolve,dirname} from 'node:path';import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(await readFile(resolve(root,'data/catalog.json'),'utf8'));
const four=JSON.parse(await readFile(resolve(root,'data/verified-market-metrics.json'),'utf8'));
let snapshot=null;
try{snapshot=JSON.parse(await readFile(resolve(process.env.AI_MARKET_SNAPSHOT_DIR||resolve(root,'reports/github-snapshot'),'github-repository-snapshot.json'),'utf8'))}catch{}
const byCategory={};for(const c of catalog)byCategory[c.category]=(byCategory[c.category]||0)+1;
const report={time:new Date().toISOString(),catalogCandidates:catalog.length,catalogVerified:catalog.filter(x=>x.status==='active').length,
 knownRepositorySnapshotRecords:snapshot?.records?.length||0,repositorySnapshotTime:snapshot?.collectedAt||null,
 businessMetricSourcesVerified:Object.values(four).filter(x=>x&&typeof x==='object'&&typeof x.sourceUrl==='string'&&x.sourceUrl.startsWith('https://')).length,
 categories:byCategory,
 blockers:['Website visits: authorized independent analytics provider needed','App downloads: authorized mobile intelligence dataset needed','GEO: representative repeatable question/model/region sampling needed','Funding: separately verified official company or filings evidence needed'],
 note:'A build success or HTTP 200 response is not proof of sourced metrics.'};
console.log(JSON.stringify(report,null,2));
