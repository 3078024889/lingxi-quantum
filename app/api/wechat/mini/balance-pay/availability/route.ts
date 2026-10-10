import { NextResponse } from "next/server";
import { BALANCE_TOPUP_AMOUNTS } from "@/lib/balance-topups";
import { miniVirtualTopupsEnabled } from "@/lib/mini/virtual-goods";
export function GET() {
  return NextResponse.json({ enabled: miniVirtualTopupsEnabled() && process.env.WECHAT_MINI_VPAY_ENV === "production", currency: "CNY", amounts: BALANCE_TOPUP_AMOUNTS, customMin: 10, customMax: 10000 }, { headers: { "Cache-Control": "no-store" } });
}
