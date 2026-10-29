import {NextResponse} from 'next/server';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
export const dynamic='force-dynamic';
type Offer={id:string;providerId:string;providerName:string;inputUsdPerMillion:number|null;outputUsdPerMillion:number|null;contextLimit:number|null;sourceUrl:string};
type Group={modelId:string;name:string;offers:Offer[];providerCount:number;lowestObservedInputUsdPerMillion:number|null};
export async function GET(request:Request){
 const sp=new URL(request.url).searchParams;
 const q=(sp.get('q')||'').trim().toLowerCase().slice(0,120);
 const limit=Math.floor(Math.min(30,Math.max(1,Number(sp.get('limit'))||20)));
 const cursor=Math.floor(Math.min(100000,Math.max(0,Number(sp.get('cursor'))||0)));
 try{
  const dir=resolve(process.env.AI_MARKET_SNAPSHOT_DIR||'./reports/model-bulk');
  const data=JSON.parse(await readFile(resolve(dir,'model-offer-groups.json'),'utf8')) as {source:string;sourceCollectedAt:string;groups:Group[];grouping:string};
  if(data.source!=='models.dev'||!Array.isArray(data.groups))throw Error('INVALID_SOURCE');
  const matched=data.groups.filter(x=>!q||x.name.toLowerCase().includes(q)||x.modelId.toLowerCase().includes(q));
  const items=matched.slice(cursor,cursor+limit).map(x=>({modelId:x.modelId,name:x.name,providerCount:x.providerCount,lowestObservedInputUsdPerMillion:x.lowestObservedInputUsdPerMillion,offers:x.offers.slice(0,100)}));
  return NextResponse.json({total:matched.length,limit,cursor,nextCursor:cursor+items.length<matched.length?cursor+items.length:null,items,source:'models.dev',sourceCollectedAt:data.sourceCollectedAt,grouping:data.grouping,notice:'Exact model IDs only. Aggregated provider pricing is not independently publisher-verified.'},{headers:{'Cache-Control':'no-store'}});
 }catch{
  return NextResponse.json({status:'local_group_index_missing',total:0,items:[],explanation:'Run group-model-offers.mjs against a previously collected local index.'},{status:503,headers:{'Cache-Control':'no-store'}});
 }
}
