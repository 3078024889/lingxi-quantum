import {NextResponse} from 'next/server';
import {searchPlatforms,toPlatform} from '../../../../lib/platform-repository';
import {entries} from '../../../../lib/catalog-store';
import {discoverCatalog} from '../../../../lib/catalog-insights.mjs';
import {ALL_REGIONS,type RegionCode} from '../../../../lib/global-region-market';
import {MARKET_FILTERS,type MarketFilter,type MarketPayment,type MarketSort} from '../../../../lib/market-v36-screening';
export const dynamic='force-dynamic';
const payments=['any','card','alipay','wechat','paypal','appstore'] as const;
const sorts=['directory','name','free','drama'] as const;
function intParam(value:string|null,defaultValue:number,max:number){
 const n=value===null?defaultValue:Number(value);
 return Number.isSafeInteger(n)&&n>=0&&n<=max?n:null;
}
export function GET(request:Request){
 const sp=new URL(request.url).searchParams,q=(sp.get('q')||'').trim();
 if(q.length>120)return NextResponse.json({error:'QUERY_TOO_LONG'},{status:400});
 const category=(sp.get('category')||'').slice(0,60);
 const rawFilter=sp.get('filter')||'all',rawPayment=sp.get('payment')||'any';
 const rawSort=sp.get('sort')||'directory',rawRegion=sp.get('region')||'GLOBAL';
 if(!MARKET_FILTERS.includes(rawFilter as MarketFilter)||!payments.includes(rawPayment as MarketPayment)||!sorts.includes(rawSort as MarketSort)||!ALL_REGIONS.includes(rawRegion as RegionCode)){
  return NextResponse.json({error:'INVALID_MARKET_FILTER'},{status:400});
 }
 const limit=intParam(sp.get('limit'),24,50),cursor=intParam(sp.get('cursor'),0,10000);
 if(limit===null||limit===0||cursor===null)return NextResponse.json({error:'INVALID_PAGINATION'},{status:400});
 const filter=rawFilter as MarketFilter,payment=rawPayment as MarketPayment,sort=rawSort as MarketSort,region=rawRegion as RegionCode;
 const beginner=sp.get('beginner')==='1';
 const result=searchPlatforms({q,category:category==='全部平台'?'':category,limit,cursor,filter,payment,sort,region,beginner});
 const fallback=q&&result.total===0&&filter==='all'&&payment==='any'&&sort==='directory'&&!beginner&&cursor===0?
  discoverCatalog(entries,q,{limit:Math.min(30,limit)}):null;
 const candidateItems=fallback?.items.filter(x=>!category||category==='全部平台'||x.category===category)||[];
 const matched=candidateItems.length?{...result,total:candidateItems.length,items:candidateItems.map(toPlatform),nextCursor:null}:result;
 return NextResponse.json({...matched,query:q,filter,payment,sort,region,beginner,
  kind:candidateItems.length?'task_relevance_suggestions':'catalog_matches',rankingVerified:false},
  {headers:{'Cache-Control':'public, max-age=0, s-maxage=60, stale-while-revalidate=120'}});
}
