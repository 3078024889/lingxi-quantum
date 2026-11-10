import {NextResponse} from "next/server";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";
import {softwareCheckoutReady} from "@/lib/sasi-software/readiness";
import {wechatPayEnabled} from "@/lib/wechatpay";
import {alipayEnabled} from "@/lib/alipay";
import {paypalEnabled} from "@/lib/paypal";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const wx=wechatPayEnabled(),ali=alipayEnabled(),paypal=paypalEnabled();
 const values=await Promise.all(SASI_SOFTWARE_CATALOG.map(async p=>{
  const packageReady=await softwareCheckoutReady(p.id);
  return [p.id,{
   available:Boolean(packageReady&&(wx||ali||paypal)),
   availableCny:Boolean(packageReady&&(wx||ali)),
   availableUsd:Boolean(packageReady&&paypal)
  }] as const;
 }));
 return NextResponse.json({products:Object.fromEntries(values),
  payment:{wechat:wx,alipay:ali,paypal},
  note:"Checkout requires a verified private package and merchant fulfillment."},
  {headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
