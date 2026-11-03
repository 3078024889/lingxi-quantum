import {NextResponse} from 'next/server';
import {marketEvidence} from '../../../../lib/market-store';
import {comparableRanking} from '../../../../lib/market-analytics.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){const p=new URL(request.url).searchParams;try{return NextResponse.json(comparableRanking(marketEvidence,{metric:p.get('metric')||'monthly_visits',region:p.get('region')||'global',periodEnd:p.get('periodEnd')||'',provider:p.get('provider')||'',limit:Number(p.get('limit')||100)}),{headers:{'Cache-Control':'public, s-maxage=300'}})}catch{return NextResponse.json({error:'invalid_metric'},{status:400})}}
