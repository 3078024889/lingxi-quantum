import { NextResponse } from "next/server";
import { alipayEnabled, alipayMissingVars } from "@/lib/alipay";
import { wechatPayConfigured, wechatPayMissingVars } from "@/lib/wechatpay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function paypalConfigured() {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim() &&
    process.env.PAYPAL_CLIENT_SECRET?.trim()
  );
}

function paypalEnabled() {
  return process.env.PAYPAL_ENABLED?.trim().toLowerCase() === "true" && paypalConfigured();
}

export async function GET() {
  const wechat = wechatPayConfigured();
  const alipayConfigured = alipayMissingVars().length === 0;
  const alipay = alipayEnabled();

  // PayPal is intentionally deferred. Even if credentials are added later,
  // the public checkout stays off until PAYPAL_ENABLED=true is explicitly set.
  const paypal = paypalEnabled();

  return NextResponse.json(
    {
      wechat,
      alipay,
      paypal,
      diagnostics: {
        wechat: {
          configured: wechat,
          missingCount: wechat ? 0 : wechatPayMissingVars().length,
        },
        alipay: {
          configured: alipayConfigured,
          enabled: alipay,
          missingCount: alipayConfigured ? 0 : alipayMissingVars().length,
        },
        paypal: {
          configured: paypalConfigured(),
          enabled: paypal,
          deferred: !paypal,
        },
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
