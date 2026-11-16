import { NextResponse } from "next/server";
import { BALANCE_TOPUP_AMOUNTS, MIN_CUSTOM_TOPUP, MAX_CUSTOM_TOPUP } from "@/lib/balance-topups";
import { miniJsapiPayConfigured, miniJsapiPayMissingReasons, miniJsapiTopupsEnabled } from "@/lib/mini/tool-pay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const production = process.env.NODE_ENV === "production";
  const topupsEnabled = process.env.WECHAT_MINI_JSAPI_TOPUPS_ENABLED === "true";
  const providerConfigured = miniJsapiPayConfigured();
  const missing = miniJsapiPayMissingReasons();
  const enabled = production && miniJsapiTopupsEnabled();
  const reason = enabled ? "READY"
    : !production ? "PRODUCTION_ENV_REQUIRED"
    : !topupsEnabled ? "TOPUPS_DISABLED"
    : missing.includes("APP_ID_MISMATCH") ? "APP_ID_MISMATCH"
    : "PROVIDER_CONFIG_MISSING";
  return NextResponse.json({
    enabled,
    reason,
    topupsEnabled,
    providerConfigured,
    missing,
    paymentMode: "WECHAT_MINI_JSAPI",
    environment: "merchant-jsapi",
    currency: "CNY",
    amounts: BALANCE_TOPUP_AMOUNTS,
    customMin: MIN_CUSTOM_TOPUP,
    customMax: MAX_CUSTOM_TOPUP,
    customPrecision: 2,
  }, { headers: { "Cache-Control": "no-store" } });
}
