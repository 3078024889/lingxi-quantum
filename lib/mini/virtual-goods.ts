import { miniVirtualPayConfigured } from "@/lib/mini/virtual-pay";

// Enable only after platform restrictions are resolved and real-device acceptance passes.
export function miniVirtualToolsEnabled() {
  return process.env.WECHAT_MINI_VPAY_TOOLS_ENABLED === "true" && miniVirtualPayConfigured();
}

export function virtualGoodsForQuote(toolId: string, amountFen: number) {
  let config: Record<string, { skuId?: unknown; unitPriceFen?: unknown }>;
  try { config = JSON.parse(process.env.WECHAT_MINI_VPAY_TOOL_GOODS ?? "{}"); }
  catch { return null; }
  if (!config || typeof config !== "object" || Array.isArray(config)) return null;
  const entry = Object.prototype.hasOwnProperty.call(config, toolId) ? config[toolId] : null;
  if (!entry || typeof entry.skuId !== "string" || !/^[A-Za-z0-9_]{1,20}$/.test(entry.skuId)) return null;
  const unitPriceFen = Number(entry.unitPriceFen);
  const quantity = amountFen / unitPriceFen;
  if (!Number.isSafeInteger(amountFen) || amountFen <= 0 || !Number.isSafeInteger(unitPriceFen) ||
      unitPriceFen < 100 || unitPriceFen > 1000000 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) return null;
  return { skuId: entry.skuId, unitPriceFen, quantity };
}

export type VirtualOrderSnapshot = {
  orderId: string; quoteId: string; toolId: string; openid: string;
  skuId: string; unitPriceFen: number; quantity: number; env: 0 | 1;
};

export function miniSandboxUserAllowed(userId: string) {
  return (process.env.WECHAT_MINI_VPAY_SANDBOX_USER_IDS ?? "").split(",").map(x => x.trim()).includes(userId);
}
