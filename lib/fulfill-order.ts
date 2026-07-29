import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";

// 一笔订单"确认已付款"之后要做的事——解锁永久内容 / 延长订阅有效期。
// 之前 NOWPayments 的 webhook 里就是这套逻辑，现在换成 PayPal/微信，逻辑原样保留，
// 抽出来是因为现在有两条路径都可能触发"这笔订单付款成功了"：
//   1. 用户在 PayPal/微信付完款、跳转回我们网站那一刻
//   2. 支付渠道自己异步推送的 Webhook，作为兜底——
//      万一用户付完款直接关掉了浏览器标签页，没有真的跳转回来，
//      Webhook 这条路径能保证订单还是会被正确解锁。
// 两条路径谁先到都行，这个函数本身通过"订单状态是否已经是 paid"做了
// 幂等处理，不会因为两条路径都触发一次而重复加两次订阅时长。
//
// v253：真实事故复盘——之前这里每一处 .upsert()/.update() 都没有检查
// 返回结果里的error，不管写入解锁记录这一步成不成功，最后都无条件把
// 订单标记成"paid"。这意味着：如果解锁记录因为任何原因（环境变量
// 缺失、权限、网络抖动）写入失败，函数不会报错、也不会让这笔订单
// 保持"待处理"状态方便下次重试，而是"假装"这一步成功了，直接把订单
// 标记成已支付——查询接口看到订单状态是paid，就告诉前端"付款成功"、
// 带用户跳转过去，但真正该写进去的解锁记录其实从来没有真的写成功过。
// 这正是"钱付了、页面也提示成功跳转、但内容还是锁着"这个现象的根因。
// 这次重写：每一步写入都检查错误、记录到日志；并且只有解锁/订阅这一步
// 真正成功了，才会把订单标记为paid——如果失败，订单会保持原状态，
// 场域入口"待确认订单"里能再次手动查询、重试，不会造成"钱到账了，
// 但系统永远处于不一致状态、还无法重试"这种更糟的局面。
export async function fulfillPaidOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: order, error: fetchErr } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (fetchErr || !order) {
    console.error("[fulfillPaidOrder] 找不到订单:", orderId, fetchErr);
    return { ok: false, error: "订单不存在" };
  }
  if (order.status === "paid") return { ok: true }; // 已经处理过，幂等直接返回成功

  const product = getProduct(order.product_id);
  const now = new Date();

  const MANIFEST_SUBSCRIPTION_IDS = ["day", "month", "year"];

  if (order.product_type === "permanent") {
    const { error: upErr } = await admin.from("unlocks").upsert({ user_id: order.user_id, product_id: order.product_id }, { onConflict: "user_id,product_id" });
    if (upErr) {
      console.error("[fulfillPaidOrder] 写入unlocks失败，订单:", orderId, "product:", order.product_id, "错误:", upErr);
      return { ok: false, error: `解锁记录写入失败：${upErr.message}` };
    }
    // 买"四项合集"时，把四项单品也一并解锁
    if (order.product_id === "bundle") {
      const items = ["breath", "intuition", "heart-reset", "ascending-heart"];
      for (const pid of items) {
        const { error: itemErr } = await admin.from("unlocks").upsert({ user_id: order.user_id, product_id: pid }, { onConflict: "user_id,product_id" });
        if (itemErr) {
          console.error("[fulfillPaidOrder] 合集子项写入失败:", pid, itemErr);
          // 合集子项失败不阻断主流程——主产品已经解锁成功，子项失败
          // 只记日志，不让整单回退成"未支付"（那样反而更糟，用户会
          // 被要求重新付一次已经付过的钱）。
        }
      }
    }
  } else if (MANIFEST_SUBSCRIPTION_IDS.includes(order.product_id)) {
    // "显化与梦境解读"这三档，用的是profiles.manifest_until这一个共享
    // 字段——这是这三档产品专属的原有机制，不受下面这条新分支影响。
    const days = product?.days ?? 30;
    const { data: profile, error: profFetchErr } = await admin
      .from("profiles")
      .select("manifest_until")
      .eq("id", order.user_id)
      .single();
    if (profFetchErr) {
      console.error("[fulfillPaidOrder] 读取profile失败:", orderId, profFetchErr);
      return { ok: false, error: `读取会员信息失败：${profFetchErr.message}` };
    }
    const current =
      profile?.manifest_until && new Date(profile.manifest_until) > now
        ? new Date(profile.manifest_until)
        : now;
    const until = new Date(current.getTime() + days * 86400000);
    const { error: profUpdErr } = await admin.from("profiles").update({ manifest_until: until.toISOString() }).eq("id", order.user_id);
    if (profUpdErr) {
      console.error("[fulfillPaidOrder] 更新manifest_until失败:", orderId, profUpdErr);
      return { ok: false, error: `延长会员有效期失败：${profUpdErr.message}` };
    }
  } else {
    // "多维叙事·年度解锁""灵犀场·全构造解锁"这两个订阅制产品——各自
    // 在unlocks表里记一条带到期时间的记录，不跟显化模块共用字段，
    // 也不会互相覆盖。如果之前已经解锁过、还没到期，续费是在原有
    // 到期时间基础上累加，不是从今天重新算。
    const days = product?.days ?? 365;
    const { data: existing } = await admin
      .from("unlocks")
      .select("expires_at")
      .eq("user_id", order.user_id)
      .eq("product_id", order.product_id)
      .single();
    const current =
      existing?.expires_at && new Date(existing.expires_at) > now
        ? new Date(existing.expires_at)
        : now;
    const until = new Date(current.getTime() + days * 86400000);
    const { error: subErr } = await admin.from("unlocks").upsert({ user_id: order.user_id, product_id: order.product_id, expires_at: until.toISOString() }, { onConflict: "user_id,product_id" });
    if (subErr) {
      console.error("[fulfillPaidOrder] 写入订阅制unlocks失败:", orderId, order.product_id, subErr);
      return { ok: false, error: `订阅解锁写入失败：${subErr.message}` };
    }
  }

  const { error: orderUpdErr } = await admin.from("orders").update({ status: "paid", paid_at: now.toISOString() }).eq("id", orderId);
  if (orderUpdErr) {
    console.error("[fulfillPaidOrder] 更新订单状态失败（解锁本身已经成功，只是订单状态没标记上）:", orderId, orderUpdErr);
    // 解锁已经成功写入了，这一步只是标记订单状态失败——不算整体失败，
    // 用户已经拿到了解锁权限，只是订单状态可能需要人工核对。
  }
  return { ok: true };
}
