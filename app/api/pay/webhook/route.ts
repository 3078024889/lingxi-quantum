import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPaypalWebhook } from "@/lib/paypal";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

// PayPal 异步 Webhook——用户付完款那一刻，PayPal 会独立推送一份通知过来，
// 跟"用户跳转回 /api/pay/paypal/return"是两条互相独立的路径，谁先到都行，
// 这里存在的意义是兜底：万一用户付完款之后没有真的跳转回网站（比如中途
// 关掉了浏览器标签页），这条路径依然能保证订单被正确解锁，不会因为一次
// 网络波动就白白收了钱却没给用户开通。
export async function POST(req: Request) {
  const raw = await req.text();

  const verified = await verifyPaypalWebhook(req.headers, raw);
  if (!verified) {
    return NextResponse.json({ error: "签名校验失败或未配置 PAYPAL_WEBHOOK_ID" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "无效负载" }, { status: 400 });
  }

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    // PayPal 的订单号，在我们这边对应 orders.provider_payment_id，需要反查
    // 出我们自己的订单 id 再去 fulfill（fulfillPaidOrder 认的是我们自己的
    // orders.id，不是 PayPal 的订单号）。
    const paypalOrderId =
      event.resource?.supplementary_data?.related_ids?.order_id || event.resource?.id;
    if (!paypalOrderId) return NextResponse.json({ ok: true });

    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("provider_payment_id", paypalOrderId)
      .single();
    if (order) {
      await fulfillPaidOrder(order.id);
    }
  }

  return NextResponse.json({ ok: true });
}
