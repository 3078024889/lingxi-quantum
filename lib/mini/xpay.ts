import { hmacSha256Hex } from "@/lib/mini/crypto";

let tokenCache: { appId: string; token: string; expires: number } | undefined;
async function accessToken() {
  const appId = process.env.WECHAT_MINI_APP_ID;
  const secret = process.env.WECHAT_MINI_APP_SECRET;
  if (!appId || !secret) throw new Error("MINI_WECHAT_NOT_CONFIGURED");
  if (tokenCache?.appId === appId && tokenCache.expires > Date.now()) return tokenCache.token;
  const response = await fetch("https://api.weixin.qq.com/cgi-bin/stable_token", {
    method: "POST", headers: { "content-type": "application/json" }, cache: "no-store",
    body: JSON.stringify({ grant_type: "client_credential", appid: appId, secret, force_refresh: false }),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token || !Number.isFinite(data.expires_in)) throw new Error(`MINI_TOKEN_${Number(data.errcode) || response.status}`);
  tokenCache = { appId, token: data.access_token, expires: Date.now() + Math.max(0, data.expires_in - 120) * 1000 };
  return tokenCache.token;
}

async function xpay(path: string, body: Record<string, unknown>, env: 0 | 1, signed = true) {
  const appKey = env === 1 ? process.env.WECHAT_MINI_VPAY_SANDBOX_APP_KEY : process.env.WECHAT_MINI_VPAY_APP_KEY;
  if (!appKey) throw new Error("MINI_VPAY_NOT_CONFIGURED");
  const serialized = JSON.stringify(body);
  const url = new URL(`https://api.weixin.qq.com${path}`);
  url.searchParams.set("access_token", await accessToken());
  if (signed) url.searchParams.set("pay_sig", hmacSha256Hex(appKey, `${path}&${serialized}`));
  const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" },
    body: serialized, cache: "no-store", signal: AbortSignal.timeout(8000) });
  const data = await response.json();
  if (!response.ok || Number(data.errcode ?? 0) !== 0) throw new Error(`MINI_XPAY_${Number(data.errcode) || response.status}`);
  return data;
}

export type XpayOrder = { order_id: string; status: number; order_type: number; paid_fee: number;
  order_fee: number; env_type: number; wx_order_id?: string; wxpay_order_id?: string; };
export async function queryVirtualOrder(openid: string, orderId: string, env: 0 | 1): Promise<XpayOrder> {
  const data = await xpay("/xpay/query_order", { openid, env, order_id: orderId }, env);
  if (!data.order) throw new Error("MINI_XPAY_ORDER_MISSING");
  return data.order;
}
export async function notifyVirtualGoodsProvided(orderId: string, env: 0 | 1) {
  return xpay("/xpay/notify_provide_goods", { order_id: orderId, env }, env, false);
}
