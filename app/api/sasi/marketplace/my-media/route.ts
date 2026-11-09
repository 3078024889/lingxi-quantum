import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const dynamic="force-dynamic";export const runtime="nodejs";
const headers={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(req:NextRequest){
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers});
 const raw=req.nextUrl.searchParams.get("listingIds")||"";
 const ids=[...new Set(raw.split(",").filter(id=>UUID.test(id)))];
 if(ids.length<1||ids.length>36||raw.length>1600)
  return NextResponse.json({error:"INVALID_LISTINGS"},{status:400,headers});
 try{
  const admin=createAdminClient();
  // Never expose object keys, upload signatures or another seller's pending media.
  const {data,error}=await admin.from("sasi_market_media")
   .select("listing_id,kind,status")
   .eq("seller_id",user.id).in("listing_id",ids)
   .neq("status","rejected").limit(180);
  if(error)throw Error("MEDIA_READ_FAILED");
  const counts:Record<string,{cover:number;detail:number}>={};
  for(const id of ids)counts[id]={cover:0,detail:0};
  for(const photo of data||[]){
   const row=counts[photo.listing_id];
   if(row&&photo.kind==="cover")row.cover++;
   if(row&&photo.kind==="detail")row.detail++;
  }
  return NextResponse.json({counts},{headers});
 }catch{return NextResponse.json({error:"SELLER_MEDIA_UNAVAILABLE"},{status:503,headers});}
}
