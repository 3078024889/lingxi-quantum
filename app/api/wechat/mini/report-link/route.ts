import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { encryptMiniSecret } from "@/lib/mini/crypto";
import { requireMiniSession } from "@/lib/mini/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const REPORT_ROUTES: Record<string, string> = {
  "life-map-report": "/life-map/full",
  "relationship-resonance": "/relationship/full",
  "qian-reading": "/qian/full",
  "tarot-reading": "/mirror/reading/full",
  "resilience-report": "/resilience/full",
  "romance-report": "/romance/full",
  "daily-tide-report": "/daily/full",
  "wealth-report": "/wealth/full",
};

export async function POST(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { orderId?: unknown };
  if (typeof body.orderId !== "string") {
    return NextResponse.json({ error: "档案参数无效" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, user_id, product_id, submission_id, status")
    .eq("id", body.orderId)
    .eq("user_id", session.userId)
    .eq("status", "paid")
    .maybeSingle();
  const reportRoute = order ? REPORT_ROUTES[order.product_id] : undefined;
  if (!order || !reportRoute || !order.submission_id) {
    return NextResponse.json({ error: "这笔订单尚无可打开的生命档案" }, { status: 404 });
  }

  // 票据不携带小程序会话，且仅在两分钟内有效。打开端还会再次核验订单归属与状态。
  const ticket = encryptMiniSecret(JSON.stringify({
    orderId: order.id,
    userId: session.userId,
    expiresAt: Date.now() + 2 * 60 * 1000,
    nonce: randomBytes(12).toString("base64url"),
  }));
  return NextResponse.json({
    path: `/api/wechat/mini/report-open?ticket=${encodeURIComponent(ticket)}`,
  });
}
