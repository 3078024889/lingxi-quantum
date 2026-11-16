import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { checkRateLimit } from "@/lib/rate-limit";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";
import { queryWechatOrder } from "@/lib/wechatpay";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { EXPECTED_WECHAT_MINI_APP_ID } from "@/lib/mini/payment-readiness";

export const runtime = "nodejs";
export const maxDuration = 30;

function noStore(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}
async function hasCredit(admin: ReturnType<typeof createAdminClient>, userId: string, orderId: string) {
  const { data, error } = await admin.from("sasi_credit_ledger").select("reference_id")
    .eq("user_id", userId).eq("kind", "topup").eq("reference_id", orderId).maybeSingle();
  if (error) throw new Error("MINI_CNY_CREDIT_LOOKUP_FAILED");
  return Boolean(data);
}
async function commitCredit(admin: ReturnType<typeof createAdminClient>, userId: string, orderId: string) {
  const result = await fulfillPaidOrder(orderId, true);
  if (!result.ok || !(await hasCredit(admin, userId, orderId))) throw new Error("MINI_CNY_CREDIT_PENDING");
}
export async function GET(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return noStore({ error: "登录状态已失效" }, 401);
  if (!(await checkRateLimit(`mini-cny-status:${session.userId}`, 30, 60))) return noStore({ error: "请稍后查看订单" }, 429);

  const orderId = new URL(req.url).searchParams.get("orderId") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return noStore({ error: "订单无效" }, 400);

  const admin = createAdminClient();
  try {
    const { data: order, error } = await admin.from("orders")
      .select("id,user_id,product_id,amount_rmb,status,provider,provider_payment_id,channel")
      .eq("id", orderId).eq("user_id", session.userId).maybeSingle();
    if (error || !order || !String(order.product_id).startsWith("sasi-balance-")) return noStore({ error: "订单不存在" }, 404);

    if (order.provider === "wechat_mini_virtual") {
      return noStore(await reconcileVirtualToolOrder(order.id, session.userId));
    }
    if (order.provider !== "wechat" || order.channel !== "mini-program" || !order.provider_payment_id) {
      return noStore({ error: "订单支付通道不匹配" }, 409);
    }

    if (order.status === "paid") {
      if (!(await hasCredit(admin, session.userId, order.id))) await commitCredit(admin, session.userId, order.id);
      return noStore({ paid: true, status: "paid" });
    }
    if (["failed", "refunded"].includes(order.status)) {
      return noStore({ paid: false, closed: true, status: order.status });
    }
    if (order.status !== "pending") return noStore({ paid: false, status: order.status });

    const { data: event, error: eventError } = await admin.from("wechat_mini_payment_events").select("payload")
      .eq("event_type", "mini_jsapi_topup_prepared").eq("out_trade_no", order.provider_payment_id)
      .eq("order_id", order.id).eq("transaction_id", "prepay").maybeSingle();
    if (eventError || !event?.payload) throw new Error("MINI_CNY_PREPAY_EVENT_MISSING");
    const prepared = event.payload as any;
    if (prepared.openid !== session.openid || prepared.appid !== EXPECTED_WECHAT_MINI_APP_ID ||
        Number(prepared.amountFen) !== Math.round(Number(order.amount_rmb) * 100) ||
        typeof prepared.prepayId !== "string") throw new Error("MINI_CNY_PREPAY_EVENT_IDENTITY_MISMATCH");

    const provider = await queryWechatOrder(
      order.provider_payment_id,
      Math.round(Number(order.amount_rmb) * 100),
      EXPECTED_WECHAT_MINI_APP_ID
    );
    const raw = provider.raw as any;
    if (raw?.payer?.openid && String(raw.payer.openid) !== session.openid) throw new Error("MINI_CNY_PROVIDER_PAYER_MISMATCH");
    if (provider.paid) {
      await commitCredit(admin, session.userId, order.id);
      return noStore({ paid: true, status: "paid" });
    }
    if (provider.status === "CLOSED" || provider.status === "REVOKED") {
      const { error: closeError } = await admin.from("orders").update({ status: "failed" })
        .eq("id", order.id).eq("status", "pending");
      if (closeError) throw new Error("MINI_CNY_LOCAL_CLOSE_FAILED");
      return noStore({ paid: false, closed: true, status: "failed" });
    }
    return noStore({ paid: false, status: "pending", providerConfirmedUnpaid: provider.status === "NOTPAY" });
  } catch (error) {
    console.error("[mini CNY JSAPI status]", error instanceof Error ? error.message : "unknown");
    return noStore({ error: "付款结果仍在核验，请稍后重试；请勿重复充值。", paid: false }, 503);
  }
}
