import {NextRequest,NextResponse} from "next/server";
import sharp from "sharp";
import {moneyAdministrator} from "@/lib/money/operator-settings";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {marketplaceObjectHead,marketplaceOwnedKey,signedMarketplaceDownload} from "@/lib/sasi-marketplace/r2";
import {dispatchMarketplaceScan} from "@/lib/sasi-marketplace/dispatch-scan";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const headers={"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"} as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type Action="seller.approve"|"seller.suspend"|"media.approve"|"media.reject"|"listing.publish"|"listing.reject"|"listing.rescan";
function respond(value:unknown,status=200){return NextResponse.json(value,{status,headers});}

async function reviewer(){
 try{return await moneyAdministrator();}catch{return null;}
}

export async function GET(){
 const user=await reviewer();
 if(!user)return respond({error:"NOT_FOUND"},404);
 try{
  const admin=createAdminClient();
  const [sellers,listings,media,events]=await Promise.all([
   admin.from("sasi_market_sellers").select("user_id,display_name,status,kyc_status,created_at")
    .eq("status","pending_review").order("created_at",{ascending:true}).limit(50),
   admin.from("sasi_market_listings").select("id,seller_id,title,category,description,status,scan_status,sha256,file_size_bytes,delivery_path,created_at,price_cny_minor,price_usd_minor,rejection_reason")
    .eq("status","submitted").order("created_at",{ascending:true}).limit(50),
   admin.from("sasi_market_media").select("id,listing_id,seller_id,kind,object_key,status,verified_size,declared_mime,created_at")
    .eq("status","awaiting_review").order("created_at",{ascending:true}).limit(80),
   admin.from("sasi_market_review_events").select("id,subject_type,subject_id,action,reason,created_at")
    .order("created_at",{ascending:false}).limit(30)
  ]);
  if(sellers.error||listings.error||media.error||events.error)
   return respond({error:"REVIEW_DATABASE_NOT_READY"},503);
  const pictures=media.data??[];
  const previews=pictures.map(x=>{
   try{
    const key=marketplaceOwnedKey(x.seller_id,x.listing_id,x.object_key);
    if(!key.includes("/images/"))throw Error("IMAGE_PATH_INVALID");
    return {id:x.id,listingId:x.listing_id,kind:x.kind,status:x.status,
      previewUrl:signedMarketplaceDownload(key,90),createdAt:x.created_at};
   }catch{return{id:x.id,listingId:x.listing_id,kind:x.kind,status:x.status,previewUrl:null};}
  });
  return respond({sellers:sellers.data??[],listings:(listings.data??[]).map(({delivery_path,...x})=>({
   ...x,approvedArtifactReady:Boolean(delivery_path)
  })),media:previews,events:events.data??[]});
 }catch{return respond({error:"REVIEW_QUEUE_UNAVAILABLE"},503);}
}

