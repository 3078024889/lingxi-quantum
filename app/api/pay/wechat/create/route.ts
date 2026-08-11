import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProduct } from "@/lib/plans";
import {
  createWechatNativeOrder,
  createWechatJsapiOrder,
  buildJsapiInvokeParams,
  wechatPayConfigured,
} from "@/lib/wechatpay";
import { exchangeCodeForOpenid, wechatOauthConfigured } from "@/lib/wechat-oauth";

// v240：默认的Vercel函数超时（不显式设置的话，Hobby档只有10秒）比
// 微信支付接口的真实响应时间更容易不够用——之前"Unexpected token '<'"
// 那个报错的真正原因，就是函数被平台自己在到达10秒时杀死，返回了
// 平台自己的HTML错误页，不是我们代码里任何一个catch块能拦住的。
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
    if (!wechatPayConfigured()) {
      return NextResponse.json(
        { error: "微信支付暂不可用，请稍后再试。" },
        { status: 503 }
      );
    }

    const { productId, submissionId, code, state } = await req.json();
    // code存在，说明前端是在微信内置浏览器里、已经走完静默授权拿到了
    // 微信的一次性code——这种场景走JSAPI（直接在微信里弹收银台），
    // 不再是Native扫码（微信自己的内置浏览器不允许自己弹二维码给自己
    // 扫，这正是"塔罗按钮按不动"的根因）。code不存在就还是原来的
    // Native扫码流程，不影响桌面/外部浏览器场景。
    const useJsapi = typeof code === "string" && code.length > 0;
    if (useJsapi) {
      const cookieStore = cookies();
      const expectedState = cookieStore.get("lingxi_wechat_oauth_state")?.value;
      if (!expectedState || typeof state !== "string" || state !== expectedState) {
        return NextResponse.json({ error: "微信授权状态已失效，请重新发起支付。" }, { status: 400 });
      }
      cookieStore.delete("lingxi_wechat_oauth_state");
    }
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
      // v225：同 pay/create 的修复，加上归属校验。
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
        { error: "创建订单失败" },
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
      if (useJsapi) {
        if (!wechatOauthConfigured()) {
          await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
          return NextResponse.json(
            { error: "微信网页授权暂不可用，请稍后再试。" },
            { status: 503 }
          );
        }
        const { openid } = await exchangeCodeForOpenid(code);
        const { prepayId } = await createWechatJsapiOrder({
          outTradeNo,
          description: ("Lingxi Field - " + product.name).slice(0, 40),
          amountFen,
          notifyUrl: `${baseUrl}/api/pay/wechat/notify`,
          openid,
        });
        const jsapi = buildJsapiInvokeParams(prepayId);

        await admin.from("orders").update({ provider_payment_id: outTradeNo }).eq("id", order.id);

        return NextResponse.json({ orderId: order.id, jsapi, outTradeNo });
      }

      const { codeUrl } = await createWechatNativeOrder({
        outTradeNo,
          description: ("Lingxi Field - " + product.name).slice(0, 40),
        amountFen,
        notifyUrl: `${baseUrl}/api/pay/wechat/notify`,
      });

      await admin.from("orders").update({ provider_payment_id: outTradeNo }).eq("id", order.id);

      return NextResponse.json({ orderId: order.id, codeUrl, outTradeNo });
    } catch (e) {
      await admin.from("orders").update({ status: "failed" }).eq("id", order.id);
      return NextResponse.json(
        { error: useJsapi ? "微信网页授权或JSAPI下单失败" : "微信支付网关返回异常"},
        { status: 500 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: "服务器错误"},
      { status: 500 }
    );
  }
}
