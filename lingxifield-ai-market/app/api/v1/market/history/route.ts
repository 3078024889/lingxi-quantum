import {NextResponse} from 'next/server';
import {marketEvidence} from '../../../../../lib/market-store';
import {history,METRICS} from '../../../../../lib/market-engine.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){const u=new URL(request.url);const platformId=(u.searchParams.get('platformId')||'').slice(0,80),metric=(u.searchParams.get('metric')||'').slice(0,80),region=(u.searchParams.get('region')||'global').slice(0,16);
 if(!platformId||!METRICS.includes(metric))return NextResponse.json({error:'platformId_and_valid_metric_required'},{status:400});
 const data=history(marketEvidence,{platformId,metric,region});return NextResponse.json({platformId,metric,region,count:data.length,data,status:data.length?'verified_history':'no_verified_history'},{headers:{'Cache-Control':'public, s-maxage=300'}})}
