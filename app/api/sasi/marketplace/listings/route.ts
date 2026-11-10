import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {createAdminClient} from "@/lib/supabase/admin";
import {editableMarketplaceListing,validatedMarketplaceDraft} from "@/lib/sasi-marketplace/listing-draft";
export const dynamic="force-dynamic";export const runtime="nodejs";
const nocache={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"} as const;
const CATEGORIES=["mt5-ea","mt5-indicator","automation","desktop-app","developer-tool","software"] as const;
function validMinor(v:unknown){return typeof v==="number"&&Number.isSafeInteger(v)&&v>=100&&v<=1_000_000_000;}
export async function GET(req:NextRequest){
 try{
  const db=createClient();
  const mode=req.nextUrl.searchParams.get("mode")==="mine"?"mine":"public";
  const fields="id,seller_id,title,description,category,price_cny_minor,price_usd_minor,status,scan_status,published_at,created_at";
  let query=db.from("sasi_market_listings").select(mode==="mine"?fields+",rejection_reason":fields)
    .order("created_at",{ascending:false}).limit(36);
  if(mode==="mine"){
   const {data:{user}}=await db.auth.getUser();
   if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:nocache});
   query=query.eq("seller_id",user.id);
  }else query=query.eq("status","published").eq("scan_status","clean");
  const {data,error}=await query;
  if(error)throw Error("LISTINGS_QUERY_FAILED");
  // Public cards and hover previews are excerpts; the product endpoint serves the full long description.
  // Keep the public JSON compact even when a seller writes a 5,000-character description.
  const items=mode==="public"?(data||[]).map(item=>({...item,description:item.description.slice(0,800)})):data||[];
  return NextResponse.json({items},{headers:nocache});
 }catch{return NextResponse.json({items:[],error:"MARKET_LISTINGS_UNAVAILABLE"},{status:503,headers:nocache});}
}

export async function PATCH(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:nocache});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"VERIFIED_ACCOUNT_REQUIRED"},{status:401,headers:nocache});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-market-edit",userId:user.id,accountLimit:30,ipLimit:90});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:nocache});
 const body=await req.json().catch(()=>null);
 const id=String(body?.listingId||"");
 const values=body&&validatedMarketplaceDraft(body);
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)||!values)
  return NextResponse.json({error:"INVALID_LISTING"},{status:400,headers:nocache});
 try{
  const admin=createAdminClient();
  const {data:seller}=await admin.from("sasi_market_sellers").select("status").eq("user_id",user.id).maybeSingle();
  if(seller?.status!=="approved")return NextResponse.json({error:"SELLER_NOT_APPROVED"},{status:403,headers:nocache});
  const {data:listing}=await admin.from("sasi_market_listings").select("seller_id,status").eq("id",id).eq("seller_id",user.id).maybeSingle();
  if(!editableMarketplaceListing(user.id,listing))return NextResponse.json({error:"DRAFT_OR_REJECTED_REQUIRED"},{status:409,headers:nocache});
  const {data,error}=await admin.from("sasi_market_listings")
   .update({...values,status:"draft",rejection_reason:null})
   .eq("id",id).eq("seller_id",user.id).in("status",["draft","rejected"])
   .select("id,title,status").maybeSingle();
  if(error||!data)return NextResponse.json({error:"LISTING_STATE_CHANGED"},{status:409,headers:nocache});
  return NextResponse.json({item:data},{headers:nocache});
 }catch{return NextResponse.json({error:"LISTING_EDIT_UNAVAILABLE"},{status:503,headers:nocache});}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:nocache});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"VERIFIED_ACCOUNT_REQUIRED"},{status:401,headers:nocache});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-market-draft",userId:user.id,accountLimit:12,ipLimit:60});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:nocache});
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return NextResponse.json({error:"INVALID_JSON"},{status:400,headers:nocache});}
 const title=typeof body.title==="string"?body.title.trim():"";
 const description=typeof body.description==="string"?body.description.trim():"";
 const category=typeof body.category==="string"?body.category:"software";
 if(title.length<4||title.length>120||description.length>5000||
 !CATEGORIES.includes(category as typeof CATEGORIES[number])||
 !validMinor(body.priceCnyMinor)||!validMinor(body.priceUsdMinor))
  return NextResponse.json({error:"INVALID_LISTING"},{status:400,headers:nocache});
 try{
  const db=createClient();
  const {data,error}=await db.from("sasi_market_listings").insert({
   seller_id:user.id,title,description,category,
   price_cny_minor:body.priceCnyMinor,price_usd_minor:body.priceUsdMinor
  }).select("id,title,status,created_at").single();
  if(error||!data)return NextResponse.json({error:"SELLER_REGISTRATION_OR_LISTING_REQUIRED"},{status:403,headers:nocache});
  return NextResponse.json({item:data},{status:201,headers:nocache});
 }catch{return NextResponse.json({error:"MARKET_NOT_YET_LIVE"},{status:503,headers:nocache});}
}
