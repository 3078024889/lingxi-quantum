import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { MINI_PAYMENT_PAUSED } from "@/lib/mini/payment-availability";
import { miniVirtualToolsEnabled, virtualGoodsForQuote, miniSandboxUserAllowed, type VirtualOrderSnapshot } from "@/lib/mini/virtual-goods";
import { buildMiniVirtualPayment } from "@/lib/mini/virtual-pay";
import { encryptMiniSecret } from "@/lib/mini/crypto";
import { exchangeMiniCode } from "@/lib/mini/wechat";
import { toolRuntimeStateLive } from "@/lib/tools/service-readiness";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(req: Request) {
  if (!miniVirtualToolsEnabled()) return NextResponse.json(MINI_PAYMENT_PAUSED, { status: 503 });
  if (Number(req.headers.get("content-length")) > 8192) return NextResponse.json({ error: "请求过大" }, { status: 413 });
  if (!(await checkRateLimit(`mini-virtual-ip:${getClientIp(req)}`, 30, 600))) return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  if (process.env.WECHAT_MINI_VPAY_ENV === "sandbox" && !miniSandboxUserAllowed(session.userId)) {
    return NextResponse.json(MINI_PAYMENT_PAUSED, { status: 503 });
  }
  if (!(await checkRateLimit(`mini-virtual-user:${session.userId}`, 12, 600))) return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  if (!UUID.test(String(body.quoteId ?? "")) || typeof body.code !== "string" || body.code.length < 1 || body.code.length > 256) {
    return NextResponse.json({ error: "请返回工具重新确认价格" }, { status: 400 });
  }
  const admin = createAdminClient();
  const { data: q, error: quoteError } = await admin.from("tool_payment_quotes").select("*")
    .eq("id", body.quoteId).eq("user_id", session.userId).maybeSingle();
  if (quoteError || !q) return NextResponse.json({ error: "价格信息不存在" }, { status: 404 });
  if (q.status === "paid") return NextResponse.json({ paid: true });
  if (q.currency !== "CNY" || !Number.isFinite(Date.parse(q.expires_at)) || Date.parse(q.expires_at) < Date.now()) {
    return NextResponse.json({ error: "请返回工具重新确认人民币价格" }, { status: 410 });
  }
  const goods = virtualGoodsForQuote(q.tool_id, Math.round(Number(q.amount_rmb) * 100));
  if (!goods) return NextResponse.json({ error: "这项工具的付费暂未开放，不会产生费用" }, { status: 503 });
  if (!(await toolRuntimeStateLive(q.tool_id)).ready) return NextResponse.json({ error: "工具暂不可用，不会产生费用" }, { status: 503 });
  let orderId: string | null = null;
  let claimed = false;
  try {
    const fresh = await exchangeMiniCode(body.code);
    if (fresh.openid !== session.openid) return NextResponse.json({ error: "微信身份不一致" }, { status: 403 });
    const claim = await admin.from("tool_payment_quotes").update({ status: "ordered" })
      .eq("id", q.id).eq("status", "quoted").select("id").maybeSingle();
    if (claim.error || !claim.data) return NextResponse.json({ error: "这次支付已开始，请查看订单确认结果", code: "PAYMENT_ALREADY_STARTED" }, { status: 409 });
    claimed = true;
    orderId = randomUUID();
    const outTradeNo = `LXM${orderId.replace(/-/g, "")}`.slice(0, 32);
    const snapshot: VirtualOrderSnapshot = { orderId, quoteId: q.id, toolId: q.tool_id, openid: session.openid,
      ...goods, env: process.env.WECHAT_MINI_VPAY_ENV === "sandbox" ? 1 : 0 };
    const payment = buildMiniVirtualPayment({ skuId: goods.skuId, priceFen: goods.unitPriceFen,
      quantity: goods.quantity, outTradeNo, orderId, encryptedSessionKey: encryptMiniSecret(fresh.sessionKey) });
    const insert = await admin.from("orders").insert({ id: orderId, user_id: session.userId,
      product_id: `toolquote:${q.id}`, product_type: "permanent", amount_rmb: q.amount_rmb,
      amount_usd: 0, currency: "CNY", status: "pending", provider: "wechat_mini_virtual",
      provider_payment_id: outTradeNo, channel: "mini-program", submission_name: `工具：${q.tool_id} · ${q.quantity} ${q.unit_name}` });
    if (insert.error) throw new Error("MINI_ORDER_INSERT_FAILED");
    const event = await admin.from("wechat_mini_payment_events").insert({ event_type: "virtual_tool_order_created",
      out_trade_no: outTradeNo, order_id: orderId, transaction_id: "created", payload: snapshot, handled: true });
    if (event.error) throw new Error("MINI_SNAPSHOT_INSERT_FAILED");
    return NextResponse.json({ orderId, quoteId: q.id, payment }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    if (orderId) await admin.from("orders").update({ status: "canceled" }).eq("id", orderId).eq("status", "pending");
    if (claimed) await admin.from("tool_payment_quotes").update({ status: "quoted" }).eq("id", q.id).eq("status", "ordered");
    return NextResponse.json({ error: "支付准备未完成，请稍后重试" }, { status: 502 });
  }
}
