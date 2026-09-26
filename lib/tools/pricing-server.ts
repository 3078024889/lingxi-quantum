import { createAdminClient } from "@/lib/supabase/admin";

export type ToolQuoteResult = {
  toolId: string;
  billingType: string;
  quantity: number;
  unitName: string;
  amountRmb: number;
  amountUsd: number;
};

function money(n: number) {
  return Number(Math.max(0, n).toFixed(2));
}

function applyTier(quantity: number, config: unknown) {
  const cfg =
    config && typeof config === "object" && !Array.isArray(config)
      ? (config as Record<string, unknown>)
      : {};
  const tiers = Array.isArray(cfg.tiers) ? cfg.tiers : [];

  for (const entry of tiers) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const row = entry as Record<string, unknown>;
    const max = Number(row.max);
    const price = Number(row.price);
    if (Number.isFinite(max) && Number.isFinite(price) && quantity <= max) return price;
  }

  const after = Number(cfg.after);
  const block = Number(cfg.block);
  const blockPrice = Number(cfg.blockPrice);
  if (
    Number.isFinite(after) &&
    Number.isFinite(block) &&
    block > 0 &&
    Number.isFinite(blockPrice)
  ) {
    const last =
      tiers.length && tiers[tiers.length - 1] && typeof tiers[tiers.length - 1] === "object"
        ? (tiers[tiers.length - 1] as Record<string, unknown>)
        : {};
    const base = Number(last.price || 0);
    return base + Math.ceil(Math.max(0, quantity - after) / block) * blockPrice;
  }

  return Number.NaN;
}

function calculate(
  quantity: number,
  base: number,
  unit: number,
  min: number,
  max: number | null | undefined,
  config: unknown
) {
  const tier = applyTier(quantity, config);
  let amount = Number.isFinite(tier) ? tier : base + unit * quantity;
  amount = Math.max(amount, min);
  if (max != null && Number.isFinite(Number(max))) amount = Math.min(amount, Number(max));
  return money(amount);
}

export async function calculateToolQuote(
  toolId: string,
  quantityRaw: number
): Promise<ToolQuoteResult> {
  const quantity = Math.max(0, Number(quantityRaw));
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("INVALID_QUANTITY");
  if (quantity > 10000) throw new Error("QUANTITY_TOO_LARGE");

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tool_pricing")
    .select("*")
    .eq("tool_id", toolId)
    .eq("enabled", true)
    .single();

  if (error || !data) throw new Error("TOOL_PRICING_NOT_FOUND");

  // CNY / USD are independent price books. Neither derives from the other.
  const amountRmb = calculate(
    quantity,
    Number(data.base_price_rmb || 0),
    Number(data.unit_price_rmb || 0),
    Number(data.min_price_rmb || 0),
    data.max_price_rmb,
    data.pricing_json
  );

  const amountUsd = calculate(
    quantity,
    Number(data.base_price_usd || 0),
    Number(data.unit_price_usd || 0),
    Number(data.min_price_usd || 0),
    data.max_price_usd,
    data.pricing_json_usd
  );

  return {
    toolId,
    billingType: String(data.billing_type),
    quantity,
    unitName: String(data.unit_name),
    amountRmb,
    amountUsd,
  };
}
