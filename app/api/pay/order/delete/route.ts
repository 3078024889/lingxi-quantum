import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// v253：待确认订单列表里加了删除功能，方便清理反复尝试、始终没付款
// 的订单记录。只允许删自己名下、状态不是paid的订单——已经付过款的
// 订单，任何情况下都不能被删除，这是硬性底线，不用参数传进来决定，
// 直接写死在查询条件里，防止未来任何调用方式的疏漏导致误删真实的
// 付费记录。
export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求格式有误" }, { status: 400 });
  }
  if (!body.orderId) return NextResponse.json({ error: "缺少订单ID" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .delete()
    .eq("id", body.orderId)
    .eq("user_id", user.id)
    .neq("status", "paid");

  if (error) {
    console.error("[pay/order/delete] 删除失败:", error, "order id:", body.orderId);
    return NextResponse.json({ error: "删除失败，请稍后再试" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
