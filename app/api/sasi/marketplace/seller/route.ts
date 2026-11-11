import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
export const dynamic="force-dynamic";export const runtime="nodejs";
const h={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
export async function GET(){
 const db=createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:h});
 const {data,error}=await db.from("sasi_market_sellers")
 .select("user_id,display_name,status,kyc_status,payout_provider,created_at").eq("user_id",user.id).maybeSingle();
 if(error)return NextResponse.json({error:"SELLER_SERVICE_NOT_READY"},{status:503,headers:h});
 return NextResponse.json({profile:data},{headers:h});
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:h});
 const db=createClient();const {data:{user}}=await db.auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"VERIFIED_ACCOUNT_REQUIRED"},{status:401,headers:h});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-market-seller-apply",userId:user.id,accountLimit:5,ipLimit:30});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:h});
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return NextResponse.json({error:"INVALID_JSON"},{status:400,headers:h});}
 const displayName=typeof body.displayName==="string"?body.displayName.trim():"";
 if(displayName.length<2||displayName.length>60||body.adultConfirmed!==true||body.termsAccepted!==true)
  return NextResponse.json({error:"SELLER_TERMS_OR_AGE_REQUIRED"},{status:400,headers:h});
 const {data:existing}=await db.from("sasi_market_sellers").select("user_id,display_name,status").eq("user_id",user.id).maybeSingle();
 if(existing)return NextResponse.json({profile:existing,alreadyApplied:true},{headers:h});
 const {data,error}=await db.from("sasi_market_sellers")
  .insert({user_id:user.id,display_name:displayName})
  .select("user_id,display_name,status").single();
 if(error)return NextResponse.json({error:"SELLER_APPLICATION_UNAVAILABLE"},{status:503,headers:h});
 return NextResponse.json({profile:data},{status:201,headers:h});
}
