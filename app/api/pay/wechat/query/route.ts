import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { queryWechatOrder } from "@/lib/wechatpay";
import { fulfillPaidOrder } from "@/lib/fulfill-order";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "缺少订单ID" }, { status: 400 });

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).single();
  if (!order || order.user_id !== user.id) {
    return NextResponse.json({ error: "找不到这笔订单" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ paid: true });
  }
  if (!order.provider_payment_id) {
    return NextResponse.json({ paid: false });
  }

  // 主动去微信那边问一下这笔订单到底付了没——不完全依赖webhook，webhook
  // 可能会因为网络原因延迟或者丢失，前端轮询这个接口，是给用户体验加
  // 一层保险，不会出现"明明扫码付完了、页面却一直转圈"这种情况。
  try {
    const { paid } = await queryWechatOrder(order.provider_payment_id);
    if (paid) {
      // v253：之前这里不管fulfillPaidOrder成不成功，都直接告诉前端
      // "已支付"，带用户跳转过去——这正是"钱到账了、页面也提示成功、
      // 内容却还是锁着"这个问题的最后一块拼图。现在必须解锁这一步真的
      // 成功了，才会告诉前端可以跳转；解锁失败的话，返回一个具体的
      // 错误原因，前端能看到、场域入口"待确认订单"里也还能重新点
      // 查询重试，不会假装成功。
      const result = await fulfillPaidOrder(orderId);
      if (!result.ok) {
        console.error("[wechat query] 微信确认已支付，但解锁写入失败:", result.error, "order id:", orderId);
        return NextResponse.json({ paid: false, unlockError: result.error || "解锁写入失败，请稍后重试或联系我们" });
      }
      return NextResponse.json({ paid: true });
    }
    return NextResponse.json({ paid: false });
  } catch (e) {
    console.error("[wechat query] 查询订单状态失败:", e, "order id:", orderId);
    return NextResponse.json({ paid: false });
  }
}
