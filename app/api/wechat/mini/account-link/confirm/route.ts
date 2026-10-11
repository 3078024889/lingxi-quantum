import { NextResponse } from "next/server";
import { decryptMiniSecret } from "@/lib/mini/crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type LinkTicket = { sourceUserId: string; openid: string; expiresAt: number; nonce: string; sessionTokenHash: string };

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user: targetUser } } = await supabase.auth.getUser();
  if (!targetUser) return NextResponse.json({ error: "请先登录你已有的灵犀账户" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { ticket?: unknown };
  if (typeof body.ticket !== "string" || body.ticket.length > 2048) {
    return NextResponse.json({ error: "账户连接凭证无效" }, { status: 400 });
  }

  try {
    const ticket = JSON.parse(decryptMiniSecret(body.ticket)) as LinkTicket;
    if (!ticket.sourceUserId || !ticket.openid || !ticket.nonce || !/^[0-9a-f]{64}$/.test(ticket.sessionTokenHash || '') || ticket.expiresAt < Date.now()) {
      return NextResponse.json({ error: "账户连接凭证已过期，请从小程序重新发起" }, { status: 400 });
    }
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("connect_mini_session_account", {
      p_token_hash: ticket.sessionTokenHash,
      p_openid: ticket.openid,
      p_source_user_id: ticket.sourceUserId,
      p_target_user_id: targetUser.id,
    });
    if (error) {
      console.error("[mini account link] migration failed", error.code, error.message);
      return NextResponse.json({ error: "账户连接暂未完成，请稍后重试" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, connected: data, account: targetUser.email || targetUser.phone });
  } catch (error) {
    console.error("[mini account link] invalid ticket", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "账户连接凭证无效或已过期" }, { status: 400 });
  }
}
