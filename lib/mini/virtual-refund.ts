import { createAdminClient } from "@/lib/supabase/admin";
import { queryVirtualOrder, queryVirtualRefund, type XpayOrder } from "@/lib/mini/xpay";
import type { VirtualOrderSnapshot } from "@/lib/mini/virtual-goods";

export type MiniRefundNotice = {
  Event?: string; OpenId?: string; MchOrderId?: string; MchRefundId?: string;
  WxRefundId?: string; RefundFee?: number; RetCode?: number;
};

// A signed push wakes reconciliation; only fresh provider queries authorize accounting.
export function verifiedRefundAmount(original: XpayOrder, refund: XpayOrder, notice: MiniRefundNotice, expectedFen: number) {
  const valid = Number.isSafeInteger(expectedFen) && expectedFen > 0 &&
    notice.RetCode === 0 && Number.isSafeInteger(notice.RefundFee) && Number(notice.RefundFee) > 0 &&
    original.order_id === notice.MchOrderId && [0, 7].includes(original.order_type) &&
    [2, 3, 4, 5, 8].includes(original.status) && original.env_type === 1 &&
    original.order_fee === expectedFen && original.paid_fee === expectedFen &&
    Number.isSafeInteger(original.left_fee) && Number(original.left_fee) >= 0 && Number(original.left_fee) < expectedFen &&
    refund.env_type === 1 && [1, 8].includes(refund.order_type) && refund.status === 8 &&
    refund.refund_fee === notice.RefundFee &&
    (notice.MchRefundId ? refund.order_id === notice.MchRefundId : Boolean(notice.WxRefundId && refund.wx_order_id === notice.WxRefundId));
  if (!valid) {
    // Operational diagnostics contain no payer identity, credentials or transaction IDs.
    console.error('[mini refund verification]', { originalStatus: original.status, originalType: original.order_type,
      originalEnv: original.env_type, orderFee: original.order_fee, paidFee: original.paid_fee, leftFee: original.left_fee,
      refundStatus: refund.status, refundType: refund.order_type, refundEnv: refund.env_type, refundFee: refund.refund_fee,
      expectedFen, noticeFee: notice.RefundFee, originalIdMatches: original.order_id === notice.MchOrderId,
      refundIdMatches: notice.MchRefundId ? refund.order_id === notice.MchRefundId : refund.wx_order_id === notice.WxRefundId });
    throw new Error("MINI_REFUND_NOT_CONFIRMED");
  }
  const cumulative = expectedFen - Number(original.left_fee);
  if (cumulative < Number(refund.refund_fee)) throw new Error("MINI_REFUND_AMOUNT_MISMATCH");
  return cumulative;
}

export async function reconcileVirtualRefund(notice: MiniRefundNotice) {
  if (notice.Event !== "xpay_refund_notify" || !notice.MchOrderId || !notice.OpenId ||
      !(notice.MchRefundId || notice.WxRefundId) || notice.RetCode !== 0) throw new Error("MINI_REFUND_FIELDS_MISSING");
  const admin = createAdminClient();
  const { data: order, error } = await admin.from("orders").select("id,user_id,product_id,amount_rmb")
    .eq("provider", "wechat_mini_virtual").eq("provider_payment_id", notice.MchOrderId).maybeSingle();
  if (error || !order) throw new Error("MINI_REFUND_ORDER_MISSING");
  const { data: creation, error: snapshotError } = await admin.from("wechat_mini_payment_events").select("payload")
    .eq("order_id", order.id).eq("event_type", order.product_id.startsWith("sasi-balance-") ? "virtual_topup_order_created" : "virtual_tool_order_created").maybeSingle();
  const snapshot = creation?.payload as VirtualOrderSnapshot | undefined;
  if (snapshotError || !snapshot || snapshot.orderId !== order.id || snapshot.openid !== notice.OpenId || snapshot.env !== 0) throw new Error("MINI_REFUND_IDENTITY_MISMATCH");
  const original = await queryVirtualOrder(snapshot.openid, notice.MchOrderId, 0);
  const refund = await queryVirtualRefund(snapshot.openid, notice.MchRefundId, notice.WxRefundId, 0);
  const cumulativeFen = verifiedRefundAmount(original, refund, notice, Math.round(Number(order.amount_rmb) * 100));
  const result = await admin.rpc("mini_order_refund_v1", { p_order_id: order.id, p_cumulative_fen: cumulativeFen, p_refund_id: notice.WxRefundId || notice.MchRefundId });
  if (result.error || result.data?.ok !== true) throw new Error("MINI_REFUND_ACCOUNTING_PENDING");
  return { orderId: order.id, ...result.data };
}

export async function retryVirtualRefunds(limit = 5, userId?: string) {
  const admin = createAdminClient();
  let query = admin.from("wechat_mini_payment_events").select("id,payload")
    .eq("event_type", "xpay_refund_notify").eq("handled", false).order("created_at", { ascending: true });
  if (userId) {
    const owned = await admin.from("orders").select("provider_payment_id").eq("user_id", userId).eq("provider", "wechat_mini_virtual");
    if (owned.error) throw new Error("MINI_REFUND_INBOX_UNAVAILABLE");
    const ids = (owned.data || []).map(row => row.provider_payment_id).filter(Boolean);
    if (!ids.length) return { results: [] };
    query = query.in("out_trade_no", ids);
  }
  const { data, error } = await query.limit(Math.max(1, Math.min(5, limit)));
  if (error) throw new Error("MINI_REFUND_INBOX_UNAVAILABLE");
  const results: { id: number; processed: boolean }[] = [];
  for (const row of data || []) {
    try {
      if ((row.payload as MiniRefundNotice)?.RetCode !== 0) {
        const saved = await admin.from("wechat_mini_payment_events").update({ handled: true }).eq("id", row.id);
        results.push({ id: row.id, processed: !saved.error });
        continue;
      }
      const result = await reconcileVirtualRefund(row.payload as MiniRefundNotice);
      const saved = await admin.from("wechat_mini_payment_events").update({ order_id: result.orderId, handled: true }).eq("id", row.id);
      results.push({ id: row.id, processed: !saved.error });
    } catch (error) {
      console.error('[mini refund retry]', row.id, error instanceof Error ? error.message : 'unknown');
      results.push({ id: row.id, processed: false });
    }
  }
  return { results };
}
