import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { encryptMiniSecret, sha256 } from "@/lib/mini/crypto";
import { createMiniSession } from "@/lib/mini/session";
import { exchangeMiniCode, miniWechatConfigured } from "@/lib/mini/wechat";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(req: Request) {
  if (!miniWechatConfigured()) return NextResponse.json({ error: "小程序登录尚未配置" }, { status: 503 });
  if (!(await checkRateLimit(`mini-login:${getClientIp(req)}`, 30, 600))) {
    return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
  }

  try {
    const body = (await req.json()) as { code?: unknown };
    if (typeof body.code !== "string" || body.code.length < 6 || body.code.length > 256) {
      return NextResponse.json({ error: "登录凭证无效" }, { status: 400 });
    }
    const wxSession = await exchangeMiniCode(body.code);
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("wechat_mini_identities")
      .select("user_id, unionid")
      .eq("openid", wxSession.openid)
      .maybeSingle();

    let userId = existing?.user_id as string | undefined;
    if (!userId) {
      const alias = sha256(wxSession.openid).slice(0, 40);
      const created = await admin.auth.admin.createUser({
        email: `wx_${alias}@mini.lingxifield.invalid`,
        password: randomBytes(32).toString("base64url"),
        email_confirm: true,
        user_metadata: { source: "wechat-mini" },
      });
      if (created.error || !created.data.user) throw new Error(`Could not create mini user: ${created.error?.message}`);
      userId = created.data.user.id;
    }

    const now = new Date().toISOString();
    const { error: identityError } = await admin.from("wechat_mini_identities").upsert(
      {
        openid: wxSession.openid,
        unionid: wxSession.unionid ?? existing?.unionid ?? null,
        user_id: userId,
        encrypted_session_key: encryptMiniSecret(wxSession.sessionKey),
        session_key_updated_at: now,
        updated_at: now,
      },
      { onConflict: "openid" }
    );
    if (identityError) throw new Error(`Could not save mini identity: ${identityError.code}`);
    const session = await createMiniSession(userId, wxSession.openid);
    return NextResponse.json({ token: session.token, expiresAt: session.expiresAt, linked: false });
  } catch (error) {
    console.error("[mini login] failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "微信登录暂未完成，请稍后重试" }, { status: 502 });
  }
}
