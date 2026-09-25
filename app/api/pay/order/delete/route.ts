import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) {
    return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  let body: { orderId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "请求格式有误" }, { status: 400 }); }
  if (!body.orderId) return NextResponse.json({ error: "缺少订单ID" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("orders").delete()
    .eq("id", body.orderId).eq("user_id", user.id).neq("status", "paid");

  if (error) {
    console.error("[pay/order/delete] 删除失败:", error, "order id:", body.orderId);
    return NextResponse.json({ error: "删除失败，请稍后再试" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
