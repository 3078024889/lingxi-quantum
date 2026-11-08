import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {marketplaceR2Ready,signedMarketplaceDownload,marketplaceObjectHead} from "@/lib/sasi-marketplace/r2";
export const dynamic="force-dynamic";export const runtime="nodejs";
const h={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:h});
 if(process.env.SASI_MARKET_DELIVERY_ENABLED!=="true"||!marketplaceR2Ready())
  return NextResponse.json({error:"DELIVERY_NOT_OPEN"},{status:503,headers:h});
 const db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:h});
 const abuse=await enforceAbuseGuard(req,{scope:"sasi-market-download",userId:user.id,accountLimit:40,ipLimit:120});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status,headers:h});
 const b=await req.json().catch(()=>null);
 if(!UUID.test(String(b?.orderId||"")))return NextResponse.json({error:"INVALID_ORDER"},{status:400,headers:h});
 try{
  const admin=createAdminClient();
  const {data:sale,error:saleError}=await admin.from("sasi_market_sales")
    .select("order_id,listing_id,status").eq("order_id",b.orderId).eq("buyer_id",user.id).single();
  if(saleError||!sale||!["held","available"].includes(sale.status))
    return NextResponse.json({error:"NOT_ENTITLED"},{status:403,headers:h});
  const {data:order}=await admin.from("orders").select("status").eq("id",sale.order_id).eq("user_id",user.id).single();
  if(order?.status!=="paid")return NextResponse.json({error:"PAYMENT_NOT_VERIFIED"},{status:403,headers:h});
  const {data:listing,error:listingError}=await admin.from("sasi_market_listings")
   .select("seller_id,delivery_path,sha256,scan_status,status")
   .eq("id",sale.listing_id).single();
  if(listingError||listing?.scan_status!=="clean"||!listing.delivery_path||
   !listing.sha256||listing.status!=="published")throw Error("FILE_NOT_CLEARED");
  const prefix=`sasi/${listing.seller_id}/market/${sale.listing_id}/approved/`;
  if(!listing.delivery_path.startsWith(prefix)||!listing.delivery_path.endsWith(".zip"))
   throw Error("UNAPPROVED_FILE_PATH");
  const head=await marketplaceObjectHead(listing.delivery_path);
  if(!head||head.size>30*1024*1024)throw Error("FILE_UNAVAILABLE");
  const downloadUrl=signedMarketplaceDownload(listing.delivery_path,60);
  const {data:grant,error:grantError}=await db.rpc("sasi_market_claim_download",{p_order_id:sale.order_id});
  if(grantError)throw Error("DOWNLOAD_AUTH_NOT_READY");
  if(!grant?.ok)return NextResponse.json({error:grant?.error||"DOWNLOAD_LIMIT"},{status:403,headers:h});
  return NextResponse.json({downloadUrl,sha256:listing.sha256,
    expiresInSeconds:60,remaining:grant.remaining},{headers:h});
 }catch{return NextResponse.json({error:"DOWNLOAD_NOT_READY"},{status:503,headers:h});}
}
