import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import { createPaypalOrder } from "@/lib/paypal";

export async function POST(req: Request) {
  try {
    const { productId, submissionId, returnPath } = await req.json();
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
        // 生命图谱报告这类订单，顺手把是"哪一份提交记录"记下来——之前
        // orders 表跟 life_map_submissions 表之间完全没有关联，同一个
        // 人测过好几次的话，从后台订单记录反查"这笔钱对应哪份报告"，
        // 只能靠时间去猜，容易猜错（复制错了 orders 表自己的 id，去当
        // life_map_submissions 的 id 用，那两个是完全不同的表，各自的
        // id 互不相通）。这里加一列直接存好，以后一眼就能对上。
        ...(typeof submissionId === "string" ? { submission_id: submissionId } : {}),
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
