import {normalizeInput} from '../../lib/ai-market-data-center.mjs';
export function hfToIdentity(raw,kind,observedAt){
 if(!['model','product'].includes(kind)||typeof raw?.id!=='string'||!/^[\w.-]+\/[\w.-]+$/.test(raw.id))return null;
 if(raw.private===true)return null;
 const path=kind==='product'?'spaces/':'';
 const url='https://huggingface.co/'+path+raw.id.split('/').map(encodeURIComponent).join('/');
 return normalizeInput({type:kind,source:'huggingface',upstreamId:(kind==='product'?'spaces/':'models/')+raw.id,name:raw.id.split('/')[1],
  sourceUrl:url,observedAt,metadata:{publisher:raw.id.split('/')[0],hubDownloads:Number.isSafeInteger(raw.downloads)?raw.downloads:null,
    hubLikes:Number.isSafeInteger(raw.likes)?raw.likes:null,upstreamModified:raw.lastModified||null}});
}
export function openAlexInstitution(raw,observedAt){
 if(typeof raw?.id!=='string'||!/^https:\/\/openalex.org\/I\d+$/.test(raw.id)||typeof raw.display_name!=='string')return null;
 return normalizeInput({type:'company',source:'openalex',upstreamId:raw.id.slice('https://openalex.org/'.length),name:raw.display_name,
  sourceUrl:raw.id,observedAt,metadata:{sourceCategory:'academic_institution',countryCode:raw.country_code||null}});
}
export async function fetchOpenAlexInstitutions({apiKey,limit=20,fetcher=fetch,signal}={}){
 if(!Number.isInteger(limit)||limit<1||limit>100)throw Error('INVALID_LIMIT');
 const url=new URL('https://api.openalex.org/institutions');url.searchParams.set('per_page',String(limit));url.searchParams.set('page','1');
 if(apiKey)url.searchParams.set('api_key',apiKey);
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
 const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
 try{const response=await fetcher(url,{signal:controller.signal,headers:{accept:'application/json'}});
  if(!response.ok)throw Error('OPENALEX_UPSTREAM_'+response.status);
  const body=await response.json();
  if(!Array.isArray(body?.results))throw Error('INVALID_OPENALEX_RESPONSE');
  const observedAt=new Date().toISOString();
  return {source:'openalex',observedAt,candidates:body.results.map(x=>openAlexInstitution(x,observedAt)).filter(Boolean),publicationApproved:false,
   note:'Academic organizations only; never infer business funding or corporate ownership'};
 }finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
}
