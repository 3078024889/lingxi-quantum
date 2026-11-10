import {NextResponse} from "next/server";
import {SASI_SOFTWARE_CATALOG} from "@/lib/sasi-software/catalog";
import {softwareCheckoutReady} from "@/lib/sasi-software/readiness";
import {wechatPayEnabled} from "@/lib/wechatpay";
import {alipayEnabled} from "@/lib/alipay";
import {paypalEnabled} from "@/lib/paypal";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){
 const values=await Promise.all(SASI_SOFTWARE_CATALOG.map(async p=>[p.id,{
  available:Boolean((wechatPayEnabled()||alipayEnabled()||paypalEnabled())&&await softwareCheckoutReady(p.id))
 }] as const));
 return NextResponse.json({products:Object.fromEntries(values),
  payment:{wechat:wechatPayEnabled(),alipay:alipayEnabled(),paypal:paypalEnabled()},
  note:"Checkout requires a verified private package and merchant fulfillment."},
  {headers:{"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
