import { NextResponse } from "next/server";
import { alipayEnabled, alipayMissingVars } from "@/lib/alipay";
import { wechatPayConfigured, wechatPayEnabled, wechatPayMissingVars } from "@/lib/wechatpay";
import { paypalConfigured, paypalEnabled } from "@/lib/paypal";

export const dynamic="force-dynamic";
export const runtime="nodejs";

export async function GET(){
 const wechatConfigured=wechatPayConfigured();
 const wechat=wechatPayEnabled();
 const alipayConfigured=alipayMissingVars().length===0;
 const alipay=alipayEnabled();
 const paypal=paypalEnabled();
 return NextResponse.json({
  wechat,alipay,paypal,
  diagnostics:{
   wechat:{configured:wechatConfigured,enabled:wechat,missingCount:wechatConfigured?0:wechatPayMissingVars().length},
   alipay:{configured:alipayConfigured,enabled:alipay,missingCount:alipayConfigured?0:alipayMissingVars().length},
   paypal:{configured:paypalConfigured(),enabled:paypal,missingCount:paypalConfigured()?0:1}
  }
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
