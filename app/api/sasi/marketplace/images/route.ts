import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {marketplaceR2Ready,signedMarketplaceDownload} from "@/lib/sasi-marketplace/r2";
export const dynamic="force-dynamic";export const runtime="nodejs";
const h={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function GET(req:NextRequest){
 const raw=req.nextUrl.searchParams.get("listingIds")||req.nextUrl.searchParams.get("listingId")||"";
 const ids=[...new Set(raw.split(",").filter(v=>uuid.test(v)))];
 if(ids.length===0||ids.length>36||raw.length>1600)return NextResponse.json({error:"INVALID_LISTINGS"},{status:400,headers:h});
 if(!marketplaceR2Ready())return NextResponse.json({items:{},privateR2Unavailable:true},{headers:h});
 try{
  const db=createClient();
  // RLS guarantees anonymous read only for approved images of published listings.
  const {data,error}=await db.from("sasi_market_media")
   .select("id,listing_id,kind,object_key,status")
   .in("listing_id",ids).eq("status","approved").limit(180);
  if(error)throw Error("PUBLIC_IMAGES_UNAVAILABLE");
  const items:Record<string,Array<{id:string,kind:string,url:string}>>={};
  for(const image of data||[]){
    if(!/^sasi\/[0-9a-f-]+\/market\/[0-9a-f-]+\/images\/[0-9a-f-]+\.(png|jpg|webp)$/i.test(image.object_key))continue;
    (items[image.listing_id]??=[]).push({
     id:image.id,kind:image.kind,url:signedMarketplaceDownload(image.object_key,120)
    });
  }
  return NextResponse.json({items,expiresInSeconds:120},{headers:h});
 }catch{return NextResponse.json({error:"IMAGES_UNAVAILABLE"},{status:503,headers:h});}
}
