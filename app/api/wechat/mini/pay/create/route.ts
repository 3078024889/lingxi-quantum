import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { productForMiniPurchase } from "@/lib/mini/catalog";
import { encryptMiniSecret } from "@/lib/mini/crypto";
import { requireMiniSession } from "@/lib/mini/session";
import { buildMiniVirtualPayment, miniVirtualPayConfigured } from "@/lib/mini/virtual-pay";
import { exchangeMiniCode } from "@/lib/mini/wechat";

export const runtime = "nodejs";
export const maxDuration = 15;

const MAX_BODY_BYTES = 8 * 1024;

function validText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= max;
}

export async function POST(req: Request) {
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: "支付服务暂未完成配置" }, { status: 503 });
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "支付请求内容过大" }, { status: 413 });
  }

  const clientIp = getClientIp(req);
  if (!(await checkRateLimit(`mini-pay-ip:${clientIp}`, 30, 600))) {
    return NextResponse.json({ error: "操作过于频繁，请稍后再试" }, { status: 429 });
  }

  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });

  if (!(await checkRateLimit(`mini-pay-user:${session.userId}`, 12, 600))) {
    return NextResponse.json({ error: "支付请求过于频繁，请稍后再试" }, { status: 429 });
  }

  if (!miniVirtualPayConfigured()) {
    return NextResponse.json({ error: "小程序内支付暂未开放" }, { status: 503 });
  }

  try {
    const body = (await req.json()) as {
      skuId?: unknown;
      productId?: unknown;
      code?: unknown;
      submissionId?: unknown;
    };

    if (
      !validText(body.skuId, 64) ||
      !validText(body.productId, 128) ||
      !validText(body.code, 256) ||
      (body.submissionId !== undefined && body.submissionId !== null && !validText(body.submissionId, 128))
    ) {
      return NextResponse.json({ error: "支付参数不完整" }, { status: 400 });
    }

    const product = productForMiniPurchase(body.skuId, body.productId);
    if (!product) {
      return NextResponse.json(
        { error: "这项内容已不在当前小程序购买目录，请从对应功能页继续。" },
        { status: 410 }
      );
    }
    if (product.priceRmb <= 0) {
      return NextResponse.json({ error: "该内容已免费开放，无需支付。" }, { status: 400 });
    }

    const freshWxSession = await exchangeMiniCode(body.code);
    if (freshWxSession.openid !== session.openid) {
      return NextResponse.json({ error: "微信身份与登录状态不一致" }, { status: 403 });
    }

    const encryptedSessionKey = encryptMiniSecret(freshWxSession.sessionKey);
    const admin = createAdminClient();
    const identityUpdate = await admin
      .from("wechat_mini_identities")
      .update({
        encrypted_session_key: encryptedSessionKey,
        unionid: freshWxSession.unionid,
        session_key_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("openid", session.openid);

    if (identityUpdate.error) {
      throw new Error(`Could not refresh mini identity: ${identityUpdate.error.code}`);
    }

    const submissionId = body.submissionId ?? null;
    const { data: order, error } = await admin
      .from("orders")
      .insert({
        user_id: session.userId,
        product_id: product.id,
        product_type: product.type,
        amount_usd: product.priceUsd,
        amount_rmb: product.priceRmb,
        status: "pending",
        provider: "wechat_mini_virtual",
        channel: "mini-program",
        ...(submissionId ? { submission_id: submissionId } : {}),
      })
      .select("id")
      .single();

    if (error || !order) throw new Error(`Could not create order: ${error?.code}`);

    const outTradeNo = `LXM${order.id.replace(/-/g, "")}`.slice(0, 32);
    const providerUpdate = await admin
      .from("orders")
      .update({ provider_payment_id: outTradeNo })
      .eq("id", order.id)
      .eq("status", "pending");

    if (providerUpdate.error) {
      throw new Error(`Could not bind provider payment id: ${providerUpdate.error.code}`);
    }

    const payment = buildMiniVirtualPayment({
      skuId: body.skuId,
      priceFen: Math.round(product.priceRmb * 100),
      outTradeNo,
      orderId: order.id,
      encryptedSessionKey,
    });

    return NextResponse.json({
      orderId: order.id,
      payment,
      sandbox: process.env.WECHAT_MINI_VPAY_ENV === "sandbox",
    });
  } catch (error) {
    console.error("[mini virtual pay] create failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "支付准备失败，请稍后重试" }, { status: 500 });
  }
}
