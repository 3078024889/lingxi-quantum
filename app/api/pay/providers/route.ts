import { NextResponse } from "next/server";
import { alipayEnabled, alipayMissingVars } from "@/lib/alipay";
import { wechatPayConfigured, wechatPayEnabled, wechatPayMissingVars } from "@/lib/wechatpay";
import {paypalPayEnabled} from "@/lib/paypal";

export const dynamic="force-dynamic";
export const runtime="nodejs";

function paypalConfigured(){
 return Boolean(process.env.PAYPAL_CLIENT_ID?.trim()&&process.env.PAYPAL_CLIENT_SECRET?.trim()&&process.env.PAYPAL_WEBHOOK_ID?.trim());
}
export async function GET(){
 const wechatConfigured=wechatPayConfigured()&&Boolean(process.env.WECHAT_PLATFORM_PUBLIC_KEY?.trim()&&process.env.WECHAT_PLATFORM_PUBLIC_KEY_ID?.trim());
 const wechat=wechatPayEnabled();
 const alipayConfigured=alipayMissingVars().length===0;
 const alipay=alipayEnabled();
 const paypal=paypalPayEnabled();
 const walletTopupsCny=process.env.SASI_RMB_BALANCE_V1_ENABLED==="true"&&process.env.SASI_REFUND_FLOW_TESTED==="true"&&(wechat||alipay);
 const walletTopupsUsd=process.env.USD_BALANCE_TOPUP_ENABLED==="true"&&process.env.SASI_REFUND_FLOW_TESTED==="true"&&paypal;
 return NextResponse.json({
  wechat,alipay,paypal,walletTopupsCny,walletTopupsUsd,
  diagnostics:{
   wechat:{configured:wechatConfigured,enabled:wechat,missingCount:wechatPayMissingVars().length+Number(!process.env.WECHAT_PLATFORM_PUBLIC_KEY?.trim())+Number(!process.env.WECHAT_PLATFORM_PUBLIC_KEY_ID?.trim())},
   alipay:{configured:alipayConfigured,enabled:alipay,missingCount:alipayConfigured?0:alipayMissingVars().length},
   paypal:{configured:paypalConfigured(),enabled:paypal,missingCount:paypalConfigured()?0:1}
  }
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
