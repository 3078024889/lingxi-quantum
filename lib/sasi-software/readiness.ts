import "server-only";
import {createAdminClient,isSupabaseAdminConfigured} from "@/lib/supabase/admin";
import {softwareOffer} from "./catalog";
export async function softwareCheckoutReady(productId:string):Promise<boolean>{
 if(process.env.SOFTWARE_COMMERCE_READY!=="true"||!softwareOffer(productId)||!isSupabaseAdminConfigured())return false;
 try{
  const admin=createAdminClient();
  const {data,error}=await admin.from("sasi_software_packages")
   .select("product_id,price_cny,price_usd,sale_ready,verified_at,sha256,bucket,object_path")
   .eq("product_id",productId).single();
  const item=softwareOffer(productId);
  if(error||!item||!data?.sale_ready||!data.verified_at||!data.sha256||/^0{64}$/.test(data.sha256)
    ||Number(data.price_cny)!==item.priceCny||Number(data.price_usd)!==item.priceUsd
    ||data.bucket!=="sasi-software-delivery"||!data.object_path||data.object_path.startsWith("/")||data.object_path.includes(".."))return false;
  const split=data.object_path.lastIndexOf("/");
  const folder=split>=0?data.object_path.slice(0,split):"";
  const fileName=split>=0?data.object_path.slice(split+1):data.object_path;
  if(!fileName.endsWith(".zip"))return false;
  const {data:objects,error:storageError}=await admin.storage.from(data.bucket).list(folder,{
   limit:20,search:fileName
  });
  if(storageError||!objects?.some(x=>x.name===fileName&&Number(x.metadata?.size||0)>0))return false;
  return true;
 }catch{return false;}
}
