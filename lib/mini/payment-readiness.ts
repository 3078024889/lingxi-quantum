import { miniJsapiPayConfigured } from "@/lib/mini/tool-pay";

export const EXPECTED_WECHAT_MINI_APP_ID = "wxbf4ae90406e7e26b";

export function miniCnyJsapiReadiness() {
  const topupsEnabled = process.env.WECHAT_MINI_JSAPI_TOPUPS_ENABLED === "true";
  const appIdMatchesExpected = process.env.WECHAT_MINI_APP_ID?.trim() === EXPECTED_WECHAT_MINI_APP_ID;
  const providerConfigured = miniJsapiPayConfigured();
  const enabled = topupsEnabled && appIdMatchesExpected && providerConfigured;
  const reason = enabled ? "READY"
    : !topupsEnabled ? "TOPUPS_DISABLED"
    : !appIdMatchesExpected ? "APP_ID_MISMATCH"
    : !providerConfigured ? "PROVIDER_CONFIG_MISSING"
    : "PROVIDER_CONFIG_MISSING";
  return { enabled, reason, topupsEnabled, appIdMatchesExpected, providerConfigured };
}

export function miniCnyJsapiTopupsEnabled() {
  return miniCnyJsapiReadiness().enabled;
}