export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return respond({error:"INVALID_ORIGIN"},403);
 const user=await reviewer();
 if(!user)return respond({error:"NOT_FOUND"},404);
 const rate=await enforceAbuseGuard(req,{scope:"sasi-market-admin-review",userId:user.id,accountLimit:150,ipLimit:250});
 if(!rate.ok)return respond({error:rate.error},rate.status);
 const b=await req.json().catch(()=>null);
 const action=String(b?.action??"") as Action;
 const targetId=String(b?.targetId??"");
 const reason=typeof b?.reason==="string"?b.reason.trim():"";
 if(!UUID.test(targetId)||reason.length>500||
 !["seller.approve","seller.suspend","media.approve","media.reject","listing.publish","listing.reject","listing.rescan"].includes(action))
   return respond({error:"INVALID_REVIEW"},400);
 if(action.endsWith(".reject")||action==="seller.suspend"){
  if(reason.length<8)return respond({error:"REVIEW_REASON_REQUIRED"},400);
 }
 try{
  const admin=createAdminClient();
  if(action==="listing.rescan"){
   const {data:listing}=await admin.from("sasi_market_listings")
    .select("id,status,scan_status").eq("id",targetId).single();
   if(!listing||listing.status!=="submitted"||listing.scan_status!=="unscanned")
    return respond({error:"SCAN_NOT_PENDING"},409);
   const dispatched=await dispatchMarketplaceScan(targetId);
   return dispatched?respond({ok:true,status:"queued"}):respond({error:"SCANNER_DISPATCH_NOT_CONFIGURED"},503);
  }
  if(action==="media.approve"){
   const {data:media,error}=await admin.from("sasi_market_media")
    .select("id,listing_id,seller_id,object_key,verified_size,declared_mime,status,created_at")
    .eq("id",targetId).single();
   if(error||!media||media.status!=="awaiting_review")return respond({error:"MEDIA_NOT_READY"},409);
   // Seller upload signatures live for 180s. Wait for expiration before review,
   // so the original signed PUT cannot replace an approved image afterward.
   const uploadAge=Date.now()-new Date(media.created_at).getTime();
   if(!Number.isFinite(uploadAge)||uploadAge<330_000)
    return respond({error:"IMAGE_UPLOAD_LINK_STILL_VALID"},409);
   const key=marketplaceOwnedKey(media.seller_id,media.listing_id,media.object_key);
   if(!key.includes("/images/"))return respond({error:"IMAGE_PATH_INVALID"},409);
   const remote=await fetch(signedMarketplaceDownload(key,45),{
    cache:"no-store",signal:AbortSignal.timeout(10000)
   });
   if(!remote.ok)return respond({error:"PRIVATE_IMAGE_NOT_AVAILABLE"},409);
   const size=Number(remote.headers.get("content-length")||0);
   if(size<1||size>1_048_576||size!==Number(media.verified_size))
     return respond({error:"IMAGE_SIZE_CHANGED"},409);
   const blob=Buffer.from(await remote.arrayBuffer());
   if(blob.length!==size)return respond({error:"IMAGE_BODY_SIZE_CHANGED"},409);
   const meta=await sharp(blob,{limitInputPixels:20_000_000,failOn:"error"}).metadata();
   const formatMime:Record<string,string>={png:"image/png",jpeg:"image/jpeg",webp:"image/webp"};
   if(!meta.format||formatMime[meta.format]!==media.declared_mime||
      !meta.width||!meta.height||meta.width>8000||meta.height>8000)
     return respond({error:"IMAGE_FORMAT_INVALID"},409);
  }
  if(action==="listing.publish"){
   const {data:listing,error}=await admin.from("sasi_market_listings")
    .select("id,seller_id,delivery_path,file_size_bytes,scan_status,status").eq("id",targetId).single();
   if(error||!listing||listing.status!=="submitted"||listing.scan_status!=="clean"||!listing.delivery_path)
    return respond({error:"VERIFIED_SCAN_REQUIRED"},409);
   const owned=marketplaceOwnedKey(listing.seller_id,listing.id,listing.delivery_path);
   if(!owned.includes("/approved/")||!owned.endsWith(".zip"))
    return respond({error:"APPROVED_OBJECT_REQUIRED"},409);
   const head=await marketplaceObjectHead(owned);
   if(!head||head.size!==Number(listing.file_size_bytes)||head.size>30*1024*1024)
    return respond({error:"APPROVED_OBJECT_UNAVAILABLE"},409);
  }
  const group=action.split(".")[0];
  const rpc=group==="seller"?"sasi_market_review_seller":
   group==="media"?"sasi_market_review_media":"sasi_market_review_listing";
  const params=group==="seller"?{p_seller_id:targetId,p_actor_id:user.id,p_action:action.split(".")[1],p_reason:reason}:
   group==="media"?{p_media_id:targetId,p_actor_id:user.id,p_action:action.split(".")[1],p_reason:reason}:
    {p_listing_id:targetId,p_actor_id:user.id,p_action:action.split(".")[1],p_reason:reason};
  const {data,error}=await admin.rpc(rpc,params);
  if(error)return respond({error:"REVIEW_TRANSACTION_UNAVAILABLE"},503);
  if(!data?.ok)return respond({error:data?.error||"REVIEW_REJECTED"},409);
  return respond({ok:true,status:data.status});
 }catch{return respond({error:"REVIEW_NOT_COMPLETED"},503);}
}
