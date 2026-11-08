import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {marketProductUuid} from "@/lib/sasi-marketplace/fees";
import {wechatPayEnabled} from "@/lib/wechatpay";
import {alipayEnabled} from "@/lib/alipay";
import {marketplaceCommerceReady} from "@/lib/sasi-marketplace/checkout";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const id=marketProductUuid(req.nextUrl.searchParams.get("id")||"");
 if(!id)return NextResponse.json({error:"INVALID_PRODUCT"},{status:400,headers:{"Cache-Control":"no-store"}});
 try{
  const db=createClient();
  const {data:r,error}=await db.from("sasi_market_listings")
   .select("id,title,description,price_cny_minor,price_usd_minor,status,scan_status")
   .eq("id",id).eq("status","published").eq("scan_status","clean").single();
  if(error||!r)return NextResponse.json({error:"PRODUCT_NOT_FOUND"},{status:404,headers:{"Cache-Control":"no-store"}});
  return NextResponse.json({product:{
   id:"sasi-market:"+r.id,name:r.title,nameEn:r.title,priceRmb:r.price_cny_minor/100,
   priceUsd:r.price_usd_minor/100,type:"permanent",group:"market",note:r.description,noteEn:r.description
  },available:marketplaceCommerceReady()&&
     (req.nextUrl.searchParams.get("currency")==="USD"?
      process.env.PAYPAL_ENABLED==="true"&&Boolean(process.env.PAYPAL_CLIENT_ID&&process.env.PAYPAL_CLIENT_SECRET&&process.env.PAYPAL_WEBHOOK_ID):
      (wechatPayEnabled()||alipayEnabled()))
  },{headers:{"Cache-Control":"private,no-store"}});
 }catch{return NextResponse.json({error:"MARKET_UNAVAILABLE"},{status:503,headers:{"Cache-Control":"no-store"}});}
}
