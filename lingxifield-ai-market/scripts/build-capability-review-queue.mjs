/**
 * Build a bounded editorial work queue for all catalog entries.
 * NEVER labels an auto-extracted keyword as a verified manufacturer capability.
 * node scripts/build-capability-review-queue.mjs
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validCatalogEntry} from '../lib/catalog-engine.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const [catalog,profiles,platforms]=await Promise.all([
  readFile(path.join(root,'data/catalog.json'),'utf8').then(JSON.parse),
  readFile(path.join(root,'lib/capability-profiles.ts'),'utf8'),
  readFile(path.join(root,'lib/data.ts'),'utf8')
]);
const curated=new Set([...profiles.matchAll(/^\s*([a-z0-9-]+):profile\(/gm)].map(x=>x[1]));
const seeded=[...platforms.matchAll(/\{id:'([a-z0-9-]+)',name:'([^']+)',company:'([^']+)'/g)].map(x=>({id:x[1],name:x[2],company:x[3],category:'现有平台',website:'',description:'',capabilities:[]}));
const merged=new Map(seeded.map(x=>[x.id,x]));
for(const row of catalog.filter(validCatalogEntry))merged.set(row.id,row);
const queue=[...merged.values()].filter(x=>!curated.has(x.id)).map(p=>({
 productId:p.id,name:p.name,company:p.company,category:p.category,officialCandidate:p.website||null,
 editorialState:'needs_official_capability_sources',
 labelsOnly:(p.capabilities||[]).slice(0,8),
 requiredFields:['function_name','specific_output','example_use_case','practical_limit','official_source_url','reviewed_at'],
 sourceStatus:'catalogue_only_not_a_verified_function',
 cannotPublishWithoutReview:true
})).sort((a,b)=>a.productId.localeCompare(b.productId));
const result={schema:'ai_market_capability_review_queue_v1',source:'reviewed_catalogue_seed',
 totalProducts:merged.size,curatedProfiles:curated.size,pending:queue.length,
 rankingVerified:false,autoPublish:false,items:queue};
const out=path.join(root,'reports/capability-review-queue.json');
await mkdir(path.dirname(out),{recursive:true});
await writeFile(out,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:'CANDIDATES_ONLY',totalProducts:result.totalProducts,
 curatedProfiles:curated.size,pending:queue.length,report:out,autoPublish:false}));
