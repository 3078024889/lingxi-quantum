import {NextRequest,NextResponse} from 'next/server';
import {createAdminClient,isSupabaseAdminConfigured} from '@/lib/supabase/admin';
import {parseMetricScope,rankVerifiedRows} from '@/lib/ai-market/metric-read.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
export async function GET(req:NextRequest){
 const scope=parseMetricScope(req.nextUrl.searchParams);
 if(!scope)return NextResponse.json({error:'INVALID_SCOPE'},{status:400,headers});
 if(!isSupabaseAdminConfigured())return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
 try{
  const db=createAdminClient();
  const {data:rows,error}=await db.from('ai_market_metric_observations')
   .select('entity_id,metric,observed_day,value,unit,region,period,methodology,sample,provider,source_url,verification,evidence_id')
   .eq('metric',scope.metric).eq('observed_day',scope.day).eq('region',scope.region).eq('period',scope.period)
   .eq('methodology',scope.methodology).eq('sample',scope.sample).limit(500);
  if(error)return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
  const ids=[...new Set((rows||[]).map(x=>x.evidence_id).filter(x=>x!=null))];
  const proof=ids.length?await db.from('ai_market_evidence').select('id,entity_id,source_url,checked').in('id',ids):{data:[],error:null};
  if(proof.error)return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});
  const ranked=rankVerifiedRows(rows||[],proof.data||[],scope);
  return NextResponse.json({...ranked,partialSourceScan:(rows||[]).length===500},{headers});
 }catch{return NextResponse.json({error:'DATA_UNAVAILABLE'},{status:503,headers});}
}
