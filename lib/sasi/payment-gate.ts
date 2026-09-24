import "server-only";
import { SASI_AIGC_LABEL_MODE } from "@/lib/sasi/aigc-label";
import { sasiVideoProviderReadiness } from "@/lib/sasi/provider";

const SASI_TOPUP_PRODUCTS = new Set([
  "sasi-balance-10",
  "sasi-credit-entry",
  "sasi-balance-50",
  "sasi-credit-studio",
  "sasi-balance-200",
  "sasi-credit-reserve",
  "sasi-balance-1000",
  "sasi-balance-2000",
  "sasi-balance-10000",
]);

const SASI_CUSTOM_TOPUP = /^sasi-balance-custom-(\d{1,5})$/;

export function sasiRmbBalanceV1Enabled() {
  return process.env.SASI_RMB_BALANCE_V1_ENABLED === "true";
}

export function sasiTopupProductEnabled(productId: string) {
  if (SASI_TOPUP_PRODUCTS.has(productId)) return true;
  const custom = SASI_CUSTOM_TOPUP.exec(productId);
  if (!custom) return false;
  const amountRmb = Number(custom[1]);
  return Number.isInteger(amountRmb) && amountRmb >= 10 && amountRmb <= 10000;
}

export function sasiPaidProductionEnabled() {
  const video = sasiVideoProviderReadiness();
  return Boolean(
    process.env.SASI_BILLING_ENABLED === "true"
    && process.env.SASI_JOBS_ENABLED === "true"
    && process.env.SASI_CONTENT_LABELING_ENABLED === "true"
    && process.env.SASI_CONTENT_LABELING_MODE === SASI_AIGC_LABEL_MODE
    && process.env.SASI_CONTENT_PRODUCER_CODE?.trim()
    && process.env.SASI_REFUND_FLOW_TESTED === "true"
    && process.env.SASI_USAGE_SETTLEMENT_TESTED === "true"
    && video.anyVerified
  );
}

export function safeLocalReturnPath(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.length > 512) return fallback;
  return value;
}
