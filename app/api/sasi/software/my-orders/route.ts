import {NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {createAdminClient} from "@/lib/supabase/admin";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const {data:{user}}=await createClient().auth.getUser();
 if(!user)return NextResponse.json({error:"LOGIN_REQUIRED"},{status:401,headers:{"Cache-Control":"private,no-store"}});
 try{
  const admin=createAdminClient();
  const ids=SASI_SOFTWARE_CATALOG.map(x=>x.id);
  const {data:orders,error}=await admin.from("orders").select("id,product_id,status,created_at")
   .eq("user_id",user.id).in("product_id",ids).order("created_at",{ascending:false}).limit(60);
  if(error)throw Error("ORDERS_UNAVAILABLE");
  const {data:entitlements,error:entError}=await admin.from("sasi_software_entitlements")
    .select("order_id,downloads,max_downloads").eq("user_id",user.id).limit(60);
  if(entError)throw Error("ENTITLEMENTS_UNAVAILABLE");
  const e=new Map((entitlements||[]).map(x=>[x.order_id,x]));
  const items=(orders||[]).map(o=>({
    id:o.id,productId:o.product_id,status:o.status,createdAt:o.created_at,
    delivered:Boolean(e.has(o.id)),downloads:e.get(o.id)?.downloads??0,maxDownloads:e.get(o.id)?.max_downloads??0
  }));
  return NextResponse.json({items},{headers:{"Cache-Control":"private,no-store"}});
 }catch{return NextResponse.json({error:"SOFTWARE_ORDERS_UNAVAILABLE"},{status:503,headers:{"Cache-Control":"private,no-store"}});}
}
