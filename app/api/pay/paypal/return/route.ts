import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { capturePaypalOrder } from "@/lib/paypal";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

export const runtime = "nodejs";
export const maxDuration = 30;

// 用户在 PayPal 页面点"同意付款"之后，PayPal 会把浏览器带回这个地址
// （附带它自己的 token / PayerID 参数，我们不需要用到，orderId 是我们自己
// 在 create 那一步塞进 URL 的）。这里负责真正把钱"扣下来"（capture），
// 扣款成功了才解锁内容，然后跳去最终该去的页面。
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const paypalToken = searchParams.get("token");
  const dest = searchParams.get("dest") || "/account";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lingxifield.com";

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}/membership?error=missing_order`);
  }

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order || order.provider !== "paypal" || !order.provider_payment_id || paypalToken !== order.provider_payment_id) {
    return NextResponse.redirect(`${baseUrl}/membership?error=order_not_found`);
  }

  // 已经处理过了（比如 webhook 先一步完成了 capture），直接放行去目的地，
  // 不用再扣一次款。
  if (order.status === "paid") {
    return NextResponse.redirect(`${baseUrl}${dest}`);
  }

  try {
    const result = await capturePaypalOrder(order.provider_payment_id, Number(order.amount_usd));
    if (result.status === "COMPLETED" || result.status === "ALREADY_CAPTURED") {
      const fulfillment = await fulfillPaidOrder(orderId)
      if (!fulfillment.ok) return NextResponse.redirect(`${baseUrl}/membership?pending=1`)
      return NextResponse.redirect(`${baseUrl}${dest}`);
    }
    // 比如 PENDING（PayPal 有时会对一些付款方式做人工风控审核）——这种
    // 不算失败，但也还没真的到账，交给 webhook 之后异步确认，先把用户
    // 带去一个"处理中"的提示，而不是直接当成失败。
    return NextResponse.redirect(`${baseUrl}/membership?pending=1`);
  } catch (e) {
    await admin.from("orders").update({ status: "failed" }).eq("id", orderId);
    return NextResponse.redirect(`${baseUrl}/membership?error=capture_failed`);
  }
}
