import "server-only";
import { SASI_AIGC_LABEL_MODE } from "@/lib/sasi/aigc-label";
import { sasiVideoProviderReadiness } from "@/lib/sasi/provider";

export function sasiPaidProductionEnabled() {
  const video = sasiVideoProviderReadiness();
  return Boolean(
    process.env.SASI_BILLING_ENABLED === "true"
    && process.env.SASI_JOBS_ENABLED === "true"
    && process.env.SASI_CONTENT_LABELING_ENABLED === "true"
    && process.env.SASI_CONTENT_LABELING_MODE === SASI_AIGC_LABEL_MODE
    && process.env.SASI_CONTENT_PRODUCER_CODE?.trim()
    && process.env.SASI_REFUND_FLOW_TESTED === "true"
    && video.anyVerified
  );
}

export function safeLocalReturnPath(value: unknown, fallback: string) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.length > 512) return fallback;
  return value;
}
