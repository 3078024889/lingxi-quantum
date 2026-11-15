import { miniVirtualPayConfigured } from "@/lib/mini/virtual-pay";
import { customTopupAmount } from "@/lib/balance-topups";

// Enable after virtual-payment goods publication and real-device acceptance.
// An ordinary Android payment restriction is not proof that virtual payment is blocked.
export function miniVirtualToolsEnabled() {
  return process.env.WECHAT_MINI_VPAY_TOOLS_ENABLED === "true" && miniVirtualPayConfigured();
}

// Legacy-only verifier for already-created virtual top-up orders. New wallet top-ups
// are created exclusively by the website checkout; no mini-program route may call this.
export function virtualTopupGoods(productId: string) {
  const fixed = /^sasi-balance-(10|88|666|888)$/.exec(productId);
  const custom = /^sasi-balance-custom-(.+)$/.exec(productId);
  const amount = fixed ? Number(fixed[1]) : custom ? customTopupAmount(custom[1]) : null;
  if (amount === null || !Number.isSafeInteger(amount) || amount < 1 || amount > 10000) return null;
  const amountFen = amount * 100;
  return { skuId: fixed ? `lx_balance_${amount}` : "lx_balance_custom", unitPriceFen: fixed ? amountFen : 100, quantity: fixed ? 1 : amount, amountFen };
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
  // Apple's minimum applies to the total transaction, not each pricing unit.
  if (!Number.isSafeInteger(amountFen) || amountFen < 100 || !Number.isSafeInteger(unitPriceFen) ||
      unitPriceFen < 1 || unitPriceFen > 1000000 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 10000) return null;
  return { skuId: entry.skuId, unitPriceFen, quantity };
}

export type VirtualOrderSnapshot = {
  orderId: string; quoteId: string; toolId: string; openid: string;
  skuId: string; unitPriceFen: number; quantity: number; env: 0 | 1;
  kind?: "tool" | "topup"; productId?: string;
};

export function miniSandboxUserAllowed(userId: string) {
  return (process.env.WECHAT_MINI_VPAY_SANDBOX_USER_IDS ?? "").split(",").map(x => x.trim()).includes(userId);
}
