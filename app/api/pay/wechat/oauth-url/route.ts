import { NextResponse } from "next/server";
import { getWechatOAuthUrl, wechatOauthConfigured, wechatOauthMissingVars } from "@/lib/wechat-oauth";

export const runtime = "nodejs";

// 前端（结账页）检测到自己是在微信内置浏览器里打开的，会先来问这个
// 接口要一个跳转链接——之所以不让前端自己拼这个链接，是因为拼接需要
// WECHAT_APP_ID，虽然AppID本身不算敏感信息，但统一走服务端拼，以后
// 换AppID/加逻辑（比如按不同产品线用不同公众号）只用改这一个地方。
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const redirectUri = searchParams.get("redirectUri");
  if (!redirectUri) {
    return NextResponse.json({ error: "缺少 redirectUri 参数" }, { status: 400 });
  }
  if (!wechatOauthConfigured()) {
    return NextResponse.json(
      { error: `微信网页授权还没配置完整（缺 ${wechatOauthMissingVars().join("、")}）` },
      { status: 503 }
    );
  }
  const state = Math.random().toString(36).slice(2);
  const url = getWechatOAuthUrl(redirectUri, state);
  return NextResponse.json({ url });
}
