import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import { createPaypalOrder } from "@/lib/paypal";

export const runtime = "nodejs";
export const maxDuration = 30;

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

    // 顺手把姓名也存一份进 orders 表——同一个人可能拿不同名字测过好
    // 几次，只存 submission_id 的话，在 Supabase 表格编辑器里想认出
    // "这是哪一份"，还是得跳到另一张表核对，直接把名字带过来，一眼
    // 就能看清楚。之前这里写死只查 life_map_submissions 一张表，
    // 摇签、塔罗三张牌阵这些新产品的订单，查不到名字（不报错，只是
    // 静默留空）——这次按 productId 对应到正确的表。
    const SUBMISSION_TABLE_BY_PRODUCT: Record<string, string> = {
      "life-map-report": "life_map_submissions",
      "relationship-resonance": "relationship_submissions",
      "qian-reading": "qian_submissions",
      "tarot-reading": "tarot_reading_submissions",
      "resilience-report": "resilience_submissions",
      "romance-report": "romance_submissions",
      "daily-tide-report": "daily_tide_submissions",
      "wealth-report": "wealth_submissions",
    };
    let submissionName: string | null = null;
    const submissionTable = SUBMISSION_TABLE_BY_PRODUCT[productId];
    if (typeof submissionId === "string" && submissionTable) {
      const isRelationship = submissionTable === "relationship_submissions";
      // v225：加上 .eq("user_id", user.id)——之前这里只按 submissionId 查，
      // 没确认这份提交记录是不是当前下单的人自己的，理论上有人可以传别人
      // 的 submissionId，把别人的名字写进自己的订单备注里。
      const { data: sub } = await admin
        .from(submissionTable)
        .select(isRelationship ? "name_a, name_b" : "name")
        .eq("id", submissionId)
        .eq("user_id", user.id)
        .single();
      const subData = sub as { name?: string; name_a?: string; name_b?: string } | null;
      submissionName = isRelationship
        ? subData?.name_a && subData?.name_b ? `${subData.name_a} × ${subData.name_b}` : null
        : subData?.name ?? null;
    }

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        product_id: product.id,
        product_type: product.type,
        amount_usd: product.priceUsd,
        status: "pending",
        provider: "paypal",
        ...(typeof submissionId === "string" ? { submission_id: submissionId } : {}),
        ...(submissionName ? { submission_name: submissionName } : {}),
      })
      .select()
      .single();
    if (orderErr || !order) {
      return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lingxifield.com";
    const dest =
      typeof returnPath === "string" && returnPath.startsWith("/") ? returnPath : "/account?payment=complete";

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
        { error: "支付网关返回异常"},
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
