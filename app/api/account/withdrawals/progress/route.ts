import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {moneyOperatorSettings} from '@/lib/money/operator-settings';
import {reconcileWithdrawal} from '@/lib/money/reconcile-worker';
export const runtime='nodejs';export const maxDuration=90;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:'INVALID_REQUEST_ORIGIN'},{status:403});
 const {data:{user}}=await createClient().auth.getUser();if(!user)return NextResponse.json({error:'LOGIN_REQUIRED'},{status:401});
 const body=await req.json().catch(()=>null),operator=body?.operator===true;
 try{
  if(operator){const settings=await moneyOperatorSettings();if(!user.email||!settings.admin_emails.some(email=>email.toLowerCase()===user.email!.toLowerCase()))return NextResponse.json({error:'FORBIDDEN'},{status:403});}
  const admin=createAdminClient(),rate=await admin.rpc('rate_limit_check',{p_key:'money-progress:'+user.id,p_limit:180,p_window_seconds:3600});
  if(rate.error)return NextResponse.json({error:'SERVICE_UNAVAILABLE'},{status:503});
  if(rate.data!==true)return NextResponse.json({error:'RATE_LIMITED'},{status:429});
  let query=admin.from('balance_withdrawals').select('id').in('status',['requested','processing']).not('submission_confirmed_at','is',null).not('provider_refund_id','is',null).order('last_provider_checked_at',{ascending:true,nullsFirst:true}).limit(5);
  if(!operator)query=query.eq('user_id',user.id);
  const {data,error}=await query;if(error)throw error;
  const results=[];for(const row of data||[])results.push(await reconcileWithdrawal(row.id,{queryOnly:true}));
  return NextResponse.json({ok:true,checked:results.length},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'PROGRESS_UNAVAILABLE'},{status:503});}
}
