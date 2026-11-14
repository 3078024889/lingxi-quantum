import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
export const dynamic="force-dynamic";export const runtime="nodejs";
const headers={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type MediaSlot={id:string;kind:string;status:string};
export async function GET(req:NextRequest){
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers});
 const raw=req.nextUrl.searchParams.get("listingIds")||"";
 const ids=[...new Set(raw.split(",").filter(id=>UUID.test(id)))];
 if(ids.length<1||ids.length>36||raw.length>1600)
  return NextResponse.json({error:"INVALID_LISTINGS"},{status:400,headers});
 try{
  const admin=createAdminClient();
  // Seller only: never expose private object keys, signed URLs or other sellers' drafts.
  const {data,error}=await admin.from("sasi_market_media")
   .select("id,listing_id,kind,status")
   .eq("seller_id",user.id).in("listing_id",ids)
   .neq("status","rejected").order("created_at",{ascending:true}).limit(288);
  if(error)throw Error("MEDIA_READ_FAILED");
  const counts:Record<string,{cover:number;detail:number}>={};
  const items:Record<string,MediaSlot[]>={};
  for(const id of ids){counts[id]={cover:0,detail:0};items[id]=[]}
  for(const photo of data||[]){
   const count=counts[photo.listing_id],bucket=items[photo.listing_id];
   if(!count||!bucket)continue;
   if(photo.kind==="cover")count.cover++;
   if(photo.kind==="detail")count.detail++;
   bucket.push({id:photo.id,kind:photo.kind,status:photo.status});
  }
  return NextResponse.json({counts,items},{headers});
 }catch{return NextResponse.json({error:"SELLER_MEDIA_UNAVAILABLE"},{status:503,headers});}
}
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"VERIFIED_ACCOUNT_REQUIRED"},{status:401,headers});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-market-media-withdraw",userId:user.id,accountLimit:40,ipLimit:100});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers});
 const body=await req.json().catch(()=>null),id=String(body?.imageId||"");
 if(body?.action!=="withdraw"||!UUID.test(id))
  return NextResponse.json({error:"INVALID_MEDIA_ACTION"},{status:400,headers});
 try{
  const admin=createAdminClient();
  const {data:photo,error}=await admin.from("sasi_market_media")
   .select("id,listing_id,status").eq("id",id).eq("seller_id",user.id).maybeSingle();
  if(error||!photo||photo.status==="rejected")return NextResponse.json({error:"IMAGE_NOT_FOUND"},{status:404,headers});
  const {data:listing}=await admin.from("sasi_market_listings")
   .select("id,status").eq("id",photo.listing_id).eq("seller_id",user.id).maybeSingle();
  if(listing?.status!=="draft")return NextResponse.json({error:"DRAFT_REQUIRED"},{status:409,headers});
  // Tombstone: pending presigned uploads can no longer become published media.
  const {data:updated,error:updateError}=await admin.from("sasi_market_media")
   .update({status:"rejected"}).eq("id",photo.id).eq("seller_id",user.id)
   .eq("status",photo.status).select("id").maybeSingle();
  if(updateError||!updated)return NextResponse.json({error:"IMAGE_STATE_CHANGED"},{status:409,headers});
  return NextResponse.json({ok:true,withdrawnImageId:id},{headers});
 }catch{return NextResponse.json({error:"IMAGE_WITHDRAW_UNAVAILABLE"},{status:503,headers});}
}
