import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {foodRequestIpHash} from '@/lib/tools/food/request-identity';
import {recoverToolQuotePayment} from '@/lib/tools/payment-recovery';
export const runtime='nodejs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!UUID.test(id))return NextResponse.json({error:'INVALID_REQUEST'},{status:400});
 const {data:{user}}=await createClient().auth.getUser();
 const {data:r,error}=await createAdminClient().from('food_analysis_requests_v19').select('id,account_id,ip_hash,quantity,mode,free_eligible,consumed_at,expires_at').eq('id',id).maybeSingle();
 if(error)return NextResponse.json({error:'ANALYSIS_UNAVAILABLE'},{status:503});
 if(!r||(r.account_id?r.account_id!==user?.id:r.ip_hash!==foodRequestIpHash(req)))return NextResponse.json({error:'REQUEST_NOT_FOUND'},{status:404});
 const {data:quote,error:quoteError}=await createAdminClient().from('tool_payment_quotes').select('id').eq('tool_id','food-calorie').contains('metadata',{foodRequestId:id}).in('status',['quoted','ordered','paid']).limit(1).maybeSingle();
 if(quoteError)return NextResponse.json({error:'ANALYSIS_UNAVAILABLE'},{status:503});
 return NextResponse.json({id:r.id,quantity:r.quantity,mode:r.mode,freeEligible:r.free_eligible&&!quote,completed:!!r.consumed_at,expiresAt:r.expires_at},{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!isSameOriginMutation(req))return NextResponse.json({error:'INVALID_REQUEST_ORIGIN'},{status:403});
 const {id}=await params;if(!UUID.test(id))return NextResponse.json({error:'INVALID_REQUEST'},{status:400});
 try{
  const body=await req.json(),quoteId=body.quoteId||null;
  if(quoteId&&!UUID.test(quoteId))return NextResponse.json({error:'INVALID_QUOTE'},{status:400});
  const {data:{user}}=await createClient().auth.getUser();
  if(quoteId){
   if(!user)return NextResponse.json({error:'SIGN_IN_REQUIRED'},{status:401});
   const payment=await recoverToolQuotePayment({userId:user.id,quoteId});
   if(!payment.ok||!payment.paid||payment.quote?.toolId!=='food-calorie')return NextResponse.json({error:'PAYMENT_REQUIRED'},{status:402});
  }
  const {data,error}=await createAdminClient().rpc('consume_food_analysis_v19',{p_id:id,p_account_id:user?.id||null,p_ip_hash:foodRequestIpHash(req),p_quote_id:quoteId});
  if(error){const code=['FREE_ALREADY_USED','PAYMENT_REQUIRED','REQUEST_EXPIRED','REQUEST_NOT_FOUND','QUOTE_BINDING_MISMATCH','IMAGE_SESSION_INVALID'].find(x=>error.message.includes(x))||'ANALYSIS_UNAVAILABLE';return NextResponse.json({error:code,freeUsed:code==='FREE_ALREADY_USED'},{status:code==='ANALYSIS_UNAVAILABLE'?503:409});}
  return NextResponse.json(data,{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'ANALYSIS_UNAVAILABLE'},{status:503});}
}
