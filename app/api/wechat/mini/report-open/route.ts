import { NextResponse } from "next/server";
import { decryptMiniSecret } from "@/lib/mini/crypto";
import { createClient } from "@/lib/supabase/server";
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
  "life-archetype": "/mini-report",
};

type Ticket = { orderId: string; userId: string; expiresAt: number; nonce: string };

function safeFailure(req: Request, message: string, status = 400) {
  const url = new URL("/account", req.url);
  url.searchParams.set("miniError", message);
  return NextResponse.redirect(url, status === 400 ? 302 : status);
}

export async function GET(req: Request) {
  const ticketText = new URL(req.url).searchParams.get("ticket");
  if (!ticketText || ticketText.length > 2048) return safeFailure(req, "档案链接无效");

  try {
    const ticket = JSON.parse(decryptMiniSecret(ticketText)) as Ticket;
    if (!ticket.orderId || !ticket.userId || !ticket.nonce || ticket.expiresAt < Date.now()) {
      return safeFailure(req, "档案链接已过期");
    }

    const admin = createAdminClient();
    const [{ data: order }, userResult] = await Promise.all([
      admin
        .from("orders")
        .select("id, user_id, product_id, submission_id, status")
        .eq("id", ticket.orderId)
        .eq("user_id", ticket.userId)
        .eq("status", "paid")
        .maybeSingle(),
      admin.auth.admin.getUserById(ticket.userId),
    ]);
    let reportRoute = order ? REPORT_ROUTES[order.product_id] : undefined;
    const email = userResult.data.user?.email;
    if (!order || !reportRoute || !order.submission_id || !email) {
      return safeFailure(req, "档案权益尚未同步");
    }
    const { data: dendriteSubmission } = await admin
      .from("mini_dendrite_assessments")
      .select("id")
      .eq("id", order.submission_id)
      .eq("user_id", ticket.userId)
      .maybeSingle();
    if (dendriteSubmission) reportRoute = "/mini-report";

    // 为同一个影子账户创建一次性 OTP，并在服务端换取标准 Supabase Cookie 会话。
    const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
    const tokenHash = link.data.properties?.hashed_token;
    if (link.error || !tokenHash) return safeFailure(req, "档案登录暂不可用");
    const supabase = createClient();
    const verification = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
    if (verification.error || verification.data.user?.id !== ticket.userId) {
      return safeFailure(req, "档案身份校验失败");
    }

    const destination = new URL(reportRoute, req.url);
    destination.searchParams.set("id", order.submission_id);
    destination.searchParams.set("mini", "1");
    return NextResponse.redirect(destination);
  } catch (error) {
    console.error("[mini report open] failed", error instanceof Error ? error.message : "unknown");
    return safeFailure(req, "档案链接无效");
  }
}
