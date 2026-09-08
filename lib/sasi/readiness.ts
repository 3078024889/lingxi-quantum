import "server-only";
import { alipayEnabled } from "@/lib/alipay";
import { wechatPayConfigured } from "@/lib/wechatpay";
import { sasiVideoProviderReadiness } from "@/lib/sasi/provider";
import { SASI_AIGC_LABEL_MODE } from "@/lib/sasi/aigc-label";

function paypalConfigured() {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID?.trim()
    && process.env.PAYPAL_CLIENT_SECRET?.trim()
    && process.env.PAYPAL_WEBHOOK_ID?.trim()
  );
}

export function sasiReadiness() {
  const video = sasiVideoProviderReadiness();
  const paymentChannels = {
    alipay: alipayEnabled(),
    wechat: wechatPayConfigured(),
    paypal: paypalConfigured(),
  };
  const paymentConfigured = Object.values(paymentChannels).some(Boolean);
  const billingFlag = process.env.SASI_BILLING_ENABLED === "true";
  const jobsFlag = process.env.SASI_JOBS_ENABLED === "true";
  const refundFlowTested = process.env.SASI_REFUND_FLOW_TESTED === "true";
  const contentLabeling = process.env.SASI_CONTENT_LABELING_ENABLED === "true"
    && process.env.SASI_CONTENT_LABELING_MODE === SASI_AIGC_LABEL_MODE
    && Boolean(process.env.SASI_CONTENT_PRODUCER_CODE?.trim());
  const billing = billingFlag && paymentConfigured;
  const jobs = jobsFlag && video.anyVerified;
  return {
    catalog: true,
    providers: video.providers,
    anyProviderConfigured: video.anyConfigured,
    anyProvider: video.anyVerified,
    paymentChannels,
    paymentConfigured,
    billing,
    jobs,
    refundFlowTested,
    contentLabeling,
    productionReady: paymentConfigured && billing && jobs && refundFlowTested && contentLabeling,
  };
}

export function sasiPublicReadiness() {
  const readiness = sasiReadiness();
  return {
    catalog: readiness.catalog,
    capabilitySupplyReady: readiness.anyProvider,
    videoRoutes: {
      seedance: readiness.providers.seedance.verified,
      xai: readiness.providers.xai.verified,
      openai: readiness.providers.openai.verified,
      wan: readiness.providers.wan.verified,
    },
    productionAccountReady: readiness.billing,
    executionReady: readiness.jobs,
    refundFlowTested: readiness.refundFlowTested,
    contentLabelingReady: readiness.contentLabeling,
    paymentChannels: readiness.paymentChannels,
    productionReady: readiness.productionReady,
  };
}
