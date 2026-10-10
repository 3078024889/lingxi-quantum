import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { MINI_PAYMENT_PAUSED } from "@/lib/mini/payment-availability";
import { miniVirtualTopupsEnabled, virtualTopupGoods, type VirtualOrderSnapshot } from "@/lib/mini/virtual-goods";
import { buildMiniVirtualPayment } from "@/lib/mini/virtual-pay";
import { encryptMiniSecret } from "@/lib/mini/crypto";
import { exchangeMiniCode } from "@/lib/mini/wechat";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;

// A separate gate stays off until recharge goods and refund acceptance are complete.
export async function POST(req: Request) {
  if (!miniVirtualTopupsEnabled() || process.env.WECHAT_MINI_VPAY_ENV !== "production") return NextResponse.json(MINI_PAYMENT_PAUSED, { status: 503 });
  if (!(await checkRateLimit(`mini-topup-ip:${getClientIp(req)}`, 20, 600))) return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  if (!(await checkRateLimit(`mini-topup-user:${session.userId}`, 10, 600))) return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
  const raw = await req.text();
  if (raw.length > 8192) return NextResponse.json({ error: "请求过大" }, { status: 413 });
  const body = (() => { try { return JSON.parse(raw); } catch { return null; } })();
  const goods = typeof body?.productId === "string" ? virtualTopupGoods(body.productId) : null;
  if (!goods || typeof body?.code !== "string" || body.code.length < 1 || body.code.length > 256 ||
      typeof body?.requestId !== "string" || !/^[0-9a-f]{32}$/i.test(body.requestId)) return NextResponse.json({ error: "请重新选择充值金额" }, { status: 400 });
  const admin = createAdminClient();
  let createdId: string | null = null;
  try {
    const fresh = await exchangeMiniCode(body.code);
    if (fresh.openid !== session.openid) return NextResponse.json({ error: "微信身份不一致" }, { status: 403 });
    const outTradeNo = `LXR${body.requestId}`.slice(0, 32);
    const { data: existing, error: existingError } = await admin.from("orders").select("id,user_id,product_id,status")
      .eq("provider", "wechat_mini_virtual").eq("provider_payment_id", outTradeNo).maybeSingle();
    if (existingError) throw new Error("MINI_ORDER_LOOKUP_FAILED");
    if (existing) {
      if (existing.user_id !== session.userId || existing.product_id !== body.productId) return NextResponse.json({ error: "请重新确认充值" }, { status: 409 });
      return NextResponse.json({ orderId: existing.id, paid: existing.status === "paid", pending: true });
    }
    if (goods.skuId === "lx_balance_cent") {
      const publication = await admin.from("wechat_mini_payment_events").select("id")
        .eq("event_type", "virtual_goods_publication_verified").eq("out_trade_no", goods.skuId)
        .eq("transaction_id", "production").eq("handled", true).maybeSingle();
      if (publication.error || !publication.data) return NextResponse.json({ error: "小数金额充值商品正在等待微信审核发布，请稍后重试。" }, { status: 503 });
    }
    const orderId = randomUUID();
    const snapshot: VirtualOrderSnapshot = { kind: "topup", productId: body.productId, orderId, quoteId: "", toolId: "balance-topup", openid: session.openid, ...goods, env: 0 };
    const insert = await admin.from("orders").insert({ id: orderId, user_id: session.userId, product_id: body.productId,
      product_type: "permanent", amount_rmb: goods.amountFen / 100, amount_usd: 0, currency: "CNY", status: "pending",
      provider: "wechat_mini_virtual", provider_payment_id: outTradeNo, channel: "mini-program", submission_name: `余额充值 ¥${goods.amountFen / 100}` });
    if (insert.error) return NextResponse.json({ error: "这次充值可能已开始，请先查看订单确认结果", code: "PAYMENT_ALREADY_STARTED" }, { status: 409 });
    createdId = orderId;
    const event = await admin.from("wechat_mini_payment_events").insert({ event_type: "virtual_topup_order_created", out_trade_no: outTradeNo,
      order_id: orderId, transaction_id: "created", payload: snapshot, handled: true });
    if (event.error) throw new Error("MINI_SNAPSHOT_INSERT_FAILED");
    const payment = buildMiniVirtualPayment({ skuId: goods.skuId, priceFen: goods.unitPriceFen, quantity: goods.quantity,
      outTradeNo, orderId, encryptedSessionKey: encryptMiniSecret(fresh.sessionKey) });
    return NextResponse.json({ orderId, amountFen: goods.amountFen, payment }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    if (createdId) await admin.from("orders").update({ status: "canceled" }).eq("id", createdId).eq("status", "pending");
    return NextResponse.json({ error: "充值准备未完成，请稍后重试" }, { status: 502 });
  }
}
