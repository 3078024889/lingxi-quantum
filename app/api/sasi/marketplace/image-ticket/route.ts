import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {newMarketplaceObjectKey,marketplaceMime,marketplaceR2Ready,
  marketplaceUploadLimit,signedMarketplaceUpload,MARKET_MEDIA_IMAGE_LIMIT} from "@/lib/sasi-marketplace/r2";
export const runtime="nodejs";export const dynamic="force-dynamic";
const h={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:h});
 if(!marketplaceR2Ready())
  return NextResponse.json({error:"IMAGE_STORAGE_NOT_READY"},{status:503,headers:h});
 const db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"VERIFIED_ACCOUNT_REQUIRED"},{status:401,headers:h});
 const abuse=await enforceAbuseGuard(req,{scope:"sasi-market-photo",userId:user.id,accountLimit:35,ipLimit:100});
 if(!abuse.ok)return NextResponse.json({error:abuse.error},{status:abuse.status,headers:h});
 const body=await req.json().catch(()=>null);
 const listingId=String(body?.listingId||"");
 const kind=body?.kind==="cover"?"cover":body?.kind==="detail"?"detail":null;
 const extension=String(body?.extension||"").toLowerCase();
 const mime=marketplaceMime(extension);
 const size=body?.fileSize;
 if(!uuid.test(listingId)||!kind||!mime||extension==="zip"||!Number.isSafeInteger(size)||
  size<1||size>marketplaceUploadLimit(kind))
   return NextResponse.json({error:"PNG_JPEG_WEBP_MAX_1MB_PER_IMAGE"},{status:400,headers:h});
 try{
  const admin=createAdminClient();
  const {data:seller}=await admin.from("sasi_market_sellers").select("status").eq("user_id",user.id).single();
  if(seller?.status!=="approved")return NextResponse.json({error:"SELLER_NOT_APPROVED"},{status:403,headers:h});
  const {data:listing}=await admin.from("sasi_market_listings")
   .select("id,status").eq("id",listingId).eq("seller_id",user.id).single();
  if(!listing||listing.status!=="draft")return NextResponse.json({error:"DRAFT_REQUIRED"},{status:409,headers:h});
  const {count,error:countError}=await admin.from("sasi_market_media").select("id",{count:"exact",head:true})
    .eq("listing_id",listingId).neq("status","rejected");
  if(countError)throw Error("MEDIA_COUNT_FAILED");
  if((count||0)>=MARKET_MEDIA_IMAGE_LIMIT)return NextResponse.json({error:"EIGHT_IMAGES_MAX"},{status:409,headers:h});
  const {count:kindCount,error:kindError}=await admin.from("sasi_market_media")
    .select("id",{count:"exact",head:true}).eq("listing_id",listingId)
    .eq("kind",kind).neq("status","rejected");
  if(kindError)throw Error("MEDIA_KIND_COUNT_FAILED");
  if((kindCount||0)>=4)return NextResponse.json({error:kind==="cover"?"FOUR_COVERS_MAX":"FOUR_DETAILS_MAX"},{status:409,headers:h});
  const key=newMarketplaceObjectKey(user.id,listingId,kind,extension);
  const {data:reservation,error:saveError}=await admin.from("sasi_market_media").insert({
   listing_id:listingId,seller_id:user.id,kind,object_key:key,declared_mime:mime,declared_size:size
  }).select("id").single();
  if(saveError||!reservation)throw Error("MEDIA_RESERVATION_FAILED");
  return NextResponse.json({imageId:reservation.id,uploadUrl:signedMarketplaceUpload(key,180),
    contentType:mime,maxBytes:marketplaceUploadLimit(kind),expiresInSeconds:180},{headers:h});
 }catch{return NextResponse.json({error:"MEDIA_UPLOAD_UNAVAILABLE"},{status:503,headers:h});}
}
