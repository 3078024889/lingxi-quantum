import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reverseAiTopup } from "@/lib/ai/refunds";
import { isSameOriginMutation } from "@/lib/sasi/request-security";

function allowed(email: string | null | undefined) {
  const raw = process.env.AI_REFUND_ADMIN_EMAILS || process.env.TOOL_ADMIN_EMAILS || "";
  const allow = raw.split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allow.includes(email.toLowerCase()));
}

export async function POST(req: NextRequest) {
  if(!isSameOriginMutation(req))return NextResponse.json({error:"INVALID_REQUEST_ORIGIN"},{status:403});
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  if (!allowed(user.email)) return NextResponse.json({ error: "无管理员权限" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const orderId = String(body.orderId || "").trim();
  const reason = String(body.reason || "chargeback").slice(0,200);
  if (!/^[0-9a-f-]{36}$/i.test(orderId)) return NextResponse.json({ error: "缺少 orderId" }, { status: 400 });

  try {
    const result = await reverseAiTopup(orderId, reason);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[reverse-ai-topup]", error instanceof Error?error.message:String(error));
    return NextResponse.json({ error: "充值撤销失败" }, { status: 500 });
  }
}
