import {NextRequest,NextResponse} from 'next/server';
import {moneyAdministrator} from '@/lib/money/operator-settings';
import {createAdminClient} from '@/lib/supabase/admin';
import {checkRateLimit} from '@/lib/rate-limit';
import {parseCandidateQuery,escapePostgrestSearch} from '@/lib/ai-market-candidate-query.mjs';

export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
export async function GET(req:NextRequest){
 let user=null;
 try{user=await moneyAdministrator();}catch{user=null;}
 if(!user)return NextResponse.json({error:'FORBIDDEN'},{status:403,headers});
 if(!await checkRateLimit('ai-market-candidates:'+user.id,60,60))
   return NextResponse.json({error:'RATE_LIMITED'},{status:429,headers});
 const q=parseCandidateQuery({
  status:req.nextUrl.searchParams.get('status'),search:req.nextUrl.searchParams.get('search'),
  limit:req.nextUrl.searchParams.get('limit'),page:req.nextUrl.searchParams.get('page'),
 });
 if(!q)return NextResponse.json({error:'INVALID_QUERY'},{status:400,headers});
 try{
  let statement=createAdminClient().from('ai_market_candidates')
   .select('candidate_key,source_url,kind,display_name,publisher,verification_status,first_seen_at,last_seen_at',{count:'exact'})
   .order('last_seen_at',{ascending:false}).order('candidate_key',{ascending:true})
   .range(q.offset,q.offset+q.limit-1);
  if(q.status!=='all')statement=statement.eq('verification_status',q.status);
  const term=escapePostgrestSearch(q.search);
  if(term)statement=statement.or('display_name.ilike.%'+term+'%,publisher.ilike.%'+term+'%');
  const {data,error,count}=await statement;
  if(error)return NextResponse.json({error:'CANDIDATE_STORAGE_UNAVAILABLE'},{status:503,headers});
  return NextResponse.json({records:data??[],total:count??0,page:q.page,limit:q.limit,verifiedSourceOnly:false},{headers});
 }catch{return NextResponse.json({error:'CANDIDATE_STORAGE_UNAVAILABLE'},{status:503,headers});}
}
