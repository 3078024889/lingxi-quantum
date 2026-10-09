export function isMiniProgramContext() {
  try {
    return (window as Window & { __wxjs_environment?: string }).__wxjs_environment === "miniprogram" ||
      (new URLSearchParams(window.location.search).get("mini") === "1" && /MicroMessenger/i.test(navigator.userAgent));
  } catch { return false; }
}
export async function miniVirtualPaymentAvailable() {
  try {
    const response = await fetch("/api/wechat/mini/tool-pay/availability", { cache: "no-store", signal: AbortSignal.timeout(5000) });
    return response.ok && (await response.json()).enabled === true;
  } catch { return false; }
}
