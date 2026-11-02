import {NextResponse} from 'next/server';
import {marketEvidence} from '../../../../lib/market-store';
import {platformTimeline} from '../../../../lib/market-analytics.mjs';
export const dynamic='force-dynamic';
export function GET(request:Request){const p=new URL(request.url).searchParams,platformId=p.get('platformId')||'',metric=p.get('metric')||'';if(!platformId||!metric)return NextResponse.json({error:'platformId_and_metric_required'},{status:400});return NextResponse.json(platformTimeline(marketEvidence,{platformId,metric,region:p.get('region')||'global',limit:Number(p.get('limit')||100)}),{headers:{'Cache-Control':'public, s-maxage=300'}})}
