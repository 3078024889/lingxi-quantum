import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { fulfillPaidOrder } from "@/lib/fulfill-order";
import { queryWechatOrder } from "@/lib/wechatpay";
import { queryAlipayTrade } from "@/lib/alipay";
import { capturePaypalOrder, queryPaypalOrder } from "@/lib/paypal";

type RecoveryOrder = {
  id: string;
  status: string;
  provider: string | null;
  provider_payment_id: string | null;
  amount_rmb: number | null;
  amount_usd: number | null;
};

async function grantFor(userId: string, quoteId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("tool_export_grants")
    .select("id,tool_id,quantity,unit_name,amount_rmb,consumed_quantity,created_at")
    .eq("quote_id", quoteId)
    .eq("user_id", userId)
    .maybeSingle();
  return data ?? null;
}

async function repairAlreadyPaidOrder(orderId: string) {
  const admin = createAdminClient();
  const repair = await admin.rpc("repair_tool_paid_grant", { p_order_id: orderId });
  if (!repair.error) {
    const result = repair.data as { ok?: boolean; error?: string } | null;
    return { ok: result?.ok === true, error: result?.error ?? null, method: "repair-rpc" as const };
  }
  const fallback = await fulfillPaidOrder(orderId);
  return { ok: fallback.ok, error: fallback.error ?? null, method: "normal-fulfillment" as const };
}

export async function recoverToolQuotePayment(input: { userId: string; quoteId: string }) {
  const admin = createAdminClient();
  const { data: quote } = await admin
    .from("tool_payment_quotes")
    .select("id,user_id,tool_id,status,expires_at")
    .eq("id", input.quoteId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!quote) return { ok: false as const, paid: false, error: "QUOTE_NOT_FOUND" };

  const existingGrant = await grantFor(input.userId, input.quoteId);
  if (existingGrant) return { ok: true as const, paid: true, grant: existingGrant, recovery: "grant-exists" };

  const { data: orders, error: ordersError } = await admin
    .from("orders")
    .select("id,status,provider,provider_payment_id,amount_rmb,amount_usd,created_at")
    .eq("user_id", input.userId)
    .eq("product_id", `toolquote:${input.quoteId}`)
    .order("created_at", { ascending: false })
    .limit(12);

  if (ordersError) return { ok: false as const, paid: false, error: "ORDER_LOOKUP_FAILED" };

  const rows = (orders ?? []) as RecoveryOrder[];

  for (const order of rows) {
    if (order.status !== "paid") continue;
    const repaired = await repairAlreadyPaidOrder(order.id);
    if (repaired.ok) {
      const grant = await grantFor(input.userId, input.quoteId);
      if (grant) return { ok: true as const, paid: true, grant, recovery: repaired.method, orderId: order.id };
    }
  }

  for (const order of rows) {
    if (order.status === "paid" || !order.provider_payment_id) continue;
    try {
      let confirmed = false;
      let detail = "";

      if (order.provider === "wechat" && order.amount_rmb != null) {
        const q = await queryWechatOrder(order.provider_payment_id, Math.round(Number(order.amount_rmb) * 100));
        confirmed = q.paid;
        detail = q.paid ? "WECHAT_CONFIRMED" : "WECHAT_NOT_PAID";
      } else if (order.provider === "alipay" && order.amount_rmb != null) {
        const q = await queryAlipayTrade({
          outTradeNo: order.provider_payment_id,
          expectedAmountRmb: Number(order.amount_rmb),
        });
        confirmed = q.paid;
        detail = q.paid ? "ALIPAY_CONFIRMED" : q.tradeStatus;
      } else if (order.provider === "paypal" && order.amount_usd != null) {
        const q = await queryPaypalOrder(order.provider_payment_id, Number(order.amount_usd), order.id);
        if (q.status === "COMPLETED") {
          confirmed = true;
          detail = "PAYPAL_ALREADY_CAPTURED";
        } else if (q.status === "APPROVED") {
          const captured = await capturePaypalOrder(order.provider_payment_id, Number(order.amount_usd));
          confirmed = captured.status === "COMPLETED" || captured.status === "ALREADY_CAPTURED";
          detail = `PAYPAL_${captured.status}`;
        }
      }

      if (!confirmed) continue;

      const fulfilled = await fulfillPaidOrder(order.id);
      if (!fulfilled.ok) {
        return {
          ok: false as const,
          paid: false,
          error: "PAYMENT_CONFIRMED_FULFILLMENT_PENDING",
          detail: fulfilled.error ?? detail,
          orderId: order.id,
        };
      }

      const grant = await grantFor(input.userId, input.quoteId);
      if (grant) return { ok: true as const, paid: true, grant, recovery: detail, orderId: order.id };
    } catch (error) {
      console.error("[tool payment recovery]", {
        quoteId: input.quoteId,
        orderId: order.id,
        provider: order.provider,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    ok: true as const,
    paid: false,
    quoteStatus: quote.status,
    orders: rows.map((order) => ({
      id: order.id,
      status: order.status,
      provider: order.provider,
      providerPaymentCreated: Boolean(order.provider_payment_id),
    })),
  };
}
