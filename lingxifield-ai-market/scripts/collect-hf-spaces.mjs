// Bulk public Hugging Face Spaces discovery; not a ranking of overall AI product usage.
// Bounded pages and timeouts; no scraping, credentials, or made-up pricing.
import {mkdir,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const out=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
const limit=Number.isFinite(Number(process.env.HF_SPACES_LIMIT))?Math.max(20,Math.min(1000,Math.trunc(Number(process.env.HF_SPACES_LIMIT)))):500;
const endpoint=new URL('https://huggingface.co/api/spaces');
endpoint.searchParams.set('sort','likes');endpoint.searchParams.set('direction','-1');endpoint.searchParams.set('limit',String(limit));endpoint.searchParams.set('full','false');
const response=await fetch(endpoint,{signal:AbortSignal.timeout(25000),headers:{Accept:'application/json','User-Agent':'LINGXIFIELD-AI-Market-Catalog'}});
if(!response.ok)throw Error('HF_SPACES_HTTP_'+response.status);
const input=await response.json();
if(!Array.isArray(input))throw Error('HF_SPACES_INVALID_RESPONSE');
const fetchedAt=new Date().toISOString(),seen=new Set();
const records=input.filter(x=>x&&typeof x.id==='string'&&!x.private&&!x.disabled).flatMap(x=>{
 if(seen.has(x.id))return [];seen.add(x.id);
 const tags=Array.isArray(x.tags)?x.tags.filter(y=>typeof y==='string').slice(0,30):[];
 const n=x=>Number.isSafeInteger(x)&&x>=0?x:null;
 return [{id:x.id,name:x.cardData?.title||x.id.split('/').at(-1),provider:x.author||x.id.split('/')[0],
   url:'https://huggingface.co/spaces/'+x.id.split('/').map(encodeURIComponent).join('/'),
   description:typeof x.cardData?.short_description==='string'?x.cardData.short_description.slice(0,500):null,
   categories:tags,likes:n(x.likes),sdk:x.sdk||null,lastModified:x.lastModified||null,
   pricing:null,freeQuota:null,officialCompany:null,chinaAvailability:null,commercialRights:null,
   source:'huggingface_public_space',sourceApi:endpoint.origin+endpoint.pathname,collectedAt:fetchedAt,
   verification:'public_repository_metadata_not_usage_or_quality'}];
});
await mkdir(out,{recursive:true});
const body=JSON.stringify({source:'huggingface_spaces',sourceUrl:endpoint.toString(),collectedAt:fetchedAt,
 count:records.length,scope:'Hugging Face hosted app demos, not a census of all commercial AI tools',
 records},null,2)+'\n';
const file=resolve(out,'hf-spaces-catalog.json');await writeFile(file+'.tmp',body);await rename(file+'.tmp',file);
const hash=createHash('sha256').update(body).digest('hex');await writeFile(file+'.sha256',hash+'  hf-spaces-catalog.json\n');
console.log(JSON.stringify({source:'huggingface_spaces',file,count:records.length,sha256:hash}));
