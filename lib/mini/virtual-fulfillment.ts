import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { queryVirtualOrder, notifyVirtualGoodsProvided, type XpayOrder } from "@/lib/mini/xpay";
import { miniSandboxUserAllowed, virtualTopupGoods, type VirtualOrderSnapshot } from "@/lib/mini/virtual-goods";
import { after } from "next/server";

export function virtualOrderPaid(order: XpayOrder, outTradeNo: string, snapshot: VirtualOrderSnapshot, amountFen: number) {
  return order.order_id === outTradeNo && [2, 3, 4].includes(order.status) &&
    [0, 7].includes(order.order_type) && order.env_type === (snapshot.env === 0 ? 1 : 2) &&
    order.order_fee === amountFen && order.paid_fee === amountFen &&
    (order.left_fee === undefined || order.left_fee === amountFen) &&
    Number.isSafeInteger(amountFen) && amountFen > 0 &&
    snapshot.unitPriceFen * snapshot.quantity === amountFen;
}

// Both notifications and owner polling use a provider query; client success never grants access.
export async function reconcileVirtualToolOrder(orderId: string, ownerId?: string) {
  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders")
    .select("id,user_id,product_id,amount_rmb,provider_payment_id,status")
    .eq("id", orderId).eq("provider", "wechat_mini_virtual").maybeSingle();
  if (error || !order || (ownerId && order.user_id !== ownerId)) throw new Error("MINI_ORDER_NOT_FOUND");
  const { data: creation, error: snapshotError } = await admin.from("wechat_mini_payment_events")
    .select("payload").eq("event_type", order.product_id.startsWith("sasi-balance-") ? "virtual_topup_order_created" : "virtual_tool_order_created").eq("order_id", order.id).maybeSingle();
  const snapshot = creation?.payload as VirtualOrderSnapshot | undefined;
  if (snapshotError || !snapshot || snapshot.orderId !== order.id ||
      ![0, 1].includes(snapshot.env)) throw new Error("MINI_ORDER_SNAPSHOT_MISSING");
  if (snapshot.kind === "topup") {
    const goods = virtualTopupGoods(order.product_id);
    if (!goods || snapshot.productId !== order.product_id || snapshot.skuId !== goods.skuId ||
        snapshot.quantity !== goods.quantity || snapshot.unitPriceFen !== goods.unitPriceFen ||
        goods.amountFen !== Math.round(Number(order.amount_rmb) * 100)) throw new Error("MINI_ORDER_SNAPSHOT_MISSING");
    if (snapshot.env !== 0) throw new Error("MINI_TOPUP_SANDBOX_NO_CREDIT");
  } else if (order.product_id !== `toolquote:${snapshot.quoteId}`) throw new Error("MINI_ORDER_SNAPSHOT_MISSING");
  if (snapshot.env === 1 && !miniSandboxUserAllowed(order.user_id)) throw new Error("MINI_SANDBOX_USER_REQUIRED");
  const remote = await queryVirtualOrder(snapshot.openid, order.provider_payment_id, snapshot.env);
  // Only the provider can establish that this order can no longer be paid.
  // A client cancellation or a timeout is never sufficient to clear it.
  if (remote.order_id === order.provider_payment_id && remote.status === 6 &&
      remote.paid_fee === 0 && remote.order_fee === Math.round(Number(order.amount_rmb) * 100) &&
      [0, 7].includes(remote.order_type) && remote.env_type === (snapshot.env === 0 ? 1 : 2) &&
      ["pending", "canceled"].includes(order.status)) {
    if (order.status === "pending") {
      const canceled = await admin.from("orders").update({ status: "canceled" })
        .eq("id", order.id).eq("status", "pending").select("id");
      if (canceled.error || canceled.data?.length !== 1) throw new Error("MINI_ORDER_REQUIRES_REVIEW");
    }
    return { paid: false, status: "canceled", closed: true };
  }
  if (!virtualOrderPaid(remote, order.provider_payment_id, snapshot, Math.round(Number(order.amount_rmb) * 100))) {
    const providerConfirmedUnpaid = remote.order_id === order.provider_payment_id && remote.status === 1 &&
      remote.paid_fee === 0 && remote.order_fee === Math.round(Number(order.amount_rmb) * 100) &&
      [0, 7].includes(remote.order_type) && remote.env_type === (snapshot.env === 0 ? 1 : 2);
    return { paid: false, status: order.status, providerConfirmedUnpaid };
  }
  if (!["pending", "paid"].includes(order.status)) throw new Error("MINI_ORDER_REQUIRES_REVIEW");
  const result = await fulfillPaidOrder(order.id);
  if (!result.ok) throw new Error("MINI_FULFILLMENT_FAILED");
  // A platform delivery acknowledgement cannot undo a committed wallet credit.
  // Persist the retry before attempting delivery, so subsequent owner checks can retry.
  if (remote.status !== 4) {
    const event = { event_type: "virtual_delivery_ack_pending", out_trade_no: order.provider_payment_id,
      order_id: order.id, transaction_id: "delivery", payload: { env: snapshot.env }, handled: false };
    after(async () => { try {
      const saved = await admin.from("wechat_mini_payment_events").upsert(event,
        { onConflict: "event_type,out_trade_no,transaction_id" });
      if (saved.error) throw new Error("MINI_DELIVERY_RETRY_PERSIST_FAILED");
      await notifyVirtualGoodsProvided(order.provider_payment_id, snapshot.env);
      await admin.from("wechat_mini_payment_events").update({ handled: true })
        .eq("event_type", event.event_type).eq("order_id", order.id);
    } catch (error) {
      console.error("[mini delivery ack] credited order requires retry", order.id,
        error instanceof Error ? error.message : "unknown");
    } });
  } else {
    after(async () => { try {
      await admin.from("wechat_mini_payment_events").update({ handled: true })
        .eq("event_type", "virtual_delivery_ack_pending").eq("order_id", order.id);
    } catch (error) {
      console.error("[mini delivery ack] completion recording requires retry", order.id);
    } });
  }
  return { paid: true, status: "paid" };
}
