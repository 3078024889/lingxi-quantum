import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import { createWechatNativeOrder, wechatPayConfigured } from "@/lib/wechatpay";

const SUBMISSION_TABLE_BY_PRODUCT: Record<string, string> = {
  "life-map-report": "life_map_submissions",
  "relationship-resonance": "relationship_submissions",
  "qian-reading": "qian_submissions",
  "tarot-reading": "tarot_reading_submissions",
};

export async function POST(req: Request) {
  try {
    if (!wechatPayConfigured()) {
      return NextResponse.json(
        { error: "微信支付尚未配置完整（缺少商户号/密钥/证书这几个环境变量），暂时无法使用。" },
        { status: 503 }
      );
    }

    const { productId, submissionId } = await req.json();
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

    let submissionName: string | null = null;
    const submissionTable = SUBMISSION_TABLE_BY_PRODUCT[productId];
    if (typeof submissionId === "string" && submissionTable) {
      const isRelationship = submissionTable === "relationship_submissions";
      const { data: sub } = await admin
        .from(submissionTable)
        .select(isRelationship ? "name_a, name_b" : "name")
        .eq("id", submissionId)
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
        amount_rmb: product.priceRmb,
        status: "pending",
        provider: "wechat",
        ...(typeof submissionId === "string" ? { submission_id: submissionId } : {}),
        ...(submissionName ? { submission_name: submissionName } : {}),
      })
      .select()
      .single();
    if (orderErr || !order) {
      return NextResponse.json(
        { error: "创建订单失败", detail: orderErr ? `${orderErr.code}: ${orderErr.message}` : "写入后没有返回记录" },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lingxifield.com";
    // 微信支付要求商户订单号只能是数字、大小写字母、下划线，用我们自己的
    // order.id（uuid）会带短横线，不符合要求，这里做一个安全的转换。
    const outTradeNo = `LX${order.id.replace(/-/g, "")}`.slice(0, 32);
    // 微信支付金额单位是"分"，我们数据库里存的priceRmb是"元"，这里换算，
    // 用Math.round避免浮点数精度问题（比如68.1元算出来变成6809分而不是6810分）。
    const amountFen = Math.round(product.priceRmb * 100);

    try {
      const { codeUrl } = await createWechatNativeOrder({
        outTradeNo,
        description: `灵犀 · ${product.name}`.slice(0, 40), // 微信支付对商品描述有长度限制
        amountFen,
        notifyUrl: `${baseUrl}/api/pay/wechat/notify`,
      });

      await admin.from("orders").update({ provider_payment_id: outTradeNo }).eq("id", order.id);

      return NextResponse.json({ orderId: order.id, codeUrl, outTradeNo });
    } catch (e) {
      await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
      return NextResponse.json(
        { error: "微信支付网关返回异常", detail: e instanceof Error ? e.message : String(e) },
        { status: 502 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: "服务器错误", detail: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
