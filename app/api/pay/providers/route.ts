import { NextResponse } from "next/server";
import { alipayEnabled, alipayMissingVars } from "@/lib/alipay";
import { wechatPayConfigured, wechatPayMissingVars } from "@/lib/wechatpay";

export const dynamic="force-dynamic";
export const runtime="nodejs";

function paypalConfigured(){
 return Boolean(process.env.PAYPAL_CLIENT_ID?.trim()&&process.env.PAYPAL_CLIENT_SECRET?.trim()&&process.env.PAYPAL_WEBHOOK_ID?.trim());
}
function paypalEnabled(){
 return process.env.PAYPAL_ENABLED?.trim().toLowerCase()==="true"&&paypalConfigured();
}
export async function GET(){
 const wechat=wechatPayConfigured();
 const alipayConfigured=alipayMissingVars().length===0;
 const alipay=alipayEnabled();
 const paypal=paypalEnabled();
 return NextResponse.json({
  wechat,alipay,paypal,
  diagnostics:{
   wechat:{configured:wechat,missingCount:wechat?0:wechatPayMissingVars().length},
   alipay:{configured:alipayConfigured,enabled:alipay,missingCount:alipayConfigured?0:alipayMissingVars().length},
   paypal:{configured:paypalConfigured(),enabled:paypal,missingCount:paypalConfigured()?0:1}
  }
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
