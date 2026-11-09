import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
export const dynamic="force-dynamic";export const runtime="nodejs";
const nocache={"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"} as const;
const CATEGORIES=["mt5-ea","mt5-indicator","automation","desktop-app","developer-tool","software"] as const;
function validMinor(v:unknown){return typeof v==="number"&&Number.isSafeInteger(v)&&v>=100&&v<=1_000_000_000;}
export async function GET(req:NextRequest){
 try{
  const db=createClient();
  const mode=req.nextUrl.searchParams.get("mode")==="mine"?"mine":"public";
  let query=db.from(mode==="public"?"sasi_market_public_cards":"sasi_market_listings").select("id,seller_id,title,description,category,price_cny_minor,price_usd_minor,status,scan_status,published_at,created_at")
    .order("created_at",{ascending:false}).limit(36);
  if(mode==="mine"){
   const {data:{user}}=await db.auth.getUser();
   if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:nocache});
   query=query.eq("seller_id",user.id);
  }else query=query.eq("status","published").eq("scan_status","clean");
  const {data,error}=await query;
  if(error)throw Error("LISTINGS_QUERY_FAILED");
  // Public cards and hover previews are excerpts; the product endpoint serves the full long description.
  // Keep the public JSON compact even when a seller writes a 100,000-character description.
  const items=mode==="public"?(data||[]).map(item=>({...item,description:item.description.slice(0,800)})):data||[];
  return NextResponse.json({items},{headers:nocache});
 }catch{return NextResponse.json({items:[],error:"MARKET_LISTINGS_UNAVAILABLE"},{status:503,headers:nocache});}
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
 if(title.length<4||title.length>120||description.length>100000||
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
