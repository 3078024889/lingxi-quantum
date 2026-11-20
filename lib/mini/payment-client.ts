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

type MiniBridge = { navigateTo: (options: { url: string; success: () => void; fail: () => void }) => void;
  getEnv?: (callback: (result: { miniprogram?: boolean }) => void) => void };
let bridgePromise: Promise<MiniBridge | undefined> | undefined;
export function miniPaymentBridge(): Promise<MiniBridge | undefined> {
  const current = (window as Window & { wx?: { miniProgram?: MiniBridge } }).wx?.miniProgram;
  if (current) return Promise.resolve(current);
  if (!bridgePromise) bridgePromise = new Promise(resolve => {
    const script = document.createElement("script");
    script.src = "https://res.wx.qq.com/open/js/jweixin-1.6.0.js";
    const timeout = setTimeout(() => { bridgePromise = undefined; resolve(undefined); }, 5000);
    script.onload = () => { clearTimeout(timeout); resolve((window as Window & { wx?: { miniProgram?: MiniBridge } }).wx?.miniProgram); };
    script.onerror = () => { clearTimeout(timeout); bridgePromise = undefined; resolve(undefined); };
    document.head.appendChild(script);
  });
  return bridgePromise;
}

export async function detectMiniPaymentContext(): Promise<boolean> {
  if (isMiniProgramContext()) return true;
  if (!/MicroMessenger/i.test(navigator.userAgent)) return false;
  const bridge = await miniPaymentBridge();
  if (!bridge?.getEnv) return false;
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve(false), 3000);
    bridge.getEnv!(result => { clearTimeout(timeout); resolve(result.miniprogram === true); });
  });
}

export async function openMiniWallet(currency: "CNY" | "USD" = "CNY", amount?: string | number): Promise<boolean> {
  const bridge = await miniPaymentBridge();
  if (!bridge) return false;
  const safeCurrency = currency === "USD" ? "USD" : "CNY";
  const amountText = amount === undefined ? "" : String(amount).trim();
  const validAmount = /^(0|[1-9][0-9]{0,4})(\.[0-9]{1,2})?$/.test(amountText) &&
    Number(amountText) > 0 && Number(amountText) <= 10000;
  const url = safeCurrency === "USD"
    ? "/pages/web/index?usdWallet=1"
    : "/pages/cny-wallet/index" + (validAmount ? "?amount=" + encodeURIComponent(amountText) : "");
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve(false), 5000);
    const finish = (opened: boolean) => { clearTimeout(timeout); resolve(opened); };
    try { bridge.navigateTo({ url, success: () => finish(true), fail: () => finish(false) }); }
    catch { finish(false); }
  });
}

export function openMiniRecharge() { return openMiniWallet(); }
