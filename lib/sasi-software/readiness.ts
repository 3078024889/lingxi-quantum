import "server-only";
import {createAdminClient,isSupabaseAdminConfigured} from "@/lib/supabase/admin";
import {softwareOffer} from "./catalog";
export async function softwareCheckoutReady(productId:string):Promise<boolean>{
  if(process.env.SOFTWARE_COMMERCE_READY!=="true" || !softwareOffer(productId) || !isSupabaseAdminConfigured())return false;
  try{
    const {data,error}=await createAdminClient().from("sasi_software_packages")
      .select("product_id,price_cny,price_usd,sale_ready,verified_at,sha256")
      .eq("product_id",productId).single();
    const item=softwareOffer(productId);
    return !error && Boolean(item&&data?.sale_ready&&data.verified_at&&data.sha256&&!/^0{64}$/.test(data.sha256)
      && Number(data.price_cny)===item.priceCny && Number(data.price_usd)===item.priceUsd);
  }catch{return false;}
}
