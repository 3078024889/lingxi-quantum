import {NextResponse} from 'next/server';
import {marketEvidence} from '../../../../lib/market-store';
import {queryRecords,METRICS} from '../../../../lib/market-engine.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){
 const u=new URL(request.url),metric=u.searchParams.get('metric')||'';
 if(metric&&!METRICS.includes(metric))return NextResponse.json({error:'invalid_metric'},{status:400});
 const fields={platformId:(u.searchParams.get('platformId')||'').slice(0,80),metric,region:(u.searchParams.get('region')||'').slice(0,16),status:'verified',limit:u.searchParams.get('limit')||50,offset:u.searchParams.get('offset')||0};
 const result=queryRecords(marketEvidence,fields);
 return NextResponse.json({...result,dataStatus:result.total?'verified_records':'no_verified_records',sourcePolicy:'verified records only'}, {headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=600'}});
}
