import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const sp=new URL(req.url).searchParams;
 const query=(sp.get('q')||'').trim().slice(0,120),provider=(sp.get('provider')||'').trim().slice(0,80);
 const limit=Math.max(1,Math.min(50,Number(sp.get('limit'))||20)),cursor=Math.max(0,Math.min(100000,Number(sp.get('cursor'))||0));
 const upstream=new URL('https://models.dev/api.json');
 try{
  const r=await fetch(upstream,{signal:AbortSignal.timeout(15000),next:{revalidate:3600}});
  if(!r.ok)return NextResponse.json({error:'UPSTREAM_UNAVAILABLE',status:r.status,items:[],source:upstream.href},{status:503});
  const providers=await r.json() as Record<string,{name?:string;models?:Record<string,{name?:string;cost?:{input?:number;output?:number};limit?:{context?:number;output?:number}}>;}>;
  const results: Array<{id:string;provider:string;name:string;inputPrice:number|null;outputPrice:number|null;context:number|null;maxOutput:number|null}>=[];let total=0;
  for(const [pid,p] of Object.entries(providers)){
   if(provider&&pid.toLowerCase()!==provider.toLowerCase())continue;
   for(const [mid,m] of Object.entries(p.models||{})){
    const name=m?.name||mid;
    if(query&&![name,mid,p.name||pid,pid].some(x=>x.toLowerCase().includes(query.toLowerCase())))continue;
    if(total>=cursor&&results.length<limit)results.push({id:pid+'/'+mid,provider:p.name||pid,name,inputPrice:Number.isFinite(m?.cost?.input)?m.cost!.input!:null,outputPrice:Number.isFinite(m?.cost?.output)?m.cost!.output!:null,context:Number.isFinite(m?.limit?.context)?m.limit!.context!:null,maxOutput:Number.isFinite(m?.limit?.output)?m.limit!.output!:null});
    total++;
   }
  }
  return NextResponse.json({total,cursor,limit,nextCursor:cursor+results.length<total?cursor+results.length:null,items:results,source:upstream.href,verification:'third_party_aggregated_unverified_against_provider',priceUnit:'USD per 1 million tokens, subject to source verification'},{headers:{'Cache-Control':'public, s-maxage=900'}});
 }catch{return NextResponse.json({error:'SOURCE_UNAVAILABLE',items:[],total:0,source:upstream.href},{status:503});}
}
