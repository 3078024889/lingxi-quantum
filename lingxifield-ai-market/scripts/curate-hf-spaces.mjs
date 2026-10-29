// Transparent app candidate selection: keep raw metadata intact and identify useful, active demo projects.
// Likes are only a within-Hugging-Face signal, NOT global market share, visits or quality.
import {readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const source=JSON.parse(await readFile(resolve(dir,'hf-spaces-catalog.json'),'utf8'));
if(source.source!=='huggingface_spaces'||!Array.isArray(source.records))throw Error('INVALID_HF_SNAPSHOT');
const now=Date.now(),byId=new Map(),excluded=[],reasons={};
for(const x of source.records){
 const id=typeof x.id==='string'?x.id.trim():'';
 let reason=!id||!/^[-\w.]+\/[-\w.]+$/.test(id)?'invalid_project_id':null;
 if(!reason&&byId.has(id.toLowerCase()))reason='duplicate_id';
 if(!reason&&x.url!=='https://huggingface.co/spaces/'+id.split('/').map(encodeURIComponent).join('/'))reason='invalid_project_link';
 const last=Date.parse(x.lastModified||'');
 if(!reason&&Number.isFinite(last)&&now-last>365*86400000)reason='not_updated_within_one_year';
 if(!reason&&(!x.name||/^[-_.\s]*$/.test(x.name)))reason='missing_title';
 if(reason){excluded.push({id,reason});reasons[reason]=(reasons[reason]||0)+1;continue}
 byId.set(id.toLowerCase(),x);
}
const records=[...byId.values()].sort((a,b)=>(b.likes??-1)-(a.likes??-1)||a.id.localeCompare(b.id));
const report={source:'huggingface_spaces',sourceCollectedAt:source.collectedAt,policy:'active_public_app_candidate_v1',
 notice:'This is a discoverability shortlist, not verified uptime, popularity, or commercial pricing.',originalCount:source.records.length,
 selectedCount:records.length,excludedCount:excluded.length,reasons,records,excluded};
const dest=resolve(dir,'hf-spaces-curated.json'),body=JSON.stringify(report)+'\n';
await writeFile(dest+'.tmp',body);await rename(dest+'.tmp',dest);
const sha256=createHash('sha256').update(body).digest('hex');await writeFile(dest+'.sha256',sha256+'  hf-spaces-curated.json\n');
console.log(JSON.stringify({file:dest,selected:records.length,excluded:excluded.length,reasons,sha256}));
