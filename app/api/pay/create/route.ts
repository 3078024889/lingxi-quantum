import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import { createPaypalOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const { productId, returnPath } = await req.json();
    const product = getProduct(productId);
    if (!product) {
      return NextResponse.json({ error: "无效的项目" }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        product_id: product.id,
        product_type: product.type,
        amount_usd: product.priceUsd,
        status: "pending",
        provider: "paypal",
      })
      .select()
      .single();
    if (orderErr || !order) {
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lingxifield.com";
    const dest =
      typeof returnPath === "string" && returnPath.startsWith("/") ? returnPath : "/account?paid=1";

    try {
      const { id: paypalOrderId, approveUrl } = await createPaypalOrder({
        amountUsd: product.priceUsd,
        description: `灵犀 · ${product.name}`,
        referenceId: order.id,
        // 用户在 PayPal 付完款，会先回到这个中转接口，由它负责真正扣款
        // （capture）、解锁内容，再跳去 dest；不能让 PayPal 直接跳 dest，
        // 不然"钱到没到账"这件事就没有服务端环节去确认了。
        returnUrl: `${baseUrl}/api/pay/paypal/return?orderId=${order.id}&dest=${encodeURIComponent(dest)}`,
        cancelUrl: `${baseUrl}/membership?canceled=1`,
      });

      await admin.from("orders").update({ provider_payment_id: paypalOrderId }).eq("id", order.id);

      return NextResponse.json({ url: approveUrl });
    } catch (e) {
      await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
      return NextResponse.json(
        { error: "支付网关返回异常", detail: e instanceof Error ? e.message : String(e) },
        { status: 502 }
      );
    }
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
