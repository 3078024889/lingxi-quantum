import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {marketplaceR2Ready,marketplaceObjectHead,marketplaceOwnedKey,marketplaceUploadLimit} from "@/lib/sasi-marketplace/r2";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {dispatchMarketplaceScan} from "@/lib/sasi-marketplace/dispatch-scan";
export const runtime="nodejs";export const dynamic="force-dynamic";
const h={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:h});
 if(!marketplaceR2Ready())
  return NextResponse.json({error:"UPLOAD_SCANNING_NOT_READY"},{status:503,headers:h});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:h});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-market-submit",userId:user.id,accountLimit:15,ipLimit:40});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:h});
 const body=await req.json().catch(()=>null);
 if(!UUID.test(String(body?.listingId||"")))return NextResponse.json({error:"INVALID_LISTING"},{status:400,headers:h});
 try{
  const admin=createAdminClient();
  const {data:seller}=await admin.from("sasi_market_sellers").select("status").eq("user_id",user.id).single();
  if(seller?.status!=="approved")return NextResponse.json({error:"SELLER_NOT_APPROVED"},{status:403,headers:h});
  const {data:listing}=await admin.from("sasi_market_listings")
   .select("id,status,quarantine_path").eq("id",body.listingId).eq("seller_id",user.id).single();
  if(!listing||listing.status!=="draft"||!listing.quarantine_path)
   return NextResponse.json({error:"UPLOAD_TOKEN_REQUIRED"},{status:409,headers:h});
  const path=marketplaceOwnedKey(user.id,listing.id,String(listing.quarantine_path));
  if(!path.includes("/quarantine/")||!path.endsWith(".zip"))throw Error("NOT_A_PRIVATE_ZIP");
  const info=await marketplaceObjectHead(path);
  if(!info||info.size>marketplaceUploadLimit("software"))
   return NextResponse.json({error:"FILE_MISSING_OR_TOO_LARGE"},{status:400,headers:h});
  // HEAD MIME/extension is not a trust decision. Independent scanning and
  // validated object hash must succeed before an admin can approve delivery.
  const {data:saved,error:savedError}=await admin.from("sasi_market_listings").update({
   status:"submitted",file_size_bytes:info.size,scan_status:"unscanned"
  }).eq("id",listing.id).eq("seller_id",user.id).eq("status","draft")
    .select("id,status").maybeSingle();
  if(savedError||!saved)throw Error("SUBMISSION_CONFLICT");
  const scanDispatched=await dispatchMarketplaceScan(saved.id);
  return NextResponse.json({item:saved,scanQueued:scanDispatched,scanDispatched,published:false},{headers:h});
 }catch{return NextResponse.json({error:"SUBMISSION_REQUIRES_MANUAL_REVIEW"},{status:503,headers:h});}
}
