import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";

// 一笔订单"确认已付款"之后要做的事——解锁永久内容 / 延长订阅有效期。
// 之前 NOWPayments 的 webhook 里就是这套逻辑，现在换成 PayPal，逻辑原样保留，
// 抽出来是因为现在有两条路径都可能触发"这笔订单付款成功了"：
//   1. 用户在 PayPal 付完款、跳转回我们网站那一刻（/api/pay/paypal/return）
//   2. PayPal 自己异步推送的 Webhook（/api/pay/webhook），作为兜底——
//      万一用户付完款直接关掉了浏览器标签页，没有真的跳转回来，
//      Webhook 这条路径能保证订单还是会被正确解锁。
// 两条路径谁先到都行，这个函数本身通过"订单状态是否已经是 paid"做了
// 幂等处理，不会因为两条路径都触发一次而重复加两次订阅时长。
export async function fulfillPaidOrder(orderId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order || order.status === "paid") return; // 已经处理过，或者订单本身不存在

  const product = getProduct(order.product_id);
  const now = new Date();

  if (order.product_type === "permanent") {
    await admin.from("unlocks").upsert({ user_id: order.user_id, product_id: order.product_id });
    // 买"四项合集"时，把四项单品也一并解锁
    if (order.product_id === "bundle") {
      const items = ["breath", "intuition", "heart-reset", "ascending-heart"];
      for (const pid of items) {
        await admin.from("unlocks").upsert({ user_id: order.user_id, product_id: pid });
      }
    }
  } else {
    const days = product?.days ?? 30;
    const { data: profile } = await admin
      .from("profiles")
      .select("manifest_until")
      .eq("id", order.user_id)
      .single();
    const current =
      profile?.manifest_until && new Date(profile.manifest_until) > now
        ? new Date(profile.manifest_until)
        : now;
    const until = new Date(current.getTime() + days * 86400000);
    await admin.from("profiles").update({ manifest_until: until.toISOString() }).eq("id", order.user_id);
  }

  await admin.from("orders").update({ status: "paid", paid_at: now.toISOString() }).eq("id", orderId);
}
