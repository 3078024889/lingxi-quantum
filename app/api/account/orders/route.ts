import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSameOriginMutation } from '@/lib/sasi/request-security';
import { validOrderDeletionIds } from '@/lib/mini/order-deletion';
import { checkRateLimit } from '@/lib/rate-limit';
export async function DELETE(req: NextRequest) {
  if (!isSameOriginMutation(req)) return NextResponse.json({error:'INVALID_REQUEST_ORIGIN'}, {status:403});
  const {data:{user}} = await createClient().auth.getUser();
  if (!user) return NextResponse.json({error:'LOGIN_REQUIRED'}, {status:401});
  if (!await checkRateLimit('account-order-delete:'+user.id,60,600)) return NextResponse.json({error:'RATE_LIMITED'},{status:429});
  const raw=await req.text();if(raw.length>8192)return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413});
  let body;try{body=JSON.parse(raw)}catch{return NextResponse.json({error:'INVALID_REQUEST'},{status:400})}
  const ids=validOrderDeletionIds(body?.orderIds);
  if (!ids) return NextResponse.json({error:'INVALID_ORDERS'},{status:400});
  const admin=createAdminClient();
  const owned=await admin.from('orders').select('id').eq('user_id',user.id).in('id',ids);
  if(owned.error)return NextResponse.json({error:'SERVICE_UNAVAILABLE'},{status:503});
  if(owned.data?.length!==ids.length)return NextResponse.json({error:'ORDER_NOT_FOUND'},{status:404});
  // Removing the customer's record never cancels settlement or alters the ledger.
  const saved=await admin.from('orders').update({user_deleted_at:new Date().toISOString()}).eq('user_id',user.id).in('id',ids).select('id');
  if(saved.error||saved.data?.length!==ids.length)return NextResponse.json({error:'DELETE_FAILED'},{status:503});
  return NextResponse.json({deletedIds:ids},{headers:{'Cache-Control':'private, no-store'}});
}
