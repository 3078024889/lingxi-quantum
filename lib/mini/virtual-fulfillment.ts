import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { queryVirtualOrder, notifyVirtualGoodsProvided, type XpayOrder } from "@/lib/mini/xpay";
import { miniSandboxUserAllowed, type VirtualOrderSnapshot } from "@/lib/mini/virtual-goods";

export function virtualOrderPaid(order: XpayOrder, outTradeNo: string, snapshot: VirtualOrderSnapshot, amountFen: number) {
  return order.order_id === outTradeNo && [2, 3, 4].includes(order.status) &&
    [0, 7].includes(order.order_type) && order.env_type === (snapshot.env === 0 ? 1 : 2) &&
    order.order_fee === amountFen && order.paid_fee === amountFen &&
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
    .select("payload").eq("event_type", "virtual_tool_order_created").eq("order_id", order.id).maybeSingle();
  const snapshot = creation?.payload as VirtualOrderSnapshot | undefined;
  if (snapshotError || !snapshot || snapshot.orderId !== order.id ||
      order.product_id !== `toolquote:${snapshot.quoteId}` || ![0, 1].includes(snapshot.env)) throw new Error("MINI_ORDER_SNAPSHOT_MISSING");
  if (snapshot.env === 1 && !miniSandboxUserAllowed(order.user_id)) throw new Error("MINI_SANDBOX_USER_REQUIRED");
  const remote = await queryVirtualOrder(snapshot.openid, order.provider_payment_id, snapshot.env);
  if (!virtualOrderPaid(remote, order.provider_payment_id, snapshot, Math.round(Number(order.amount_rmb) * 100))) {
    return { paid: false, status: order.status };
  }
  if (!["pending", "paid"].includes(order.status)) throw new Error("MINI_ORDER_REQUIRES_REVIEW");
  const result = await fulfillPaidOrder(order.id);
  if (!result.ok) throw new Error("MINI_FULFILLMENT_FAILED");
  if (remote.status !== 4) await notifyVirtualGoodsProvided(order.provider_payment_id, snapshot.env);
  return { paid: true, status: "paid" };
}
