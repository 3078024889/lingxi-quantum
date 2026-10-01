import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {dispatchWithdrawal} from '@/lib/payments/withdrawal-processing';
export const runtime='nodejs';export const maxDuration=30;
export async function GET(){
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401});
 const admin=createAdminClient();const [legacy,migrated]=await Promise.all([admin.from('ai_refund_requests').select('id,order_id,amount_fen,status,created_at,updated_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(100),admin.from('balance_withdrawals').select('legacy_refund_id').eq('user_id',user.id).not('legacy_refund_id','is',null)]);
 if(legacy.error||migrated.error)return NextResponse.json({error:'WITHDRAWAL_DATA_FAILED'},{status:503});const linked=new Set((migrated.data||[]).map(x=>x.legacy_refund_id));
 return NextResponse.json({items:(legacy.data||[]).filter(x=>!linked.has(x.id))},{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:'INVALID_REQUEST_ORIGIN'},{status:403});
 const supabase=createClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401});
 const requestId=String((await req.json().catch(()=>null))?.requestId||'');if(!/^[0-9a-f-]{36}$/i.test(requestId))return NextResponse.json({error:'INVALID_REQUEST'},{status:400});
 const admin=createAdminClient();const rate=await admin.rpc('rate_limit_check',{p_key:`balance-migrate:${user.id}`,p_limit:20,p_window_seconds:3600});if(rate.error||rate.data!==true)return NextResponse.json({error:'RATE_LIMITED'},{status:429});
 const {data,error}=await admin.rpc('migrate_balance_refund_v2',{p_user_id:user.id,p_legacy_id:requestId});
 if(error||!data?.ok||!data.withdrawalId)return NextResponse.json({error:data?.error||'LEGACY_MIGRATION_UNAVAILABLE'},{status:409});
 const result=await dispatchWithdrawal(data.withdrawalId,user.id);return NextResponse.json(result,{status:result.ok?(result.status==='completed'?200:202):409});
}
