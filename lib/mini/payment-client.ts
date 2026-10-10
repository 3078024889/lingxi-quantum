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

export async function openMiniRecharge(): Promise<boolean> {
  const bridge = await miniPaymentBridge();
  if (!bridge) return false;
  return new Promise(resolve => {
    const timeout = setTimeout(() => resolve(false), 5000);
    bridge.navigateTo({ url: "/pages/balance/index", success: () => { clearTimeout(timeout); resolve(true); }, fail: () => { clearTimeout(timeout); resolve(false); } });
  });
}
