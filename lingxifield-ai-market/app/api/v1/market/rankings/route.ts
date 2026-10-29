import {NextResponse} from 'next/server';
import {marketEvidence} from '../../../../../lib/market-store';
import {latestSnapshot,METRICS} from '../../../../../lib/market-engine.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){const u=new URL(request.url);const metric=u.searchParams.get('metric')||'monthly_visits',region=(u.searchParams.get('region')||'global').slice(0,16);
 if(!METRICS.includes(metric))return NextResponse.json({error:'invalid_metric'},{status:400});
 const data=latestSnapshot(marketEvidence,{metric,region}).slice(0,100);
 return NextResponse.json({metric,region,count:data.length,data,status:data.length?'evidence_backed':'not_yet_measured',disclaimer:'Metrics are not comparable across providers or methodologies without normalization.'},{headers:{'Cache-Control':'public, s-maxage=300'}})}
