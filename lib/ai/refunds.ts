import { createAdminClient } from "@/lib/supabase/admin";

export async function reverseAiTopup(orderId: string, reason: string) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("reverse_ai_topup", {
    p_order_id: orderId,
    p_reason: reason.slice(0, 200),
  });
  if (error) throw error;
  return data;
}

export async function resolveAiRefund(
  requestId: string,
  resolution: "approved" | "rejected" | "completed",
  providerRefundId?: string | null,
  note?: string | null,
) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("resolve_ai_refund", {
    p_request_id: requestId,
    p_resolution: resolution,
    p_provider_refund_id: providerRefundId || null,
    p_note: note || null,
  });
  if (error) throw error;
  return data;
}
