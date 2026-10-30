import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
type Product={id:string;name:string;company?:string|null;category?:string|null;url:string;description:string|null;capabilities:string[];price:number|null;freeQuota:string|null;usageMetric:null;reviewStatus:string;evidence:{kind:string;url:string;observedAt:string|null}};
export async function GET(request:Request){
 const sp=new URL(request.url).searchParams,q=(sp.get('q')||'').toLowerCase().trim().slice(0,120);
 const limit=Math.max(1,Math.min(40,Math.trunc(Number(sp.get('limit'))||20)));
 const cursor=Math.max(0,Math.min(100000,Math.trunc(Number(sp.get('cursor'))||0)));
 try{
  const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/source-pipeline');
  const data=JSON.parse(await readFile(resolve(dir,'products-unified.json'),'utf8')) as {schema:string;generatedAt:string;products:Product[]};
  if(data.schema!=='lingxifield_product_candidates_v1'||!Array.isArray(data.products))throw Error('INVALID_PRODUCTS');
  const filtered=data.products.filter(p=>!q||[p.name,p.company||'',p.category||'',p.description||'',...(p.capabilities||[])].some(s=>s.toLowerCase().includes(q)));
  const items=filtered.slice(cursor,cursor+limit);
  return NextResponse.json({total:filtered.length,items,cursor,limit,nextCursor:cursor+items.length<filtered.length?cursor+items.length:null,
   updatedAt:data.generatedAt,disclosure:'Unverified candidate products; prices, usage, free quotas, company status and SEO/GEO ranking require independent sources.'},{headers:{'Cache-Control':'no-store'}});
 }catch{
  // Hugging Face's public Spaces index is a candidate application directory, not vetted products.
  try{
   const endpoint=new URL('https://huggingface.co/api/spaces');
   endpoint.searchParams.set('sort','likes');endpoint.searchParams.set('direction','-1');
   endpoint.searchParams.set('limit','100');
   if(q)endpoint.searchParams.set('search',q);
   const response=await fetch(endpoint.toString(),{next:{revalidate:1800},signal:AbortSignal.timeout(12000),headers:{Accept:'application/json'}});
   if(!response.ok)throw Error('HUB_SOURCE_UNAVAILABLE');
   const contentLength=Number(response.headers.get('content-length')||0);
   if(contentLength>4000000)throw Error('HUB_SOURCE_TOO_LARGE');
   const raw=await response.text();if(raw.length>4000000)throw Error('HUB_SOURCE_TOO_LARGE');
   const result=JSON.parse(raw) as unknown;
   if(!Array.isArray(result))throw Error('HUB_SOURCE_INVALID');
   const items:Product[]=result.filter(x=>x!==null&&typeof x==='object')
    .filter(x=>typeof x.id==='string'&&/^[a-zA-Z0-9_.-]+[/][a-zA-Z0-9_.-]+$/.test(x.id)&&x.private!==true)
    .map(x=>({id:'hf-space:'+x.id,name:x.id.split('/')[1],company:x.id.split('/')[0],
      category:'公开AI应用',url:'https://huggingface.co/spaces/'+x.id,
      description:typeof x.cardData?.short_description==='string'?x.cardData.short_description.slice(0,200):null,
      capabilities:Array.isArray(x.tags)?x.tags.filter((t:unknown)=>typeof t==='string').slice(0,6):[],
      price:null,freeQuota:null,usageMetric:null,reviewStatus:'candidate',
      evidence:{kind:'huggingface_public_space',url:'https://huggingface.co/spaces/'+x.id,observedAt:typeof x.lastModified==='string'?x.lastModified:null}
    }));
   const page=items.slice(cursor,cursor+limit);
   return NextResponse.json({total:items.length,items:page,limit,cursor,
    nextCursor:cursor+page.length<items.length?cursor+page.length:null,
    source:'Hugging Face Spaces public API',partialCatalog:true,updatedAt:new Date().toISOString(),
    disclosure:'Public Hugging Face Spaces candidates only; commercial pricing, global traffic and quality are not verified.'},
    {headers:{'Cache-Control':'public, s-maxage=600, stale-while-revalidate=1200'}});
  }catch{
   return NextResponse.json({status:'SOURCE_TEMPORARILY_UNAVAILABLE',total:0,items:[]},{status:503,headers:{'Cache-Control':'public,s-maxage=60'}});
  }
 }
}
