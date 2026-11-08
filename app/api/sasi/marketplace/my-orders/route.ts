import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
export const dynamic="force-dynamic";export const runtime="nodejs";
const h={"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff"} as const;
export async function GET(){
 const db=createClient(),{data:{user}}=await db.auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:h});
 try{
  const admin=createAdminClient();
  const {data:sales,error}=await admin.from("sasi_market_sales")
    .select("order_id,listing_id,download_count,status,created_at")
    .eq("buyer_id",user.id).in("status",["held","available"])
    .order("created_at",{ascending:false}).limit(80);
  if(error)throw Error("SALES_READ_FAILED");
  const ids=(sales||[]).map(x=>x.order_id);
  if(ids.length===0)return NextResponse.json({items:[]},{headers:h});
  const listingIds=[...new Set((sales||[]).map(x=>x.listing_id))];
  const [orders,listings]=await Promise.all([
   admin.from("orders").select("id,status,product_id,paid_at").eq("user_id",user.id).in("id",ids),
   admin.from("sasi_market_listings").select("id,title,sha256,scan_status,delivery_path").in("id",listingIds)
  ]);
  if(orders.error||listings.error)throw Error("ENTITLEMENT_VERIFY_FAILED");
  const paid=new Set((orders.data||[]).filter(x=>x.status==="paid"&&x.paid_at).map(x=>x.id));
  const listingIndex=new Map((listings.data||[]).map(x=>[x.id,x]));
  const items=(sales||[]).filter(s=>paid.has(s.order_id)).map(s=>{
   const listing=listingIndex.get(s.listing_id);
   if(!listing||listing.scan_status!=="clean"||!listing.delivery_path||!listing.sha256)return null;
   return {orderId:s.order_id,productId:"sasi-market:"+s.listing_id,title:listing.title,
    remaining:Math.max(0,10-s.download_count),createdAt:s.created_at,paid:true};
  }).filter(Boolean);
  return NextResponse.json({items},{headers:h});
 }catch{return NextResponse.json({error:"SELLER_SOFTWARE_ORDERS_UNAVAILABLE"},{status:503,headers:h});}
}
