// Merge local curated product candidates with public Spaces into one source-attributed catalog.
// Never infer traffic, pricing, availability, SEO or commercial terms from project metadata.
import {readFile,writeFile,rename,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||resolve(root,'reports','source-pipeline'));
const entries=[],seen=new Set(),sources={};
const normalizeUrl=value=>{try{const u=new URL(value);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return null;u.hash='';return u.href}catch{return null}};
function add(v){if(!v.url)return;const key=v.url.toLowerCase().replace(/\/$/,'');if(seen.has(key))return;seen.add(key);entries.push(v)}
const catalog=JSON.parse(await readFile(resolve(root,'data','catalog.json'),'utf8'));
if(!Array.isArray(catalog))throw Error('INVALID_LOCAL_CATALOG');
for(const c of catalog){
 const url=normalizeUrl(c.website);if(!url)continue;
 add({id:'catalog:'+c.id,name:c.name,company:c.company||null,category:c.category||null,
  url,description:c.description||null,capabilities:Array.isArray(c.capabilities)?c.capabilities:[],
  price:null,freeQuota:null,requiresCard:null,chinaAvailability:null,license:null,
  downloadUrl:null,usageMetric:null,seoRank:null,geoRank:null,
  evidence:{kind:'local_unverified_candidate',url,observedAt:c.updatedAt||null},reviewStatus:'candidate_unverified'});
}
sources.localCatalog={candidates:catalog.length,accepted:entries.length};
let spaces;
try{spaces=JSON.parse(await readFile(resolve(dir,'hf-spaces-curated.json'),'utf8'))}catch{
 try{spaces=JSON.parse(await readFile(resolve(dir,'hf-spaces-catalog.json'),'utf8'))}catch{}
}
if(spaces?.source==='huggingface_spaces'&&Array.isArray(spaces.records)){
 let count=0;for(const s of spaces.records){const url=normalizeUrl(s.url);if(!url)continue;
  const old=entries.length;
  add({id:'hf:'+s.id,name:s.name,company:null,creator:s.provider||null,category:null,
   url,description:s.description||null,capabilities:Array.isArray(s.categories)?s.categories:[],
   price:null,freeQuota:null,requiresCard:null,chinaAvailability:null,license:null,
   downloadUrl:null,usageMetric:null,seoRank:null,geoRank:null,
   evidence:{kind:'huggingface_public_space',url,observedAt:s.collectedAt||spaces.sourceCollectedAt||spaces.collectedAt||null},
   hfLikes:typeof s.likes==='number'?s.likes:null,reviewStatus:'candidate_unverified'});
  if(entries.length>old)count++;
 }
 sources.huggingfaceSpaces={accepted:count};
}else{sources.huggingfaceSpaces={status:'not_collected'}}
entries.sort((a,b)=>a.name.localeCompare(b.name)||a.id.localeCompare(b.id));
const report={schema:'lingxifield_product_candidates_v1',generatedAt:new Date().toISOString(),total:entries.length,
 notice:'Candidate inventory only. Commercial prices, real usage, download counts, geo visibility, and country access not verified.',
 sources,products:entries};
await mkdir(dir,{recursive:true});
const dest=resolve(dir,'products-unified.json'),body=JSON.stringify(report)+'\n';
await writeFile(dest+'.tmp',body);await rename(dest+'.tmp',dest);
const sha256=createHash('sha256').update(body).digest('hex');
await writeFile(dest+'.sha256',sha256+'  products-unified.json\n');
console.log(JSON.stringify({file:dest,total:entries.length,sources,sha256}));
