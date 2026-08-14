type Code2SessionResponse = {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
};

export function miniWechatConfigured(): boolean {
  return Boolean(process.env.WECHAT_MINI_APP_ID && process.env.WECHAT_MINI_APP_SECRET);
}

export async function exchangeMiniCode(code: string) {
  const appId = process.env.WECHAT_MINI_APP_ID;
  const secret = process.env.WECHAT_MINI_APP_SECRET;
  if (!appId || !secret) throw new Error("Mini Program login is not configured");

  const endpoint = new URL("https://api.weixin.qq.com/sns/jscode2session");
  endpoint.searchParams.set("appid", appId);
  endpoint.searchParams.set("secret", secret);
  endpoint.searchParams.set("js_code", code);
  endpoint.searchParams.set("grant_type", "authorization_code");

  const response = await fetch(endpoint, { cache: "no-store", signal: AbortSignal.timeout(8_000) });
  const data = (await response.json()) as Code2SessionResponse;
  if (!response.ok || data.errcode || !data.openid || !data.session_key) {
    console.error("[mini login] code2session rejected", { status: response.status, errcode: data.errcode });
    throw new Error("WeChat login exchange failed");
  }
  return { openid: data.openid, unionid: data.unionid ?? null, sessionKey: data.session_key };
}

\n