import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { miniAccountLinked } from "@/lib/mini/account";
import { miniCnyJsapiTopupsEnabled, EXPECTED_WECHAT_MINI_APP_ID } from "@/lib/mini/payment-readiness";
import { createMiniJsapiOrder, buildMiniRequestPayment } from "@/lib/mini/tool-pay";
import { getProduct } from "@/lib/plans";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { trustedSiteOrigin } from "@/lib/platform/site-origin";
import { queryWechatOrder, closeWechatOrder } from "@/lib/wechatpay";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";

export const runtime = "nodejs";
export const maxDuration = 30;
const REQUEST_ID = /^[0-9a-f]{32}$/i;
const PRODUCT_ID = /^sasi-balance-(?:10|88|666|888|custom-(?:0|[1-9][0-9]{0,4})(?:\\.[0-9]{1,2})?)$/;

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}
function conflict(message: string, orderId?: string) {
  return noStore({ error: message, code: "UNCONFIRMED_TOPUP_EXISTS", ...(orderId ? { orderId } : {}) }, 409);
}
function safeProviderCode(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const match = message.match(/WECHAT_API_(\\d{3}):([A-Z0-9_]+)/);
  return match ? `WECHAT_${match[1]}_${match[2]}` : "WECHAT_PROVIDER_UNCONFIRMED";
}
async function hasCommittedCredit(admin: ReturnType<typeof createAdminClient>, userId: string, orderId: string) {
  const { data, error } = await admin.from("sasi_credit_ledger").select("reference_id")
    .eq("user_id", userId).eq("kind", "topup").eq("reference_id", orderId).maybeSingle();
  if (error) throw new Error("MINI_CNY_CREDIT_LEDGER_LOOKUP_FAILED");
  return Boolean(data);
}
async function finishVerifiedCredit(admin: ReturnType<typeof createAdminClient>, userId: string, orderId: string) {
  const result = await fulfillPaidOrder(orderId, true);
  if (!result.ok) throw new Error("MINI_CNY_VERIFIED_PAYMENT_CREDIT_PENDING");
  if (!(await hasCommittedCredit(admin, userId, orderId))) throw new Error("MINI_CNY_CREDIT_LEDGER_NOT_COMMITTED");
}
async function cancelProviderUnpaidOrder(admin: ReturnType<typeof createAdminClient>, orderId: string, outTradeNo: string) {
  try {
    await closeWechatOrder(outTradeNo);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("WECHAT_API_404:ORDER_NOT_EXIST") && !message.includes("WECHAT_API_400:ORDER_CLOSED")) {
      return false;
    }
  }
  const { data, error } = await admin.from("orders").update({ status: "failed" })
    .eq("id", orderId).eq("status", "pending").select("id");
  if (error) throw new Error("MINI_CNY_LOCAL_ORDER_CLOSE_FAILED");
  return Boolean(data?.length) || true;
}
async function queryMiniOrder(order: any, openid: string) {
  const amountFen = Math.round(Number(order.amount_rmb) * 100);
  const result = await queryWechatOrder(order.provider_payment_id, amountFen, EXPECTED_WECHAT_MINI_APP_ID);
  const raw = result.raw as any;
  if (raw?.payer?.openid && String(raw.payer.openid) !== openid) throw new Error("MINI_CNY_PROVIDER_PAYER_MISMATCH");
  return result;
}
async function readPreparedPayment(admin: ReturnType<typeof createAdminClient>, order: any, sessionOpenid: string, amountFen: number) {
  const { data, error } = await admin.from("wechat_mini_payment_events").select("payload")
    .eq("event_type", "mini_jsapi_topup_prepared").eq("out_trade_no", order.provider_payment_id)
    .eq("order_id", order.id).eq("transaction_id", "prepay").maybeSingle();
  if (error) throw new Error("MINI_CNY_PREPAY_EVENT_LOOKUP_FAILED");
  const payload = data?.payload as any;
  if (!payload) return null;
  if (payload.openid !== sessionOpenid || payload.appid !== EXPECTED_WECHAT_MINI_APP_ID ||
      Number(payload.amountFen) !== amountFen || typeof payload.prepayId !== "string" || !payload.prepayId) {
    throw new Error("MINI_CNY_PREPAY_EVENT_IDENTITY_MISMATCH");
  }
  return buildMiniRequestPayment(payload.prepayId);
}
async function closeUnpreparedOrder(admin: ReturnType<typeof createAdminClient>, order: any, openid: string) {
  try {
    const provider = await queryMiniOrder(order, openid);
    if (provider.paid) {
      await finishVerifiedCredit(admin, order.user_id, order.id);
      return { paid: true, closed: false };
    }
    if (provider.status === "CLOSED" || provider.status === "REVOKED" || provider.status === "NOTPAY") {
      const closed = await cancelProviderUnpaidOrder(admin, order.id, order.provider_payment_id);
      return { paid: false, closed };
    }
    return { paid: false, closed: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("WECHAT_API_404:ORDER_NOT_EXIST")) {
      const { error: updateError } = await admin.from("orders").update({ status: "failed" })
        .eq("id", order.id).eq("status", "pending");
      if (updateError) throw new Error("MINI_CNY_LOCAL_ORDER_CLOSE_FAILED");
      return { paid: false, closed: true };
    }
    throw error;
  }
}

