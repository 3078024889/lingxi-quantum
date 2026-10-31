import {NextResponse} from 'next/server';
import {searchPlatforms} from '../../../../lib/platform-repository';
import {marketCards} from '../../../../lib/market-metric-contract';
import verifiedMetrics from '../../../../data/verified-market-metrics.json';
export const runtime='nodejs';
export const dynamic='force-dynamic';
type Coverage={candidateCount:number;approvedCandidateCount:number;sourceItemCount:number;reviewNeededCount:number;syncRunCount:number;latestObservedAt:string|null};
function safeCount(x:unknown){return typeof x==='number'&&Number.isSafeInteger(x)&&x>=0&&x<=100000000?x:null;}
function validate(x:unknown):Coverage|null{
 if(!x||typeof x!=='object'||Array.isArray(x))return null;
 const d=x as Record<string,unknown>;
 const n=['candidateCount','approvedCandidateCount','sourceItemCount','reviewNeededCount','syncRunCount'];
 const values=n.map(k=>safeCount(d[k]));
 if(values.some(x=>x===null))return null;
 if((values[1] as number)>(values[0] as number)||(values[3] as number)>(values[2] as number))return null;
 const timestamp=d.latestObservedAt;
 if(timestamp!==null&&(typeof timestamp!=='string'||!Number.isFinite(Date.parse(timestamp))))return null;
 return {candidateCount:values[0] as number,approvedCandidateCount:values[1] as number,
  sourceItemCount:values[2] as number,reviewNeededCount:values[3] as number,
  syncRunCount:values[4] as number,latestObservedAt:timestamp as string|null};
}
function connection(){
 const url=process.env.AI_MARKET_SUPABASE_URL||process.env.SUPABASE_URL;
 const key=process.env.AI_MARKET_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return null;
 try{
  const base=new URL(url);
  if(base.protocol!=='https:'||!base.hostname.endsWith('.supabase.co'))return null;
  return {base,key};
 }catch{return null;}
}
export async function GET(){
 const db=connection();
 const shared={curatedProfiles:searchPlatforms({limit:1}).total,
  verifiedGeoMetrics:marketCards(verifiedMetrics).filter(x=>x.metric!==null).length};
 if(!db)return NextResponse.json({...shared,status:'unavailable',data:null},{status:503,headers:{'Cache-Control':'no-store'}});
 const url=new URL('/rest/v1/rpc/ai_market_public_coverage',db.base);
 const h:Record<string,string>={apikey:db.key,'Content-Type':'application/json'};
 if(db.key.startsWith('eyJ'))h.Authorization='Bearer '+db.key;
 try{
  const response=await fetch(url,{method:'POST',headers:h,body:'{}',signal:AbortSignal.timeout(7000),cache:'no-store',redirect:'error'});
  if(!response.ok)return NextResponse.json({...shared,status:'unavailable',data:null},{status:503,headers:{'Cache-Control':'no-store'}});
  const data=validate(await response.json());
  if(!data)return NextResponse.json({...shared,status:'invalid',data:null},{status:503,headers:{'Cache-Control':'no-store'}});
  return NextResponse.json({...shared,status:'live',data,scope:'unreviewed_source_candidates_not_verified_products'},
   {headers:{'Cache-Control':'public, s-maxage=180, stale-while-revalidate=300'}});
 }catch{
  return NextResponse.json({...shared,status:'unavailable',data:null},{status:503,headers:{'Cache-Control':'no-store'}});
 }
}
