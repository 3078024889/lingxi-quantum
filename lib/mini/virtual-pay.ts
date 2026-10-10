import { decryptMiniSecret, hmacSha256Hex } from "@/lib/mini/crypto";

export const MINI_VIRTUAL_PAY_MODE = "short_series_goods" as const;

export function miniVirtualPayConfigured(): boolean {
  if (!["sandbox", "production"].includes(process.env.WECHAT_MINI_VPAY_ENV ?? "")) return false;
  const sandbox = process.env.WECHAT_MINI_VPAY_ENV === "sandbox";
  return Boolean(
    process.env.WECHAT_MINI_VPAY_OFFER_ID &&
      (sandbox ? process.env.WECHAT_MINI_VPAY_SANDBOX_APP_KEY : process.env.WECHAT_MINI_VPAY_APP_KEY)
  );
}

export function buildMiniVirtualPayment(input: {
  skuId: string;
  priceFen: number;
  outTradeNo: string;
  orderId: string;
  encryptedSessionKey: string;
  quantity?: number;
}) {
  if (!miniVirtualPayConfigured()) throw new Error("Mini virtual payment is not configured");
  const sandbox = process.env.WECHAT_MINI_VPAY_ENV === "sandbox";
  const offerId = process.env.WECHAT_MINI_VPAY_OFFER_ID!;
  const appKey = sandbox
    ? process.env.WECHAT_MINI_VPAY_SANDBOX_APP_KEY!
    : process.env.WECHAT_MINI_VPAY_APP_KEY!;
  const quantity = input.quantity ?? 1;
  if (!/^[A-Za-z0-9_]{1,20}$/.test(input.skuId) || !Number.isSafeInteger(input.priceFen) ||
      input.priceFen <= 0 || input.priceFen > 1000000 || !Number.isSafeInteger(quantity) ||
      quantity < 1 || quantity > 1000000 || input.priceFen * quantity > 1000000 || !/^[A-Za-z0-9][A-Za-z0-9_|*@-]{7,31}$/.test(input.outTradeNo)) {
    throw new Error("Invalid virtual payment parameters");
  }

  // 字段顺序与最终传给 wx.requestVirtualPayment 的字符串完全一致，禁止二次序列化。
  const signData = JSON.stringify({
    offerId,
    buyQuantity: quantity,
    env: sandbox ? 1 : 0,
    currencyType: "CNY",
    productId: input.skuId,
    goodsPrice: input.priceFen,
    outTradeNo: input.outTradeNo,
    attach: input.orderId,
  });
  return {
    mode: MINI_VIRTUAL_PAY_MODE,
    signData,
    paySig: hmacSha256Hex(appKey, `requestVirtualPayment&${signData}`),
    signature: hmacSha256Hex(decryptMiniSecret(input.encryptedSessionKey), signData),
  };
}
