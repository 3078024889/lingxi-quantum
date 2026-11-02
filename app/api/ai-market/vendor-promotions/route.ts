import {NextRequest,NextResponse} from "next/server";
import {createClient,getServerUser} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {parseMarketPromotionRequest} from "@/lib/ai-market-promotion-request";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const columns="id,claim_id,product_id,plan_id,currency,provider,amount_minor,status,merchant_order_id,created_at";
const fail=(error:string,status:number)=>NextResponse.json({error},{status,headers});
async function requester(){
 const db=createClient(),user=await getServerUser(db);
 return {db,user:user?.email_confirmed_at?user:null};
}
export async function GET(){
 try{
  const {db,user}=await requester();if(!user)return fail("LOGIN_REQUIRED",401);
  const {data,error}=await db.from("ai_market_vendor_promotion_requests")
   .select(columns).eq("user_id",user.id).order("created_at",{ascending:false}).limit(30);
  if(error)return fail("PROMOTION_STORAGE_NOT_READY",503);
  return NextResponse.json({requests:data||[],checkoutEnabled:false,paymentUrl:null,organicRankAffected:false},{headers});
 }catch{return fail("PROMOTION_SERVICE_UNAVAILABLE",503)}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return fail("INVALID_REQUEST_ORIGIN",403);
 if(Number(req.headers.get("content-length")||0)>1600)return fail("REQUEST_TOO_LARGE",413);
 let raw:unknown;
 try{const s=await req.text();if(Buffer.byteLength(s,"utf8")>1600)return fail("REQUEST_TOO_LARGE",413);
  raw=JSON.parse(s);
 }catch{return fail("INVALID_JSON",400)}
 const request=parseMarketPromotionRequest(raw);if(!request)return fail("INVALID_PROMOTION_REQUEST",400);
 try{
  const {db,user}=await requester();if(!user)return fail("LOGIN_REQUIRED",401);
  const {data,error}=await db.from("ai_market_vendor_promotion_requests")
   .insert({...request,user_id:user.id}).select(columns).single();
  if(error){
   if(error.code==="23505"){
    // Same idempotency key: return the original exact request instead of generating a second draft.
    const original=await db.from("ai_market_vendor_promotion_requests").select(columns)
      .eq("user_id",user.id).eq("idempotency_key",request.idempotency_key).maybeSingle();
    const x=original.data;
    if(!original.error&&x&&x.claim_id===request.claim_id&&x.product_id===request.product_id&&
      x.plan_id===request.plan_id&&x.currency===request.currency&&x.provider===request.provider)
      return NextResponse.json({request:x,alreadyExists:true,checkoutEnabled:false,paymentUrl:null},{status:200,headers});
    return fail("EXISTING_PROMOTION_OR_IDEMPOTENCY_CONFLICT",409);
   }
   if(error.code==="23514"||error.code==="42501")return fail("APPROVED_VENDOR_REQUIRED",403);
   return fail("PROMOTION_STORAGE_NOT_READY",503);
  }
  return NextResponse.json({request:data,checkoutEnabled:false,paymentUrl:null,
   rankingGranted:false,merchantOrderLinked:false},{status:201,headers});
 }catch{return fail("PROMOTION_SERVICE_UNAVAILABLE",503)}
}
