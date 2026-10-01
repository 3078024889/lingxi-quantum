import {NextRequest,NextResponse} from 'next/server';
import {createHash} from 'node:crypto';
import {createClient} from '@/lib/supabase/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {isSameOriginMutation} from '@/lib/sasi/request-security';
import {enforceAbuseGuard} from '@/lib/security/abuse-guard';
import {foodRequestIpHash} from '@/lib/tools/food/request-identity';
import {parseFoodGroups,foodQuantity} from '@/lib/tools/food/analysis-input';
import {resolveFoodMeal} from '@/lib/tools/food/analysis-server';
export const runtime='nodejs';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:'INVALID_REQUEST_ORIGIN'},{status:403});
 try{
  const text=await req.text();if(text.length>32000)return NextResponse.json({error:'REQUEST_TOO_LARGE'},{status:413});
  const body=JSON.parse(text),id=String(body.requestId||''),mode=body.mode;
  if(!UUID.test(id)||!['image','custom'].includes(mode))throw new Error('INVALID_FOOD_ITEMS');
  const groups=parseFoodGroups(body.groups);
  if(mode==='custom'&&groups.length!==1)throw new Error('INVALID_FOOD_ITEMS');
  const {data:{user}}=await createClient().auth.getUser(),account=user?.id||null,ip=foodRequestIpHash(req),admin=createAdminClient();
  const guard=await enforceAbuseGuard(req,{scope:'food-analysis-prepare',userId:account,accountLimit:60,ipLimit:90,windowSeconds:3600});
  if(!guard.ok)return NextResponse.json({error:'TOO_MANY_REQUESTS'},{status:429});
  const sessionId=mode==='image'?String(body.sessionId||''):null;
  const digest=createHash('sha256').update(JSON.stringify({mode,sessionId,groups})).digest('hex');
  const previous=await admin.from('food_analysis_requests_v19').select('id,account_id,ip_hash,input_digest,quantity,free_eligible,mode').eq('id',id).maybeSingle();
  if(previous.error)throw new Error('ANALYSIS_UNAVAILABLE');
  if(previous.data){const row=previous.data;if(row.account_id!==account||(!account&&row.ip_hash!==ip)||row.input_digest!==digest)return NextResponse.json({error:'REQUEST_CONFLICT'},{status:409});return NextResponse.json({id,quantity:row.quantity,freeEligible:row.free_eligible,mode:row.mode});}
  if(mode==='image'){
   if(!UUID.test(sessionId!))throw new Error('IMAGE_SESSION_INVALID');
   const {data:s,error}=await admin.from('food_calorie_image_sessions_v18').select('*').eq('id',sessionId).maybeSingle();
   if(error||!s||s.account_id!==account||s.ip_hash!==ip||s.consumed_at||Date.parse(s.expires_at)<=Date.now()||s.photo_count!==groups.length)throw new Error('IMAGE_SESSION_INVALID');
  }
  const result=await resolveFoodMeal(groups.flat());
  const quantity=foodQuantity(groups,mode),freeEligible=mode==='custom'||quantity===1;
  const {error}=await admin.from('food_analysis_requests_v19').insert({id,account_id:account,ip_hash:ip,mode,quantity,free_eligible:freeEligible,image_session_id:sessionId,input_digest:digest,result});
  if(error)throw new Error('ANALYSIS_UNAVAILABLE');
  return NextResponse.json({id,quantity,freeEligible,mode},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){const error=e instanceof Error?e.message:'';return NextResponse.json({error:/^(INVALID_|IMAGE_SESSION_|FOOD_UNAVAILABLE)/.test(error)?error:'ANALYSIS_UNAVAILABLE'},{status:/^(INVALID_|IMAGE_SESSION_)/.test(error)?400:503});}
}
