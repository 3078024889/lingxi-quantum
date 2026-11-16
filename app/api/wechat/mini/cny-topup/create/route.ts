import { createHash, randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { MINI_PAYMENT_PAUSED } from "@/lib/mini/payment-availability";
import { miniCnyTopupsEnabled, virtualTopupGoods, type VirtualOrderSnapshot } from "@/lib/mini/virtual-goods";
import { buildMiniVirtualPayment } from "@/lib/mini/virtual-pay";
import { encryptMiniSecret } from "@/lib/mini/crypto";
import { exchangeMiniCode } from "@/lib/mini/wechat";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { miniAccountLinked } from "@/lib/mini/account";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";

export const runtime = "nodejs";
export const maxDuration = 30;
const REQUEST_ID = /^[0-9a-f]{32}$/i;

function conflict(message: string, orderId?: string) {
  return NextResponse.json({ error: message, code: "UNCONFIRMED_TOPUP_EXISTS", ...(orderId ? { orderId } : {}) }, {
    status: 409, headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(req: Request) {
  if (!miniCnyTopupsEnabled() || process.env.WECHAT_MINI_VPAY_ENV !== "production") {
    return NextResponse.json(MINI_PAYMENT_PAUSED, { status: 503 });
  }
  if (Number(req.headers.get("content-length")) > 8192) return NextResponse.json({ error: "请求过大" }, { status: 413 });
  if (!(await checkRateLimit(`mini-topup-ip:${getClientIp(req)}`, 20, 600))) {
    return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
  }

  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  if (!session.accountConnected) return NextResponse.json({
    error: "请先登录灵犀场账户并确认到账账户", code: "ACCOUNT_CONNECTION_REQUIRED",
  }, { status: 409 });
  if (!(await checkRateLimit(`mini-topup-user:${session.userId}`, 10, 600))) {
    return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
  }

  const raw = await req.text();
  if (raw.length > 8192) return NextResponse.json({ error: "请求过大" }, { status: 413 });
  let body: any;
  try { body = JSON.parse(raw); } catch { body = null; }
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const goods = virtualTopupGoods(productId);
  if (!goods || typeof body?.code !== "string" || body.code.length < 1 || body.code.length > 256 ||
      typeof body?.requestId !== "string" || !REQUEST_ID.test(body.requestId)) {
    return NextResponse.json({ error: "充值金额或请求编号无效" }, { status: 400 });
  }

  const admin = createAdminClient();
  try {
    if (!(await miniAccountLinked(session.userId))) {
      return NextResponse.json({ error: "请先连接灵犀场账户，再充值到账户余额", code: "ACCOUNT_LINK_REQUIRED" }, { status: 409 });
    }
    const fresh = await exchangeMiniCode(body.code);
    if (fresh.openid !== session.openid) return NextResponse.json({ error: "微信身份不一致" }, { status: 403 });

    // Accept the previous request-id encoding once, so an app upgrade cannot
    // create a second order for a request already started by the retired client.
    const legacyOutTradeNo = ("LXR" + body.requestId).slice(0, 32);
    const outTradeNo = "LXR" + createHash("sha256")
      .update(session.userId + ":" + body.requestId).digest("hex").slice(0, 29).toUpperCase();

    const { data: legacyExisting, error: legacyLookupError } = await admin.from("orders")
      .select("id,user_id,product_id,status,provider_payment_id")
      .eq("provider", "wechat_mini_virtual").eq("provider_payment_id", legacyOutTradeNo).maybeSingle();
    if (legacyLookupError) throw new Error("MINI_TOPUP_LEGACY_IDEMPOTENCY_LOOKUP_FAILED");
    const { data: newExisting, error: newLookupError } = legacyExisting
      ? { data: null, error: null }
      : await admin.from("orders").select("id,user_id,product_id,status,provider_payment_id")
        .eq("provider", "wechat_mini_virtual").eq("provider_payment_id", outTradeNo).maybeSingle();
    if (newLookupError) throw new Error("MINI_TOPUP_IDEMPOTENCY_LOOKUP_FAILED");
    const existing = legacyExisting || newExisting;
    if (existing) {
      if (existing.user_id !== session.userId || existing.product_id !== productId) {
        return NextResponse.json({ error: "请求编号已用于其他充值，请重新确认金额" }, { status: 409 });
      }
      const state = await reconcileVirtualToolOrder(existing.id, session.userId);
      if (state.paid) return NextResponse.json({ orderId: existing.id, paid: true, status: "paid" });
      if (state.closed) return NextResponse.json({ orderId: existing.id, paid: false, closed: true, status: "canceled" });
      if (!state.providerConfirmedUnpaid) return conflict("上一笔充值仍在核验，不能创建第二笔订单。", existing.id);
      const payment = buildMiniVirtualPayment({
        skuId: goods.skuId, priceFen: goods.unitPriceFen, quantity: goods.quantity,
        outTradeNo: existing.provider_payment_id, orderId: existing.id,
        encryptedSessionKey: encryptMiniSecret(fresh.sessionKey),
      });
      return NextResponse.json({ orderId: existing.id, pending: true, payment }, {
        headers: { "Cache-Control": "private, no-store" },
      });
    }

    // Resolve every earlier pending top-up with WeChat before reserving a new one.
    const { data: pendingOrders, error: pendingError } = await admin.from("orders")
      .select("id").eq("user_id", session.userId).eq("provider", "wechat_mini_virtual")
      .eq("status", "pending").like("product_id", "sasi-balance-%")
      .order("created_at", { ascending: false }).limit(10);
    if (pendingError) throw new Error("MINI_TOPUP_PENDING_LOOKUP_FAILED");
    for (const pending of pendingOrders || []) {
      let state: Awaited<ReturnType<typeof reconcileVirtualToolOrder>>;
      try { state = await reconcileVirtualToolOrder(pending.id, session.userId); }
      catch { return conflict("上一笔充值结果尚未确认，请先检查原订单。", pending.id); }
      if (state.paid || state.closed) continue;
      return conflict("上一笔充值仍在微信端处理中，核验关闭前不能再次充值。", pending.id);
    }

    if (goods.skuId === "lx_balance_cent") {
      const publication = await admin.from("wechat_mini_payment_events").select("id")
        .eq("event_type", "virtual_goods_publication_verified").eq("out_trade_no", goods.skuId)
        .eq("transaction_id", "production").eq("handled", true).maybeSingle();
      if (publication.error || !publication.data) {
        return NextResponse.json({ error: "小数金额充值商品尚未完成微信发布验收，请使用整数金额。", code: "TOPUP_GOODS_NOT_PUBLISHED" }, { status: 503 });
      }
    }

    const orderId = randomUUID();
    const snapshot: VirtualOrderSnapshot = {
      kind: "topup", productId, orderId, quoteId: "", toolId: "balance-topup",
      openid: session.openid, ...goods, env: 0,
    };
    const payment = buildMiniVirtualPayment({
      skuId: goods.skuId, priceFen: goods.unitPriceFen, quantity: goods.quantity,
      outTradeNo, orderId, encryptedSessionKey: encryptMiniSecret(fresh.sessionKey),
    });

    const { data: reservation, error: reserveError } = await admin.rpc("reserve_mini_cny_topup_order", {
      p_order_id: orderId,
      p_user_id: session.userId,
      p_product_id: productId,
      p_amount_rmb: goods.amountFen / 100,
      p_out_trade_no: outTradeNo,
      p_snapshot: snapshot,
    });
    if (reserveError) throw new Error("MINI_TOPUP_ATOMIC_RESERVATION_FAILED");
    const result = Array.isArray(reservation) ? reservation[0] : reservation;
    if (!result?.ok) return conflict("已有一笔人民币充值订单尚未结束，请先核验该订单。", result?.orderId);
    return NextResponse.json({ orderId, amountFen: goods.amountFen, payment }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("[mini CNY topup create]", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "充值订单准备未完成，请稍后重试；不会重复扣款。" }, { status: 503 });
  }
}
