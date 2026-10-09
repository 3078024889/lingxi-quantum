import { NextResponse } from "next/server";
import { requireMiniSession } from "@/lib/mini/session";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;
export async function GET(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return NextResponse.json({ error: "订单无效" }, { status: 400 });
  if (!(await checkRateLimit(`mini-vpay-status:${session.userId}`, 30, 60))) return NextResponse.json({ error: "请稍后查看订单" }, { status: 429 });
  try {
    return NextResponse.json(await reconcileVirtualToolOrder(orderId, session.userId), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    const notFound = error instanceof Error && error.message === "MINI_ORDER_NOT_FOUND";
    return NextResponse.json({ error: notFound ? "订单不存在" : "付款结果仍在确认，请在订单中查看", paid: false }, { status: notFound ? 404 : 503 });
  }
}
