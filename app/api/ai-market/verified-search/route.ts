import {NextRequest,NextResponse} from 'next/server';
import {createAdminClient,isSupabaseAdminConfigured} from '@/lib/supabase/admin';
import {answerVerifiedQuestion} from '@/lib/ai-market/integration-read.mjs';
import {checkRateLimit} from '@/lib/rate-limit';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex'};
const unavailable=()=>NextResponse.json({error:'VERIFIED_DATA_UNAVAILABLE',results:[]},{status:503,headers:{'Cache-Control':'no-store'}});
export async function GET(req:NextRequest){
 const q=req.nextUrl.searchParams.get('q')||'';
 if(q.trim().length<2||q.length>200)return NextResponse.json({error:'INVALID_QUESTION'},{status:400,headers:{'Cache-Control':'no-store'}});
 if(!await checkRateLimit('ai-market-verified-search:public',120,60))
  return NextResponse.json({error:'RATE_LIMITED'},{status:429,headers:{'Cache-Control':'no-store'}});
 if(!isSupabaseAdminConfigured())return unavailable();
 try{
  const db=createAdminClient();
  const [entityResponse,capabilityResponse]=await Promise.all([
   db.from('ai_market_identity').select('id,name,status:verification_status,entity_type,official_website,verified_at,verified_by').eq('entity_type','product').eq('verification_status','verified').limit(200),
   db.from('ai_market_verified_capabilities').select('entity_id,capability_key,evidence_id,verified_by,verified_at').limit(1000)
  ]);
  if(entityResponse.error||capabilityResponse.error)return unavailable();
  const requiredIds=[...new Set((capabilityResponse.data||[]).map(x=>x.evidence_id).filter(x=>x!=null))].slice(0,1000);
  const evidenceResponse=requiredIds.length?await db.from('ai_market_evidence').select('id,checked,source_url').in('id',requiredIds):{data:[],error:null};
  if(evidenceResponse.error)return unavailable();
  const data=answerVerifiedQuestion(q,{entities:entityResponse.data||[],capabilities:capabilityResponse.data||[],evidence:evidenceResponse.data||[]});
  return NextResponse.json({...data,partialCatalog:true,maximumCandidatesScanned:200},{headers});
 }catch{return unavailable();}
}
