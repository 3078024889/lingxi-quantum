import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {refreshWithdrawal} from '@/lib/payments/withdrawal-processing';
export const runtime='nodejs';
export const maxDuration=90;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:'INVALID_REQUEST_ORIGIN'},{status:403});
 const supabase=createClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401});
 const body=await req.json().catch(()=>null);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body?.withdrawalId||''))return NextResponse.json({error:'INVALID_REQUEST'},{status:400});
 const rate=await createAdminClient().rpc('rate_limit_check',{p_key:`withdrawal-refresh:${user.id}`,p_limit:30,p_window_seconds:3600});
 if(rate.error||rate.data!==true)return NextResponse.json({error:'RATE_LIMITED'},{status:429});
 const result=await refreshWithdrawal(body.withdrawalId,user.id,body.confirmSubmission===true);
 return NextResponse.json(result,{status:result.ok?200:404,headers:{'Cache-Control':'private, no-store'}});
}