export async function POST(req: Request) {
  if (!miniCnyJsapiTopupsEnabled()) return noStore({ error: "小程序人民币商户 JSAPI 尚未通过配置验收。", code: "MINI_JSAPI_NOT_READY" }, 503);
  const declared = Number(req.headers.get("content-length") || 0);
  if (Number.isFinite(declared) && declared > 8192) return noStore({ error: "请求过大" }, 413);
  if (!(await checkRateLimit(`mini-jsapi-topup-ip:${getClientIp(req)}`, 20, 600))) return noStore({ error: "请稍后再试" }, 429);

  const session = await requireMiniSession(req);
  if (!session) return noStore({ error: "登录状态已失效" }, 401);
  if (!session.accountConnected || !(await miniAccountLinked(session.userId))) {
    return noStore({ error: "请先连接灵犀场账户并确认到账账户。", code: "ACCOUNT_CONNECTION_REQUIRED" }, 409);
  }
  if (!(await checkRateLimit(`mini-jsapi-topup-user:${session.userId}`, 10, 600))) return noStore({ error: "请稍后再试" }, 429);

  let body: any;
  try { body = await req.json(); } catch { body = null; }
  const productId = typeof body?.productId === "string" ? body.productId : "";
  const requestId = typeof body?.requestId === "string" ? body.requestId : "";
  if (!PRODUCT_ID.test(productId) || !REQUEST_ID.test(requestId)) return noStore({ error: "充值金额或请求编号无效" }, 400);

  const product = getProduct(productId);
  const amountFen = Number(product?.sasiAmountFen || 0);
  if (!product || product.group !== "production" || !Number.isSafeInteger(amountFen) || amountFen < 1 ||
      Math.round(Number(product.priceRmb) * 100) !== amountFen) {
    return noStore({ error: "充值商品配置无效" }, 400);
  }

  const admin = createAdminClient();
  const legacyOutTradeNo = ("LXR" + requestId).slice(0, 32).toUpperCase();
  const legacyHashedOutTradeNo = "LXR" + createHash("sha256")
    .update(session.userId + ":" + requestId).digest("hex").slice(0, 29).toUpperCase();
  const outTradeNo = "LXJ" + createHash("sha256")
    .update(session.userId + ":" + requestId).digest("hex").slice(0, 29).toUpperCase();

  try {
    const { data: legacyOrders, error: legacyLookupError } = await admin.from("orders")
      .select("id,user_id,product_id,amount_rmb,status,provider_payment_id")
      .eq("provider", "wechat_mini_virtual")
      .in("provider_payment_id", [legacyOutTradeNo, legacyHashedOutTradeNo])
      .limit(2);
    if (legacyLookupError) throw new Error("MINI_CNY_LEGACY_ORDER_LOOKUP_FAILED");
    for (const legacy of legacyOrders || []) {
      if (legacy.user_id !== session.userId || legacy.product_id !== productId) {
        return conflict("旧版充值请求编号已关联其他订单，请核验原订单。", legacy.id);
      }
      const state = await reconcileVirtualToolOrder(legacy.id, session.userId);
      if (state.paid) return noStore({ orderId: legacy.id, paid: true, status: "paid" });
      if (state.closed) continue;
      return conflict("旧版充值订单仍在微信端核验，确认关闭前不会创建新订单。", legacy.id);
    }

    const { data: existing, error: existingError } = await admin.from("orders")
      .select("id,user_id,product_id,amount_rmb,status,provider_payment_id,provider,channel")
      .eq("provider", "wechat").eq("provider_payment_id", outTradeNo).maybeSingle();
    if (existingError) throw new Error("MINI_CNY_ORDER_LOOKUP_FAILED");
    if (existing) {
      if (existing.user_id !== session.userId || existing.product_id !== productId || existing.channel !== "mini-program") {
        return conflict("请求编号已关联其他订单，请核验原订单。", existing.id);
      }
      if (existing.status === "paid") {
        if (!(await hasCommittedCredit(admin, session.userId, existing.id))) {
          await finishVerifiedCredit(admin, session.userId, existing.id);
        }
        return noStore({ orderId: existing.id, paid: true, status: "paid" });
      }
      if (["failed", "refunded"].includes(existing.status)) {
        return noStore({ orderId: existing.id, closed: true, paid: false, status: existing.status });
      }
      if (existing.status !== "pending") return conflict("订单状态需要人工核验，请保留当前订单编号。", existing.id);
      const payment = await readPreparedPayment(admin, existing, session.openid, amountFen);
      if (payment) return noStore({ orderId: existing.id, payment, status: "pending" });
      const state = await closeUnpreparedOrder(admin, existing, session.openid);
      if (state.paid) return noStore({ orderId: existing.id, paid: true, status: "paid" });
      if (state.closed) return noStore({ orderId: existing.id, closed: true, paid: false, status: "failed" });
      return conflict("原订单仍在微信端核验，暂不能重新发起支付。", existing.id);
    }

    const { data: pendingLegacy, error: pendingLegacyError } = await admin.from("orders")
      .select("id,user_id,product_id,amount_rmb,status,provider_payment_id")
      .eq("user_id", session.userId).eq("provider", "wechat_mini_virtual")
      .eq("status", "pending").like("product_id", "sasi-balance-%")
      .order("created_at", { ascending: false }).limit(10);
    if (pendingLegacyError) throw new Error("MINI_CNY_PENDING_LEGACY_LOOKUP_FAILED");
    for (const pending of pendingLegacy || []) {
      const state = await reconcileVirtualToolOrder(pending.id, session.userId);
      if (state.paid || state.closed) continue;
      return conflict("上一笔旧版充值尚未完成核验，不能重复创建订单。", pending.id);
    }

    const orderId = randomUUID();
    const { data: reservation, error: reserveError } = await admin.rpc("reserve_mini_cny_jsapi_topup_order", {
      p_order_id: orderId,
      p_user_id: session.userId,
      p_product_id: productId,
      p_amount_fen: amountFen,
      p_out_trade_no: outTradeNo,
    });
    if (reserveError) throw new Error("MINI_CNY_JSAPI_ATOMIC_RESERVATION_FAILED");
    const reserved = Array.isArray(reservation) ? reservation[0] : reservation;
    if (!reserved?.ok) return conflict("已有一笔人民币充值订单尚未结束，请先核验该订单。", reserved?.orderId);

    const order = {
      id: orderId, user_id: session.userId, product_id: productId,
      amount_rmb: amountFen / 100, provider_payment_id: outTradeNo,
      provider: "wechat", channel: "mini-program", status: "pending",
    };
    let prepayId = "";
    try {
      prepayId = await createMiniJsapiOrder({
        outTradeNo,
        description: ("Lingxi Field CNY wallet top-up " + product.name).slice(0, 40),
        amountFen,
        notifyUrl: `${trustedSiteOrigin(req)}/api/pay/wechat/notify`,
        openid: session.openid,
      });
      const { error: eventError } = await admin.from("wechat_mini_payment_events").upsert({
        event_type: "mini_jsapi_topup_prepared",
        out_trade_no: outTradeNo,
        order_id: orderId,
        transaction_id: "prepay",
        payload: {
          appid: EXPECTED_WECHAT_MINI_APP_ID,
          openid: session.openid,
          amountFen,
          prepayId,
          paymentMethod: "WECHAT_PAY_API_V3_JSAPI",
        },
        handled: true,
      }, { onConflict: "event_type,out_trade_no,transaction_id" });
      if (eventError) throw new Error("MINI_CNY_PREPAY_EVENT_PERSIST_FAILED");
    } catch (error) {
      try {
        const state = await closeUnpreparedOrder(admin, order, session.openid);
        if (state.paid) return noStore({ orderId, paid: true, status: "paid" });
        if (state.closed) return noStore({ orderId, closed: true, paid: false, status: "failed" });
      } catch {}
      console.error("[mini CNY JSAPI create]", safeProviderCode(error));
      return noStore({ error: "微信预支付暂未完成，原订单已保留并正在核验。请稍后恢复原订单，不要重复充值。", orderId }, 503);
    }

    return noStore({ orderId, payment: buildMiniRequestPayment(prepayId), status: "pending" });
  } catch (error) {
    console.error("[mini CNY JSAPI route]", error instanceof Error ? error.message : "unknown");
    return noStore({ error: "充值订单准备未完成，原请求编号已保留；请稍后恢复核验，不要重复充值。" }, 503);
  }
}
