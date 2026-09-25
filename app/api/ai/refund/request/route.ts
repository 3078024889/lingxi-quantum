import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId || "").trim();
  const amountFen = Math.round(Number(body.amountRmb) * 100);
  const note = String(body.note || "").slice(0, 500);

  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return NextResponse.json({ error: "请选择原充值订单" }, { status: 400 });
  if (!Number.isFinite(amountFen) || amountFen <= 0) {
    return NextResponse.json({ error: "退款金额无效" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("request_ai_refund", {
    p_user_id: user.id,
    p_order_id: orderId,
    p_amount_fen: amountFen,
    p_note: note || null,
  });

  if (error) {
    console.error("[request_ai_refund]", error.code);
    return NextResponse.json({ error: "退款申请创建失败" }, { status: 500 });
  }
  const result = data as { ok?: boolean; error?: string; requestId?: string } | null;
  if (!result?.ok) {
    const map: Record<string, string> = {
      ORDER_NOT_REFUNDABLE: "该订单当前不可申请退款。",
      NOT_AI_TOPUP: "该订单不是 AI 余额充值订单。",
      ORDER_REFUND_LIMIT: "申请金额超过该订单可退款范围。",
      INSUFFICIENT_UNUSED_PRINCIPAL: "当前未使用充值本金不足以申请该金额。",
      INVALID_AMOUNT: "退款金额无效。",
    };
    return NextResponse.json({ error: map[result?.error || ""] || "当前无法创建退款申请", code: result?.error }, { status: 409 });
  }
  return NextResponse.json({ ok: true, requestId: result.requestId });
}
