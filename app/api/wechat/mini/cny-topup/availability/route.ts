import { NextResponse } from "next/server";
import { BALANCE_TOPUP_AMOUNTS, MIN_CUSTOM_TOPUP, MAX_CUSTOM_TOPUP } from "@/lib/balance-topups";
import { miniCnyJsapiReadiness } from "@/lib/mini/payment-readiness";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const readiness = miniCnyJsapiReadiness();
  return NextResponse.json({
    ...readiness,
    environment: "wechat-pay-api-v3-jsapi",
    currency: "CNY",
    amounts: BALANCE_TOPUP_AMOUNTS,
    customMin: MIN_CUSTOM_TOPUP,
    customMax: MAX_CUSTOM_TOPUP,
    customPrecision: 2,
    paymentMethod: "wx.requestPayment",
  }, { headers: { "Cache-Control": "no-store" } });
}
