// Broad, bounded public Hub discovery across task facets. No auth, scraping or DB writes.
// Run manually: node scripts/collect-hf-faceted-bulk.mjs
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/source-pipeline');
const facets=[
 {type:'spaces',name:'popular',q:{sort:'likes',direction:'-1'}},
 {type:'spaces',name:'recent',q:{sort:'lastModified',direction:'-1'}},
 ...['text-to-image','text-to-video','image-to-video','text-to-speech','automatic-speech-recognition','image-text-to-text','text-generation','text2text-generation'].map(x=>({type:'models',name:x,q:{pipeline_tag:x,sort:'downloads',direction:'-1'}})),
 {type:'models',name:'popular',q:{sort:'downloads',direction:'-1'}},
 {type:'models',name:'recent',q:{sort:'lastModified',direction:'-1'}}
];
const perFacet=Math.min(1000,Math.max(20,Number(process.env.HF_FACET_LIMIT)||350));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const stamp=new Date().toISOString(),byType={spaces:new Map(),models:new Map()},stats=[];
const safeDate=x=>typeof x==='string'?x:null;
const nonnegative=x=>Number.isSafeInteger(x)&&x>=0?x:null;
for(const facet of facets){
 const url=new URL('https://huggingface.co/api/'+facet.type);
 for(const [k,v] of Object.entries({...facet.q,limit:String(perFacet)}))url.searchParams.set(k,v);
 let input,err=null;
 for(let n=0;n<3;n++){
  try{
   const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'LINGXIFIELD-Public-Inventory-Research'},signal:AbortSignal.timeout(30000)});
   if(response.status===429||response.status>=500){
    err='HTTP_'+response.status;if(n<2){await sleep((n+1)*2500);continue}break;
   }
   if(!response.ok){err='HTTP_'+response.status;break}
   const raw=await response.text();if(raw.length>20_000_000){err='RESPONSE_TOO_LARGE';break}
   input=JSON.parse(raw);if(!Array.isArray(input)){err='SCHEMA_NOT_ARRAY';input=null}
   break;
  }catch(e){err=String(e).slice(0,130);if(n<2)await sleep((n+1)*2500)}
 }
 let accepted=0;
 for(const x of input||[]){
  if(!x||typeof x.id!=='string'||x.private||x.disabled)continue;
  const parts=x.id.split('/');if(parts.length!==2||parts.some(s=>!s||s==='..'))continue;
  const url='https://huggingface.co/'+(facet.type==='spaces'?'spaces/':'')+parts.map(encodeURIComponent).join('/');
  const record={id:x.id,name:typeof x.cardData?.title==='string'?x.cardData.title:parts[1],provider:x.author||parts[0],url,
   description:typeof x.cardData?.short_description==='string'?x.cardData.short_description.slice(0,500):null,
   categories:Array.isArray(x.tags)?x.tags.filter(t=>typeof t==='string').slice(0,40):[],
   task:x.pipeline_tag||null,likes:nonnegative(x.likes),downloadsOnHub:facet.type==='models'?nonnegative(x.downloads):null,
   lastModified:safeDate(x.lastModified),sdk:x.sdk||null,sourceCollectedAt:stamp,
   source:'huggingface_public_'+facet.type,sourceFacets:[facet.name],
   price:null,freeQuota:null,chinaAvailability:null,seoRank:null,geoRank:null,verification:'HUB_METADATA_ONLY'};
  const old=byType[facet.type].get(x.id);
  if(old){old.sourceFacets.push(facet.name);continue}
  byType[facet.type].set(x.id,record);accepted++;
 }
 stats.push({type:facet.type,facet:facet.name,received:input?.length??0,uniqueAdded:accepted,status:input?'ok':'failed',error:err});
 await sleep(800);
}
await mkdir(dir,{recursive:true});
const outcome={schema:'lingxifield_hf_faceted_v1',collectedAt:stamp,scope:'Hugging Face public repositories only, not verified commercial products',
 spaces:{count:byType.spaces.size,records:[...byType.spaces.values()].sort((a,b)=>a.id.localeCompare(b.id))},
 models:{count:byType.models.size,records:[...byType.models.values()].sort((a,b)=>a.id.localeCompare(b.id))},
 stats,partial:stats.some(x=>x.status!=='ok')};
if(!outcome.spaces.count&&!outcome.models.count)throw Error('NO_SOURCE_RESPONSES_KEEP_PRIOR_SNAPSHOT');
const body=JSON.stringify(outcome)+'\n',p=resolve(dir,'hf-faceted-bulk.json');
await writeFile(p+'.tmp',body);await rename(p+'.tmp',p);
await writeFile(p+'.sha256',createHash('sha256').update(body).digest('hex')+'  hf-faceted-bulk.json\n');
console.log(JSON.stringify({file:p,spaces:outcome.spaces.count,models:outcome.models.count,partial:outcome.partial,stats},null,2));
