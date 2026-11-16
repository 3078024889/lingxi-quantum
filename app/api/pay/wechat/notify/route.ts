import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptWechatNotifyResource, isWechatNotifyTimestampFresh, verifyWechatNotifySignature, wechatAppId, wechatMerchantId } from "@/lib/wechatpay";

export const runtime = "nodejs";
export const maxDuration = 30;
import { fulfillPaidOrder } from "@/lib/fulfill-order";

// 微信支付服务器主动推送的支付结果通知——用户扫码付款成功之后，微信会
// 调这个接口告诉我们"这笔钱到账了"，不依赖用户浏览器还开不开着。这是
// 兜底路径，跟前端轮询（/api/pay/wechat/query）是两条独立的确认渠道，
// 谁先确认成功都行，fulfillPaidOrder 内部做了幂等处理，不会重复解锁。
//
// 这一版补上了平台公钥验签——先确认这条通知的签名真的能用微信支付
// 公钥验证通过，验不过直接拒绝处理，不再只靠"能不能正确解密"这一层
// 弱验证。
export async function POST(req: Request) {
  try {
    const declared = Number(req.headers.get("content-length") || 0);
    if (Number.isFinite(declared) && declared > 1024 * 1024) {
      return NextResponse.json({ code: "FAIL", message: "通知体过大" }, { status: 413 });
    }
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody, "utf8") > 1024 * 1024) {
      return NextResponse.json({ code: "FAIL", message: "通知体过大" }, { status: 413 });
    }
    const timestamp = req.headers.get("Wechatpay-Timestamp") ?? "";
    const nonce = req.headers.get("Wechatpay-Nonce") ?? "";
    const signature = req.headers.get("Wechatpay-Signature") ?? "";
    const serial = req.headers.get("Wechatpay-Serial") ?? "";

    // Reject stale or future-dated signed messages before parsing/decrypting them.
    // Refund callbacks already apply this same five-minute replay window.
    if (!isWechatNotifyTimestampFresh(timestamp, 300)) {
      return NextResponse.json({ code: "FAIL", message: "通知时间戳无效或已过期" }, { status: 401 });
    }

    const validSignature = verifyWechatNotifySignature({ timestamp, nonce, body: rawBody, signature, serial });
    if (!validSignature) {
      console.error("[wechat notify] 签名验证失败，拒绝处理这条通知");
      return NextResponse.json({ code: "FAIL", message: "签名验证失败" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const resource = body.resource;
    if (!resource) {
      return NextResponse.json({ code: "FAIL", message: "缺少resource字段" }, { status: 400 });
    }

    const decrypted = decryptWechatNotifyResource(resource);
    if (decrypted.trade_state !== "SUCCESS") {
      return NextResponse.json({ code: "SUCCESS", message: "成功" });
    }

    const outTradeNo = String(decrypted.out_trade_no ?? "");
    const admin = createAdminClient();
    const { data: order, error: orderError } = await admin
      .from("orders")
      .select("id,user_id,amount_rmb,provider,channel")
      .eq("provider_payment_id", outTradeNo)
      .maybeSingle();
    if (orderError || !order || order.provider !== "wechat") {
      console.error("[wechat notify] order lookup or provider check failed");
      return NextResponse.json({ code: "FAIL", message: "订单不存在或支付通道不匹配" }, { status: 404 });
    }

    const expectedAppId = order.channel === "mini-program"
      ? (process.env.WECHAT_MINI_APP_ID ?? "").trim()
      : wechatAppId();
    if (!expectedAppId || String(decrypted.appid ?? "") !== expectedAppId ||
        String(decrypted.mchid ?? "") !== wechatMerchantId()) {
      return NextResponse.json({ code: "FAIL", message: "商户身份校验失败" }, { status: 422 });
    }

    if (order.channel === "mini-program") {
      const { data: prepared, error: preparedError } = await admin.from("wechat_mini_payment_events")
        .select("payload")
        .eq("event_type", "mini_jsapi_topup_prepared")
        .eq("out_trade_no", outTradeNo)
        .eq("order_id", order.id)
        .eq("transaction_id", "prepay")
        .maybeSingle();
      const payload = prepared?.payload as any;
      const payerOpenid = String((decrypted as any)?.payer?.openid ?? "");
      const expectedMiniFen = Math.round(Number(order.amount_rmb) * 100);
      if (preparedError || !payload || payload.appid !== expectedAppId ||
          !payload.openid || payload.openid !== payerOpenid ||
          Number(payload.amountFen) !== expectedMiniFen ||
          String((decrypted as any).trade_type ?? "") !== "JSAPI") {
        console.error("[wechat notify] Mini Program payer identity or prepared order mismatch", { orderId: order.id });
        return NextResponse.json({ code: "FAIL", message: "小程序支付身份校验失败" }, { status: 422 });
      }
    }

    const paymentAmount = decrypted.amount as { total: number; currency: string } | undefined;
    const expectedFen = Math.round(Number(order.amount_rmb) * 100);
    if (!paymentAmount || paymentAmount.currency !== "CNY" || Number(paymentAmount.total) !== expectedFen) {
      console.error("[wechat notify] payment amount did not match local order", { orderId: order.id });
      return NextResponse.json({ code: "FAIL", message: "订单金额校验失败" }, { status: 422 });
    }
    const result = await fulfillPaidOrder(order.id,true)
    if (!result.ok) {
      console.error("[wechat notify] fulfillment failed", { orderId: order.id, error: result.error })
      return NextResponse.json({ code: "FAIL", message: "权益开通待重试" }, { status: 500 })
    }
    return NextResponse.json({ code: "SUCCESS", message: "成功" });
  } catch (e) {
    console.error("[wechat notify] 处理回调异常:", e);
    return NextResponse.json({ code: "FAIL", message: "处理异常" }, { status: 500 });
  }
}

