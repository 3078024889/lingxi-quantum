// Live, read-only public discovery from the official Hugging Face Hub API.
// This is a repository discovery feed, not an independent product ranking.
const VALID=new Set(['models','spaces']);
export function normalizeLiveHub(items,kind){
 if(!Array.isArray(items)||!VALID.has(kind))throw Error('INVALID_HUB_PAYLOAD');
 return items.slice(0,30).flatMap(x=>{
  if(!x||typeof x.id!=='string'||!/^[\w.-]+\/[\w.-]+$/.test(x.id)||x.private===true)return [];
  const [publisher,name]=x.id.split('/');
  return [{id:x.id,name,publisher,kind:kind==='models'?'模型仓库':'应用仓库',
    officialUrl:'https://huggingface.co/'+(kind==='spaces'?'spaces/':'')+encodeURIComponent(publisher)+'/'+encodeURIComponent(name),
    updatedAt:typeof x.lastModified==='string'?x.lastModified:null,verification:'public_repository_not_verified_product'}];
 });
}
export async function getLiveHub(kind='models',{fetcher=fetch,signal}={}){
 if(!VALID.has(kind))throw Error('INVALID_KIND');
 const url=new URL('https://huggingface.co/api/'+kind);
 url.searchParams.set('sort','lastModified');url.searchParams.set('direction','-1');url.searchParams.set('limit','12');
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),7000);
 const abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
 try{
  const response=await fetcher(url,{headers:{accept:'application/json','User-Agent':'LINGXIFIELD-Public-Discovery/1.0'},signal:controller.signal,cache:'no-store'});
  if(!response.ok)throw Error('UPSTREAM_'+response.status);
  const items=await response.json();
  return {source:'Hugging Face official Hub API',sourceUrl:'https://huggingface.co/docs/hub/api',
   retrievedAt:new Date().toISOString(),kind,records:normalizeLiveHub(items,kind),isRanking:false,
   note:'Public repository updates. Not verified products, unique users, or adoption rankings.'};
 }finally{clearTimeout(timeout);signal?.removeEventListener('abort',abort);}
}
