import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import { alipayEnabled, alipaySiteUrl, createAlipayPaymentUrl } from "@/lib/alipay";

export const runtime = "nodejs";
export const maxDuration = 30;

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

export async function POST(req: Request) {
  try {
    if (!alipayEnabled()) {
      return NextResponse.json({ error: "支付宝正在完成上线审核，请暂时使用微信支付。" }, { status: 503 });
    }
    const { productId, submissionId, returnPath } = await req.json();
    if (productId === "stellar-trace") {
      return NextResponse.json({ error: "星迹已下架，不再接受新订单。" }, { status: 410 });
    }
    const product = getProduct(productId);
    if (!product) return NextResponse.json({ error: "无效的项目" }, { status: 400 });

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const admin = createAdminClient();
    let submissionName: string | null = null;
    const submissionTable = SUBMISSION_TABLE_BY_PRODUCT[productId];
    if (typeof submissionId === "string" && submissionTable) {
      const isRelationship = submissionTable === "relationship_submissions";
      const { data: sub } = await admin
        .from(submissionTable)
        .select(isRelationship ? "name_a, name_b" : "name")
        .eq("id", submissionId)
        .eq("user_id", user.id)
        .single();
      const data = sub as { name?: string; name_a?: string; name_b?: string } | null;
      submissionName = isRelationship
        ? data?.name_a && data?.name_b ? `${data.name_a} × ${data.name_b}` : null
        : data?.name ?? null;
    }

    const { data: order, error } = await admin.from("orders").insert({
      user_id: user.id,
      product_id: product.id,
      product_type: product.type,
      amount_usd: product.priceUsd,
      amount_rmb: product.priceRmb,
      status: "pending",
      provider: "alipay",
      ...(typeof submissionId === "string" ? { submission_id: submissionId } : {}),
      ...(submissionName ? { submission_name: submissionName } : {}),
    }).select().single();
    if (error || !order) return NextResponse.json({ error: "创建订单失败" }, { status: 500 });

    const outTradeNo = `LX${order.id.replace(/-/g, "")}`.slice(0, 64);
    const baseUrl = alipaySiteUrl();
    const destination = typeof returnPath === "string" && returnPath.startsWith("/")
      ? returnPath
      : "/account/orders";
    try {
      const userAgent = req.headers.get("user-agent") ?? "";
      const mobile = /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);
      const paymentUrl = createAlipayPaymentUrl({
        outTradeNo,
        amountRmb: product.priceRmb,
        subject: `灵犀场 · ${product.name}`,
        notifyUrl: `${baseUrl}/api/pay/alipay/notify`,
        returnUrl: `${baseUrl}/api/pay/alipay/return?orderId=${order.id}&dest=${encodeURIComponent(destination)}`,
        mobile,
      });
      await admin.from("orders").update({ provider_payment_id: outTradeNo }).eq("id", order.id);
      return NextResponse.json({ orderId: order.id, url: paymentUrl });
    } catch (gatewayError) {
      console.error("[alipay create] failed", { orderId: order.id, gatewayError });
      await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: "支付宝收银台初始化失败" }, { status: 500 });
    }
  } catch (error) {
    console.error("[alipay create] unexpected failure", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
