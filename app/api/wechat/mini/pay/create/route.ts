import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { productForMiniPurchase } from "@/lib/mini/catalog";
import { encryptMiniSecret } from "@/lib/mini/crypto";
import { requireMiniSession } from "@/lib/mini/session";
import { buildMiniVirtualPayment, miniVirtualPayConfigured } from "@/lib/mini/virtual-pay";
import { exchangeMiniCode } from "@/lib/mini/wechat";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  if (!miniVirtualPayConfigured()) return NextResponse.json({ error: "虚拟支付尚未完成服务端配置" }, { status: 503 });

  try {
    const body = (await req.json()) as { skuId?: unknown; productId?: unknown; code?: unknown; submissionId?: unknown };
    if (typeof body.skuId !== "string" || typeof body.productId !== "string" || typeof body.code !== "string") {
      return NextResponse.json({ error: "支付参数不完整" }, { status: 400 });
    }
    const product = productForMiniPurchase(body.skuId, body.productId);
    if (!product) return NextResponse.json({ error: "商品不存在" }, { status: 404 });

    // 每次支付前重新 wx.login，保证 signature 使用最新 session_key。
    const freshWxSession = await exchangeMiniCode(body.code);
    if (freshWxSession.openid !== session.openid) {
      return NextResponse.json({ error: "微信身份与登录状态不一致" }, { status: 403 });
    }
    const encryptedSessionKey = encryptMiniSecret(freshWxSession.sessionKey);
    const admin = createAdminClient();
    await admin.from("wechat_mini_identities").update({
      encrypted_session_key: encryptedSessionKey,
      unionid: freshWxSession.unionid,
      session_key_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("openid", session.openid);

    const submissionId = typeof body.submissionId === "string" ? body.submissionId : null;
    const { data: order, error } = await admin.from("orders").insert({
      user_id: session.userId,
      product_id: product.id,
      product_type: product.type,
      amount_usd: product.priceUsd,
      amount_rmb: product.priceRmb,
      status: "pending",
      provider: "wechat_mini_virtual",
      channel: "mini-program",
      ...(submissionId ? { submission_id: submissionId } : {}),
    }).select("id").single();
    if (error || !order) throw new Error(`Could not create order: ${error?.code}`);

    const outTradeNo = `LXM${order.id.replace(/-/g, "")}`.slice(0, 32);
    await admin.from("orders").update({ provider_payment_id: outTradeNo }).eq("id", order.id);
    const payment = buildMiniVirtualPayment({
      skuId: body.skuId,
      priceFen: Math.round(product.priceRmb * 100),
      outTradeNo,
      orderId: order.id,
      encryptedSessionKey,
    });
    return NextResponse.json({ orderId: order.id, payment });
  } catch (error) {
    console.error("[mini virtual pay] create failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "支付准备失败，请稍后重试" }, { status: 500 });
  }
}
