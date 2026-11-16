import { NextResponse } from "next/server";
import { BALANCE_TOPUP_AMOUNTS, MIN_CUSTOM_TOPUP, MAX_CUSTOM_TOPUP } from "@/lib/balance-topups";
import { miniCnyTopupsEnabled } from "@/lib/mini/virtual-goods";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const environment = process.env.WECHAT_MINI_VPAY_ENV ?? "";
  const topupsEnabled = process.env.WECHAT_MINI_VPAY_TOPUPS_ENABLED === "true";
  const providerConfigured = Boolean(
    process.env.WECHAT_MINI_VPAY_OFFER_ID &&
    (environment === "sandbox" ? process.env.WECHAT_MINI_VPAY_SANDBOX_APP_KEY : process.env.WECHAT_MINI_VPAY_APP_KEY)
  );
  const production = environment === "production";
  const enabled = miniCnyTopupsEnabled() && production;
  const reason = enabled ? "READY"
    : !topupsEnabled ? "TOPUPS_DISABLED"
    : !["sandbox", "production"].includes(environment) ? "PAYMENT_ENV_UNSET"
    : !providerConfigured ? "PROVIDER_CONFIG_MISSING"
    : !production ? "PRODUCTION_ENV_REQUIRED"
    : "PROVIDER_CONFIG_MISSING";
  return NextResponse.json({
    enabled,
    reason,
    topupsEnabled,
    providerConfigured,
    environment: production ? "production" : environment === "sandbox" ? "sandbox" : "unset",
    currency: "CNY",
    amounts: BALANCE_TOPUP_AMOUNTS,
    customMin: MIN_CUSTOM_TOPUP,
    customMax: MAX_CUSTOM_TOPUP,
    customPrecision: 2,
  }, { headers: { "Cache-Control": "no-store" } });
}
