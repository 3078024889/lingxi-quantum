import "server-only";
import {createAdminClient} from "@/lib/supabase/admin";
import {marketProductUuid} from "./fees";
import {marketplaceR2Ready} from "./r2";
import {wechatPayEnabled} from "@/lib/wechatpay";
import {alipayEnabled} from "@/lib/alipay";
import type {Product} from "@/lib/plans";

export async function resolveMarketplaceProduct(productId:string):Promise<(Product&{sellerId:string})|null>{
 const id=marketProductUuid(productId);
 if(!id||!marketplaceR2Ready()||!(wechatPayEnabled()||alipayEnabled()))return null;
 try{
  const db=createAdminClient();
  const {data:item,error}=await db.from("sasi_market_listings")
   .select("id,seller_id,title,description,price_cny_minor,price_usd_minor,status,scan_status,delivery_path,sha256")
   .eq("id",id).eq("status","published").eq("scan_status","clean").single();
  if(error||!item||!item.delivery_path||!item.sha256)return null;
  const {data:seller}=await db.from("sasi_market_sellers")
   .select("status").eq("user_id",item.seller_id).single();
  if(seller?.status!=="approved")return null;
  if(!Number.isSafeInteger(Number(item.price_cny_minor))||!Number.isSafeInteger(Number(item.price_usd_minor)))return null;
  return {
   id:productId,name:item.title,nameEn:item.title,
   priceRmb:Number(item.price_cny_minor)/100,
   priceUsd:Number(item.price_usd_minor)/100,
   type:"permanent",group:"market",
   note:item.description||"私有软件交付",noteEn:item.description||"Private software delivery",
   sellerId:item.seller_id,
  };
 }catch{return null;}
}
