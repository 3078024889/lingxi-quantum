import {NextResponse} from 'next/server';
import source from '../../../../data/verified-market-metrics.json';
import {marketCards} from '../../../../lib/market-metric-contract';
export const dynamic='force-dynamic';
export function GET(){
 const entries=marketCards(source);
 const metrics=Object.fromEntries(entries.filter(x=>x.metric!==null).map(x=>[x.key,x.metric]));
 return NextResponse.json({metrics,verified:entries.filter(x=>x.metric!==null).length,total:entries.length,
 notice:'Only evidence-backed metrics are returned; missing or malformed sources never become estimates.'},
 {headers:{'Cache-Control':'no-store'}});
}
