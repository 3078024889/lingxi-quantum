// Curated view over a full immutable models.dev index; do not delete source data.
// Inclusion rules are transparent and reproducible. No invented popularity score.
import{readFile,mkdir,writeFile,rename}from'node:fs/promises';
import{resolve}from'node:path';
import{createHash}from'node:crypto';
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const data=JSON.parse(await readFile(resolve(dir,'models-index.json'),'utf8'));
if(!Array.isArray(data.records)||data.source!=='models.dev')throw Error('INVALID_MODEL_INDEX');
const now=Date.now(),latest=Date.parse(data.sourceCollectedAt);
if(!Number.isFinite(latest))throw Error('MISSING_SOURCE_TIMESTAMP');
const archivedPattern=/(^|[-_ /])(deprecated|retired|discontinued|legacy|testonly|dummy|placeholder|preview-old)([-_ /]|$)/i;
const kept=[],excluded=[],counts={};
for(const model of data.records){
 const reason=archivedPattern.test(model.name+' '+model.modelId)?'named_legacy_or_placeholder':
   (!model.name||!model.providerId)?'missing_identity':
   (model.inputUsdPerMillion===null&&model.outputUsdPerMillion===null&&model.contextLimit===null&&model.outputLimit===null)?'no_comparable_specification':null;
 if(reason){excluded.push({id:model.id,reason});counts[reason]=(counts[reason]||0)+1;continue;}
 kept.push(model);
}
// Models with insufficient evidence remain retrievable in the complete index; never silently destroy data.
const report={source:data.source,sourceUrl:data.sourceUrl,sourceCollectedAt:data.sourceCollectedAt,
 policy:'curation_v1_no_popularity_inference',generatedAt:new Date().toISOString(),
 sourceAgeHours:Math.round((now-latest)/3600000*10)/10,originalCount:data.records.length,selectedCount:kept.length,
 excludedCount:excluded.length,reasons:counts,records:kept,excluded};
await mkdir(dir,{recursive:true});
const dest=resolve(dir,'models-curated.json'),body=JSON.stringify(report)+'\n';
await writeFile(dest+'.tmp',body);await rename(dest+'.tmp',dest);
const digest=createHash('sha256').update(body).digest('hex');
await writeFile(dest+'.sha256',digest+'  models-curated.json\n');
console.log(JSON.stringify({selected:kept.length,total:data.records.length,excluded:excluded.length,reasons:counts,file:dest,sha256:digest}));
