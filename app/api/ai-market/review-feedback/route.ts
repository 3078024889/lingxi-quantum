import { NextRequest, NextResponse } from 'next/server';
import { moneyAdministrator } from '@/lib/money/operator-settings';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSameOriginMutation } from '@/lib/sasi/request-security';
import { checkRateLimit } from '@/lib/rate-limit';
import { validateReviewFeedback } from '@/lib/ai-market-review-validation.mjs';

export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store'};
async function currentAdmin(){
 try { return await moneyAdministrator(); } catch { return null; }
}
export async function GET(req:NextRequest){
 const user=await currentAdmin();
 if(!user) return NextResponse.json({error:'FORBIDDEN'},{status:403,headers});
 const revision=req.nextUrl.searchParams.get('revision');
 if(!revision || !/^[a-f0-9]{40}$/.test(revision))
  return NextResponse.json({error:'INVALID_REVISION'},{status:400,headers});
 const result=await createAdminClient().from('ai_market_review_records')
  .select('id,revision,category,decision,note,created_at')
  .eq('revision',revision).order('created_at',{ascending:false}).limit(100);
 if(result.error)return NextResponse.json({error:'REVIEW_STORAGE_UNAVAILABLE'},{status:503,headers});
 return NextResponse.json({records:result.data||[]},{headers});
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:'INVALID_ORIGIN'},{status:403,headers});
 const user=await currentAdmin();
 if(!user)return NextResponse.json({error:'FORBIDDEN'},{status:403,headers});
 if(!await checkRateLimit('ai-market-review:'+user.id,10,60))
  return NextResponse.json({error:'RATE_LIMITED'},{status:429,headers});
 const raw=await req.text();
 if(raw.length>4096)return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413,headers});
 let body:unknown;
 try{body=JSON.parse(raw);}catch{return NextResponse.json({error:'INVALID_JSON'},{status:400,headers});}
 const input=validateReviewFeedback(body);
 if(!input)return NextResponse.json({error:'INVALID_FEEDBACK'},{status:400,headers});
 const saved=await createAdminClient().from('ai_market_review_records')
  .insert({...input,actor_id:user.id}).select('id,created_at').single();
 if(saved.error)return NextResponse.json({error:'REVIEW_STORAGE_UNAVAILABLE'},{status:503,headers});
 return NextResponse.json({saved:saved.data},{status:201,headers});
}
