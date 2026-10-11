import { NextResponse } from "next/server";
import { requireMiniSession } from "@/lib/mini/session";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";
import { checkRateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 30;
export async function GET(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return NextResponse.json({ error: "订单无效" }, { status: 400 });
  if (!(await checkRateLimit(`mini-vpay-status:${session.userId}`, 30, 60))) return NextResponse.json({ error: "请稍后查看订单" }, { status: 429 });
  try {
    // Committed local credit is authoritative for the customer-facing result.
    // Provider availability and delivery acknowledgement must not turn it into a failure.
    const admin = createAdminClient();
    const { data: order } = await admin.from("orders").select("id,status,product_id")
      .eq("id", orderId).eq("user_id", session.userId).eq("provider", "wechat_mini_virtual").maybeSingle();
    if (order?.status === "paid" && order.product_id.startsWith("sasi-balance-")) {
      const { data: credit } = await admin.from("sasi_credit_ledger").select("reference_id")
        .eq("user_id", session.userId).eq("kind", "topup").eq("reference_id", orderId).maybeSingle();
      if (credit) return NextResponse.json({ paid: true, status: "paid" }, { headers: { "Cache-Control": "private, no-store" } });
    }
    return NextResponse.json(await reconcileVirtualToolOrder(orderId, session.userId), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[mini payment status]", orderId, error instanceof Error ? error.message : "unknown");
    const notFound = error instanceof Error && error.message === "MINI_ORDER_NOT_FOUND";
    return NextResponse.json({ error: notFound ? "订单不存在" : "付款结果仍在确认，请在订单中查看", paid: false }, { status: notFound ? 404 : 503 });
  }
}
