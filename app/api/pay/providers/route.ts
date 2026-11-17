import { NextResponse } from "next/server";
import { alipayEnabled, alipayMissingVars } from "@/lib/alipay";
import { wechatPayConfigured, wechatPayEnabled, wechatPayMissingVars } from "@/lib/wechatpay";
import { paypalConfigured, paypalEnabled } from "@/lib/paypal";
import { sasiRmbBalanceV1Enabled } from "@/lib/sasi/payment-gate";

export const dynamic="force-dynamic";
export const runtime="nodejs";

export async function GET(){
 const wechatConfigured=wechatPayConfigured();
 const wechat=wechatPayEnabled();
 const alipayConfigured=alipayMissingVars().length===0;
 const alipay=alipayEnabled();
 const paypal=paypalEnabled();
 // Wallet readiness is stricter than provider availability: merchant credentials,
 // explicit wallet flags and the USD refund lifecycle must all be ready.
 const cnyBalanceTopupReady=sasiRmbBalanceV1Enabled()&&(wechat||alipay);
 const usdBalanceTopupReady=paypal
  &&process.env.USD_BALANCE_TOPUP_ENABLED==="true"
  &&process.env.SASI_REFUND_FLOW_TESTED==="true";
 return NextResponse.json({
  wechat,alipay,paypal,cnyBalanceTopupReady,usdBalanceTopupReady,
  diagnostics:{
   wechat:{configured:wechatConfigured,enabled:wechat,missingCount:wechatConfigured?0:wechatPayMissingVars().length},
   alipay:{configured:alipayConfigured,enabled:alipay,missingCount:alipayConfigured?0:alipayMissingVars().length},
   paypal:{configured:paypalConfigured(),enabled:paypal,missingCount:paypalConfigured()?0:1}
  }
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
