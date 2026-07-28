import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptWechatNotifyResource, verifyWechatNotifySignature } from "@/lib/wechatpay";

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
    const rawBody = await req.text();
    const timestamp = req.headers.get("Wechatpay-Timestamp") ?? "";
    const nonce = req.headers.get("Wechatpay-Nonce") ?? "";
    const signature = req.headers.get("Wechatpay-Signature") ?? "";
    const serial = req.headers.get("Wechatpay-Serial") ?? "";

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
      // 不是"支付成功"这个状态，直接确认收到，不处理（微信支付也会推送
      // 关闭、退款这些状态的通知）。
      return NextResponse.json({ code: "SUCCESS", message: "成功" });
    }

    const outTradeNo = decrypted.out_trade_no;
    const admin = createAdminClient();
    const { data: order } = await admin
      .from("orders")
      .select("id")
      .eq("provider_payment_id", outTradeNo)
      .single();
    if (!order) {
      console.error("[wechat notify] 找不到对应的订单，out_trade_no:", outTradeNo);
      return NextResponse.json({ code: "FAIL", message: "订单不存在" }, { status: 404 });
    }

    await fulfillPaidOrder(order.id);
    return NextResponse.json({ code: "SUCCESS", message: "成功" });
  } catch (e) {
    console.error("[wechat notify] 处理回调异常:", e);
    return NextResponse.json({ code: "FAIL", message: "处理异常" }, { status: 500 });
  }
}

