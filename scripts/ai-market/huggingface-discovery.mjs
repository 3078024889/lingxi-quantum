// Candidate discovery only. This does not publish, verify or rank models.
// HF API: https://huggingface.co/docs/hub/en/api
const BASE = 'https://huggingface.co/api';
const COLLECTIONS = new Set(['models','spaces']);
export function normalizeHubItem(item, collection, observedAt) {
  if (!item || typeof item.id !== 'string' || item.id.length > 300 ||
      !/^[\w.-]+\/[\w.-]+$/.test(item.id)) return null;
  const id=item.id;
  const url='https://huggingface.co/' + (collection==='spaces'?'spaces/':'') + id.split('/').map(encodeURIComponent).join('/');
  return {
    candidateKey: 'hf:' + collection + ':' + id,
    source: 'huggingface_hub',
    sourceUrl: url,
    kind: collection==='models'?'model_repository':'space_repository',
    name: id.split('/').at(-1),
    publisher: id.split('/')[0],
    upstreamId: id,
    observedAt,
    status: 'candidate',
    visibility: item.private===true?'private':'public',
    tags: Array.isArray(item.tags)?item.tags.filter(x=>typeof x==='string').slice(0,30):[],
    upstreamUpdatedAt: typeof item.lastModified==='string'?item.lastModified:null,
    license:typeof item.cardData?.license==='string'?item.cardData.license:null,
  };
}
export async function discoverHuggingFace({collection='models', limit=25, token, fetcher=fetch, signal}={}) {
 if(!COLLECTIONS.has(collection))throw new Error('INVALID_COLLECTION');
 if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('INVALID_LIMIT');
 const u=new URL(BASE+'/'+collection);
 u.searchParams.set('limit',String(limit));
 u.searchParams.set('sort','lastModified');
 u.searchParams.set('direction','-1');
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),10000);
 const onAbort=()=>controller.abort();
 signal?.addEventListener('abort',onAbort,{once:true});
 try {
   const headers={'Accept':'application/json','User-Agent':'LINGXIFIELD-Candidate-Discovery/1.0'};
   if(token) headers.Authorization='Bearer '+token;
   const res=await fetcher(u,{headers,signal:controller.signal});
   if(!res.ok)throw new Error('HUB_UPSTREAM_'+res.status);
   const data=await res.json();
   if(!Array.isArray(data))throw new Error('INVALID_HUB_RESPONSE');
   const observedAt=new Date().toISOString();
   return {
     source:'huggingface_hub',
     retrievedAt:observedAt,
     count:data.length,
     candidates:data.map(x=>normalizeHubItem(x,collection,observedAt)).filter(Boolean),
     publicationApproved:false,
     note:'Candidate discovery only; not verified product count or popularity ranking',
   };
 } finally {
   clearTimeout(timeout);
   signal?.removeEventListener('abort',onAbort);
 }
}
