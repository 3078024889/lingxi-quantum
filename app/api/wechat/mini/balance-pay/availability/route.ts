import { NextResponse } from "next/server";
import { BALANCE_TOPUP_AMOUNTS, MAX_CUSTOM_TOPUP } from "@/lib/balance-topups";
import { miniVirtualTopupsEnabled } from "@/lib/mini/virtual-goods";
export function GET() {
  return NextResponse.json({ enabled: miniVirtualTopupsEnabled() && process.env.WECHAT_MINI_VPAY_ENV === "production", currency: "CNY", amounts: BALANCE_TOPUP_AMOUNTS, customMin: 1, customMax: MAX_CUSTOM_TOPUP, customPrecision: 0 }, { headers: { "Cache-Control": "no-store" } });
}
