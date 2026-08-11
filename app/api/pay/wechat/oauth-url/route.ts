import crypto from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getWechatOAuthUrl, wechatOauthConfigured } from "@/lib/wechat-oauth";

export const runtime = "nodejs";

const OAUTH_STATE_COOKIE = "lingxi_wechat_oauth_state";

function allowedRedirect(raw: string, requestUrl: URL): URL | null {
  try {
    const redirect = new URL(raw);
    const configuredOrigin = new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://lingxifield.com"
    ).origin;
    const allowedOrigins = new Set([
      configuredOrigin,
      "https://lingxifield.com",
      "https://lingxifield.cn",
    ]);
    if (process.env.NODE_ENV !== "production") {
      allowedOrigins.add(requestUrl.origin);
    }
    if (!allowedOrigins.has(redirect.origin) || redirect.pathname !== "/checkout") {
      return null;
    }
    return redirect;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const redirectUri = requestUrl.searchParams.get("redirectUri");
  if (!redirectUri) {
    return NextResponse.json({ error: "缺少 redirectUri 参数。" }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  if (!wechatOauthConfigured()) {
    return NextResponse.json(
      { error: "微信网页授权暂不可用，请稍后再试。" },
      { status: 503 }
    );
  }

  const redirect = allowedRedirect(redirectUri, requestUrl);
  if (!redirect) {
    return NextResponse.json({ error: "不允许的授权回跳地址。" }, { status: 400 });
  }

  const state = crypto.randomBytes(32).toString("base64url");
  const response = NextResponse.json({
    url: getWechatOAuthUrl(redirect.toString(), state),
  });
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}