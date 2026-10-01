import {NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {refreshWithdrawal} from '@/lib/payments/withdrawal-processing';
export const runtime='nodejs';
export const maxDuration=90;
export async function GET(req:Request){
 const secret=process.env.CRON_SECRET?.trim();
 if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'UNAUTHORIZED'},{status:401});
 const admin=createAdminClient();
 const {data:rows,error}=await admin.from('balance_withdrawals').select('*').in('status',['requested','processing']).lt('updated_at',new Date(Date.now()-60000).toISOString()).order('updated_at',{ascending:true}).limit(3);
 if(error)return NextResponse.json({error:'QUERY_FAILED'},{status:503});
 const states=await Promise.all((rows||[]).map(async w=>{
  const result=await refreshWithdrawal(w.id,w.user_id);
  return result.ok&&result.status==='completed'?'completed':result.ok&&result.status==='failed'?'failed':'pending';
 }));
 return NextResponse.json({ok:true,checked:states.length,completed:states.filter(x=>x==='completed').length,failed:states.filter(x=>x==='failed').length,pending:states.filter(x=>x==='pending').length},{headers:{'Cache-Control':'no-store'}});
}
