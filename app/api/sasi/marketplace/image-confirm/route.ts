import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {isSameOriginMutation} from "@/lib/sasi/request-security";
import {enforceAbuseGuard} from "@/lib/security/abuse-guard";
import {marketplaceObjectHead,marketplaceOwnedKey,marketplaceUploadLimit,
  marketplaceR2Ready} from "@/lib/sasi-marketplace/r2";
export const dynamic="force-dynamic";export const runtime="nodejs";
const h={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_ORIGIN"},{status:403,headers:h});
 if(!marketplaceR2Ready())
 return NextResponse.json({error:"IMAGE_STORAGE_NOT_READY"},{status:503,headers:h});
 const {data:{user}}=await createClient().auth.getUser();
 if(!user?.email_confirmed_at)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:h});
 const guard=await enforceAbuseGuard(req,{scope:"sasi-market-photo-confirm",userId:user.id,accountLimit:40,ipLimit:100});
 if(!guard.ok)return NextResponse.json({error:guard.error},{status:guard.status,headers:h});
 const b=await req.json().catch(()=>null),id=String(b?.imageId||"");
 if(!uuid.test(id))return NextResponse.json({error:"INVALID_IMAGE"},{status:400,headers:h});
 try{
  const admin=createAdminClient();
  const {data:media,error}=await admin.from("sasi_market_media")
    .select("id,listing_id,kind,object_key,status,declared_size")
    .eq("id",id).eq("seller_id",user.id).single();
  if(error||!media||media.status!=="pending")
   return NextResponse.json({error:"IMAGE_NOT_PENDING"},{status:409,headers:h});
  const key=marketplaceOwnedKey(user.id,media.listing_id,media.object_key);
  if(!key.includes("/images/"))throw Error("NOT_AN_IMAGE");
  const head=await marketplaceObjectHead(key);
  if(!head||head.size>marketplaceUploadLimit(media.kind as "cover"|"detail")||head.size>media.declared_size)
   return NextResponse.json({error:"IMAGE_INVALID_SIZE"},{status:400,headers:h});
  const {data:updated,error:saveError}=await admin.from("sasi_market_media")
    .update({verified_size:head.size,status:"awaiting_review"})
    .eq("id",id).eq("seller_id",user.id).eq("status","pending").select("id,status").maybeSingle();
  if(saveError||!updated)throw Error("IMAGE_CONFLICT");
  return NextResponse.json({image:updated,public:false},{headers:h});
 }catch{return NextResponse.json({error:"IMAGE_CONFIRM_UNAVAILABLE"},{status:503,headers:h});}
}
