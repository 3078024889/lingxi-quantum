import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
type Offer={id:string;providerId:string;providerName:string;inputUsdPerMillion:number|null;outputUsdPerMillion:number|null;contextLimit:number|null;sourceUrl:string};
type Group={modelId:string;name:string;offers:Offer[];providerCount:number;lowestObservedInputUsdPerMillion:number|null};
export async function GET(request:Request){
 const sp=new URL(request.url).searchParams;
 const q=(sp.get('q')||'').trim().toLowerCase().slice(0,120);
 const sort=sp.get('sort')==='price'?'price':'providers';
 const limit=Math.floor(Math.min(30,Math.max(1,Number(sp.get('limit'))||20)));
 const cursor=Math.floor(Math.min(100000,Math.max(0,Number(sp.get('cursor'))||0)));
 try{
  const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
  const data=JSON.parse(await readFile(resolve(dir,'model-offer-groups.json'),'utf8')) as {source:string;sourceCollectedAt:string;groups:Group[];grouping:string};
  if(data.source!=='models.dev'||!Array.isArray(data.groups))throw Error('INVALID_SOURCE');
  const matched=data.groups.filter(x=>!q||x.name.toLowerCase().includes(q)||x.modelId.toLowerCase().includes(q));
  if(sort==='price')matched.sort((a,b)=>(a.lowestObservedInputUsdPerMillion??Infinity)-(b.lowestObservedInputUsdPerMillion??Infinity)||a.modelId.localeCompare(b.modelId));
  const items=matched.slice(cursor,cursor+limit).map(x=>({modelId:x.modelId,name:x.name,providerCount:x.providerCount,lowestObservedInputUsdPerMillion:x.lowestObservedInputUsdPerMillion,offers:x.offers.slice(0,100)}));
  return NextResponse.json({total:matched.length,sort,limit,cursor,nextCursor:cursor+items.length<matched.length?cursor+items.length:null,items,source:'models.dev',sourceCollectedAt:data.sourceCollectedAt,grouping:data.grouping,notice:'Exact model IDs only. Aggregated provider pricing is not independently publisher-verified.'},{headers:{'Cache-Control':'no-store'}});
 }catch{
  // Public aggregator fallback for deployed environments without local bulk snapshots.
  // Cache upstream for one hour. This does not claim publisher-verified model pricing.
  try{
   const response=await fetch('https://models.dev/api.json',{next:{revalidate:3600},signal:AbortSignal.timeout(15000),headers:{Accept:'application/json'}});
   if(!response.ok)throw Error('AGGREGATOR_UNAVAILABLE');
   const length=Number(response.headers.get('content-length')||0);
   if(length>26000000)throw Error('SOURCE_TOO_LARGE');
   const raw=await response.text();
   if(raw.length>26000000)throw Error('SOURCE_TOO_LARGE');
   const providers=JSON.parse(raw) as Record<string,{name?:string;models?:Record<string,{name?:string;cost?:{input?:number;output?:number};limit?:{context?:number}}>;}>;
   if(!providers||typeof providers!=='object'||Array.isArray(providers))throw Error('INVALID_SOURCE');
   const map=new Map<string,{modelId:string;name:string;offers:Offer[]}>();
   let count=0;
   for(const [providerId,provider] of Object.entries(providers)){
    if(!provider||typeof provider!=='object'||!provider.models||typeof provider.models!=='object')continue;
    for(const [modelId,model] of Object.entries(provider.models)){
     if(++count>50000)throw Error('SOURCE_TOO_MANY_OFFERS');
     if(!model||typeof model!=='object'||!modelId||modelId.length>180)continue;
     const key=modelId.trim().toLowerCase();
     if(!key)continue;
     let group=map.get(key);
     if(!group){group={modelId,name:model.name||modelId,offers:[]};map.set(key,group);}
     if(group.offers.length>=100)continue;
     const price=(x:unknown)=>typeof x==='number'&&Number.isFinite(x)&&x>=0?x:null;
     const context=(x:unknown)=>Number.isSafeInteger(x)&&Number(x)>=0?Number(x):null;
     group.offers.push({id:providerId+':'+modelId,providerId,providerName:provider.name||providerId,
      inputUsdPerMillion:price(model.cost?.input),outputUsdPerMillion:price(model.cost?.output),
      contextLimit:context(model.limit?.context),sourceUrl:'https://models.dev/'});
    }
   }
   const groups:Group[]=[...map.values()].map(x=>{
    const prices=x.offers.map(o=>o.inputUsdPerMillion).filter((p):p is number=>p!==null);
    return {...x,providerCount:x.offers.length,lowestObservedInputUsdPerMillion:prices.length?Math.min(...prices):null};
   }).filter(x=>!q||x.name.toLowerCase().includes(q)||x.modelId.toLowerCase().includes(q));
   groups.sort(sort==='price'?(a,b)=>(a.lowestObservedInputUsdPerMillion??Infinity)-(b.lowestObservedInputUsdPerMillion??Infinity)||a.modelId.localeCompare(b.modelId):
    (a,b)=>b.providerCount-a.providerCount||a.modelId.localeCompare(b.modelId));
   const items=groups.slice(cursor,cursor+limit);
   return NextResponse.json({total:groups.length,items,sort,limit,cursor,
    nextCursor:cursor+items.length<groups.length?cursor+items.length:null,
    source:'models.dev',sourceCollectedAt:new Date().toISOString(),sourceMode:'public_aggregator_live',
    grouping:'exact_case_insensitive_model_id_only',notice:'Prices are models.dev aggregator observations, not independent vendor verification.'},
    {headers:{'Cache-Control':'public, s-maxage=900, stale-while-revalidate=1800'}});
  }catch{
   return NextResponse.json({status:'SOURCE_TEMPORARILY_UNAVAILABLE',total:0,items:[]},{status:503,headers:{'Cache-Control':'public,s-maxage=60'}});
  }
 }
}
