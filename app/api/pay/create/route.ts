import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();
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
        provider: "nowpayments",
      })
      .select()
      .single();
    if (orderErr || !order) {
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
    }

    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://lingxifield.com";
    if (!apiKey) {
      return NextResponse.json({ error: "支付未配置" }, { status: 500 });
    }

    const resp = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount: product.priceUsd,
        price_currency: "usd",
        order_id: order.id,
        order_description: `灵犀 · ${product.name}`,
        ipn_callback_url: `${baseUrl}/api/pay/webhook`,
        success_url: `${baseUrl}/account?paid=1`,
        cancel_url: `${baseUrl}/membership?canceled=1`,
      }),
    });

    const data = await resp.json();
    if (!resp.ok || !data.invoice_url) {
      return NextResponse.json(
        { error: "支付网关返回异常", detail: data },
        { status: 502 }
      );
    }

    await admin
      .from("orders")
      .update({ provider_payment_id: String(data.id ?? "") })
      .eq("id", order.id);

    return NextResponse.json({ url: data.invoice_url });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
