import { createAdminClient } from "@/lib/supabase/admin";
import { reconcileVirtualToolOrder } from "@/lib/mini/virtual-fulfillment";

// Use the existing money cron; no additional deployment or schedule is required.
export async function reconcileMiniPayments() {
  const admin = createAdminClient();
  const [events, orders] = await Promise.all([
    admin.from("wechat_mini_payment_events").select("order_id").eq("event_type", "virtual_delivery_ack_pending")
      .eq("handled", false).order("created_at").limit(5),
    admin.from("orders").select("id").eq("provider", "wechat_mini_virtual").eq("status", "pending")
      .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()).order("created_at", { ascending: false }).limit(5),
  ]);
  if (events.error || orders.error) throw new Error("MINI_RECONCILE_LOOKUP_FAILED");
  const ids = [...new Set([...(events.data || []).map(x => x.order_id), ...(orders.data || []).map(x => x.id)])].filter(Boolean);
  const results = await Promise.allSettled(ids.map(id => reconcileVirtualToolOrder(id)));
  return { checked: ids.length, failed: results.filter(x => x.status === "rejected").length };
}
