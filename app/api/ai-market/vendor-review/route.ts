import {NextRequest,NextResponse} from "next/server";
import {createClient,getServerUser} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {isMarketReviewer,parseReviewDecision} from "@/lib/ai-market-vendor-review";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const err=(error:string,status:number)=>NextResponse.json({error},{status,headers});
async function reviewer(){
 const db=createClient();
 const user=await getServerUser(db);
 return isMarketReviewer(user)?user:null;
}
export async function GET(req:NextRequest){
 try{
  const user=await reviewer();if(!user)return err("REVIEWER_AUTH_REQUIRED",403);
  const status=req.nextUrl.searchParams.get("status")||"pending_review";
  if(!["pending_review","identity_verified","approved","rejected","revoked"].includes(status))
   return err("INVALID_STATUS",400);
  const admin=createAdminClient();
  const {data,error}=await admin.from("ai_market_vendor_claims")
   .select("id,user_id,product_id,company_name,official_site,evidence_url,work_email,status,created_at,reviewed_at,reviewer_id,review_note")
   .eq("status",status).order("created_at",{ascending:true}).limit(40);
  if(error)return err("REVIEW_STORAGE_UNAVAILABLE",503);
  return NextResponse.json({claims:data||[],readOnly:false,rankingGrant:false},{headers});
 }catch{return err("REVIEW_SERVICE_UNAVAILABLE",503)}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return err("INVALID_REQUEST_ORIGIN",403);
 if(Number(req.headers.get("content-length")||0)>2200)return err("REQUEST_TOO_LARGE",413);
 let raw:unknown;
 try{
  const body=await req.text();if(Buffer.byteLength(body,"utf8")>2200)return err("REQUEST_TOO_LARGE",413);
  raw=JSON.parse(body);
 }catch{return err("INVALID_JSON",400)}
 const decision=parseReviewDecision(raw);if(!decision)return err("INVALID_REVIEW_DECISION",400);
 try{
  const user=await reviewer();if(!user)return err("REVIEWER_AUTH_REQUIRED",403);
  const admin=createAdminClient();
  // Optimistic status check plus unique verified-owner index prevents concurrent decisions.
  // The database AFTER UPDATE trigger writes a review event in the SAME transaction.
  const {data,error}=await admin.from("ai_market_vendor_claims")
   .update({status:decision.status,review_note:decision.reason,reviewer_id:user.id,reviewed_at:new Date().toISOString()})
   .eq("id",decision.id).eq("status",decision.expectedStatus)
   .select("id,product_id,status,reviewed_at").maybeSingle();
  if(error){
   if(error.code==="23505")return err("PRODUCT_ALREADY_VERIFIED_BY_ANOTHER_VENDOR",409);
   if(error.code==="23514")return err("INVALID_REVIEW_TRANSITION",409);
   return err("REVIEW_STORAGE_UNAVAILABLE",503);
  }
  if(!data)return err("CLAIM_NOT_FOUND_OR_CHANGED",409);
  return NextResponse.json({review:data,auditWritten:true,rankingGrant:false,paymentTaken:false},{headers});
 }catch{return err("REVIEW_SERVICE_UNAVAILABLE",503)}
}
