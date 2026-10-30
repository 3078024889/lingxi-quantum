// Existing catalog only. Quantifies real fact coverage without equating snapshots to live verification.
// No external requests, no database writes, no additional products.
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(await readFile(resolve(root,'data/catalog.json'),'utf8'));
const source=await readFile(resolve(root,'lib/reviewed-product-facts.ts'),'utf8');
const snapshotProducts=[...source.matchAll(/\{product:\s*"([^"]+)",observedAt:/g)].map(x=>x[1]);
const facts=new Set(snapshotProducts);
const fields=['purpose','free','price','region','watermark','commercial','failure','refund','phone','card','models'];
const today=new Date().toISOString().slice(0,10);
const records=catalog.map(x=>({
 id:x.id,name:x.name,category:x.category,homepage:x.website,
 hasAnyDatedReviewedSnapshot:facts.has(x.id),
 checkedFactCoverage:'NOT_YET_MEASURED_PER_FIELD',
 missingPriority:facts.has(x.id)?'VERIFY_FIELDS_AND_FRESHNESS':'RESEARCH_OFFICIAL_SOURCE_FIRST',
 commercialFields:fields,
 note:'A stored source citation is not proof of current availability or unchanged plans.'
}));
const summary={schema:'lingxifield_existing_verified_data_coverage_v1',generatedAt:today,existingCatalogProducts:records.length,
 snapshotPresent:records.filter(x=>x.hasAnyDatedReviewedSnapshot).length,
 noSnapshot:records.filter(x=>!x.hasAnyDatedReviewedSnapshot).length,
 snapshotPresencePercent:records.length?Math.round(records.filter(x=>x.hasAnyDatedReviewedSnapshot).length*10000/records.length)/100:0,
 fieldLevelCoverage:'UNKNOWN_NOT_FULLY_AUDITED',rankingEvidenceCoverage:'NOT_PROVEN',
 warning:'This inventory is the curated catalog only; seeded commercial platforms may be outside data/catalog.json.'};
const dir=resolve(root,'reports/existing-product-gate');await mkdir(dir,{recursive:true});
const file=resolve(dir,'reviewed-coverage-summary.json');await writeFile(file,JSON.stringify({summary,records},null,2)+'\n');
console.log(JSON.stringify({...summary,file},null,2));
