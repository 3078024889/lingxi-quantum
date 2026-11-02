import {NextRequest,NextResponse} from "next/server";
import {createClient,getServerUser} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {parseMarketVendorClaim} from "@/lib/ai-market-vendor-claims";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"};
const err=(error:string,status:number)=>NextResponse.json({error},{status,headers});
async function owner(){
 const db=createClient();
 const user=await getServerUser(db);
 if(!user?.id||!user.email_confirmed_at)return {db,user:null};
 return {db,user};
}
export async function GET(){
 try{
  const {db,user}=await owner();if(!user)return err("LOGIN_REQUIRED",401);
  const {data,error}=await db.from("ai_market_vendor_claims")
   .select("id,product_id,company_name,official_site,status,created_at,reviewed_at")
   .eq("user_id",user.id).order("created_at",{ascending:false}).limit(20);
  if(error)return err("CLAIM_STORAGE_NOT_READY",503);
  return NextResponse.json({claims:data||[],freeClaimLimit:3,paidRankingEnabled:false},{headers});
 }catch{return err("CLAIM_SERVICE_UNAVAILABLE",503)}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return err("INVALID_REQUEST_ORIGIN",403);
 if(Number(req.headers.get("content-length")||0)>4300)return err("REQUEST_TOO_LARGE",413);
 let input:unknown;
 try{const body=await req.text();if(Buffer.byteLength(body,"utf8")>4300)return err("REQUEST_TOO_LARGE",413);input=JSON.parse(body)}
 catch{return err("INVALID_JSON",400)}
 const claim=parseMarketVendorClaim(input);if(!claim)return err("INVALID_VENDOR_CLAIM",400);
 try{
  const {db,user}=await owner();if(!user)return err("LOGIN_REQUIRED",401);
  // Ownership and three-free-claims limit are also checked by database RLS and a serialized insert trigger.
  const {data,error}=await db.from("ai_market_vendor_claims")
   .insert({user_id:user.id,...claim}).select("id,product_id,status,created_at").single();
  if(error){
   if(error.code==="23505")return err("ALREADY_CLAIMED_BY_ACCOUNT",409);
   if(error.code==="23514"||/CLAIM_LIMIT_THREE/i.test(error.message))return err("FREE_CLAIM_LIMIT_REACHED",409);
   return err("CLAIM_STORAGE_NOT_READY",503);
  }
  return NextResponse.json({claim:data,identityVerified:false,rankingGranted:false,reviewRequired:true},{status:202,headers});
 }catch{return err("CLAIM_SERVICE_UNAVAILABLE",503)}
}
