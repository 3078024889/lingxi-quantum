import {NextRequest,NextResponse} from 'next/server';
import {createAdminClient,isSupabaseAdminConfigured} from '@/lib/supabase/admin';
import {parseMetricScope,verifiedHistory} from '@/lib/ai-market/metric-read.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
export async function GET(req:NextRequest){
 const params=req.nextUrl.searchParams;
 const scope=parseMetricScope(params);
 const entityId=params.get('entityId')||'',start=params.get('start')||'',end=params.get('end')||'';
 if(!scope||!entityId||entityId.length>250||!/^[\w:%.\/-]+$/.test(entityId)||
 !/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end)||start>end)
  return NextResponse.json({error:'INVALID_SCOPE'},{status:400,headers});
 if(!isSupabaseAdminConfigured())return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
 try{
  const db=createAdminClient();
  const observations=await db.from('ai_market_metric_observations')
   .select('entity_id,metric,observed_day,value,unit,region,period,methodology,sample,provider,source_url,verification,evidence_id')
   .eq('entity_id',entityId).eq('metric',scope.metric).eq('region',scope.region).eq('period',scope.period)
   .eq('methodology',scope.methodology).eq('sample',scope.sample).gte('observed_day',start).lte('observed_day',end)
   .order('observed_day',{ascending:true}).limit(500);
  if(observations.error)return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
  const evidenceIds=[...new Set((observations.data||[]).map(x=>x.evidence_id).filter(x=>x!=null))];
  const evidence=evidenceIds.length?await db.from('ai_market_evidence').select('id,entity_id,source_url,checked').in('id',evidenceIds):{data:[],error:null};
  if(evidence.error)return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
  const points=verifiedHistory(observations.data||[],evidence.data||[],scope,entityId,start,end);
  if(!points)return NextResponse.json({error:'INVALID_SCOPE'},{status:400,headers});
  return NextResponse.json({entityId,scope,start,end,points,partialSourceScan:(observations.data||[]).length===500,actualObservations:points.length},{headers});
 }catch{return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});}
}
