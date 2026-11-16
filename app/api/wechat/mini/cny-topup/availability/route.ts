import { NextResponse } from "next/server";
import { BALANCE_TOPUP_AMOUNTS, MIN_CUSTOM_TOPUP, MAX_CUSTOM_TOPUP } from "@/lib/balance-topups";
import { miniCnyTopupsEnabled } from "@/lib/mini/virtual-goods";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const enabled = miniCnyTopupsEnabled() && process.env.WECHAT_MINI_VPAY_ENV === "production";
  return NextResponse.json({
    enabled,
    currency: "CNY",
    amounts: BALANCE_TOPUP_AMOUNTS,
    customMin: MIN_CUSTOM_TOPUP,
    customMax: MAX_CUSTOM_TOPUP,
    customPrecision: 2,
  }, { headers: { "Cache-Control": "no-store" } });
}
