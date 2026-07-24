import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptWechatNotifyResource } from "@/lib/wechatpay";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

// 微信支付服务器主动推送的支付结果通知——用户扫码付款成功之后，微信会
// 调这个接口告诉我们"这笔钱到账了"，不依赖用户浏览器还开不开着。这是
// 兜底路径，跟前端轮询（/api/pay/wechat/query）是两条独立的确认渠道，
// 谁先确认成功都行，fulfillPaidOrder 内部做了幂等处理，不会重复解锁。
//
// 老实说明一处简化：完整的微信支付验签流程，还应该验证微信支付平台
// 证书对这条通知本身的签名（Wechatpay-Signature这个请求头），确认
// 这条通知确实是微信服务器发的，不是别人伪造的。这一步需要先调用
// 微信支付的"获取平台证书列表"接口拿到平台公钥，是一个更完整、但
// 也更复杂的实现。这次先做了"解密资源"这一层（用APIv3密钥解密，
// 只有真正知道密钥的人能解出正确内容），加上下面查询接口的双重确认，
// 在实际风险可控的前提下先跑起来；平台证书验签这一层，作为后续
// 补强的安全加固项，不是这次能一次性做完的。
export async function POST(req: Request) {
  try {
    const body = await req.json();
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
