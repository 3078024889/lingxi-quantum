import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveAiRefund } from "@/lib/ai/refunds";
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
  const requestId = String(body.requestId || "").trim();
  const resolution = String(body.resolution || "") as "approved" | "rejected" | "completed";
  if (!/^[0-9a-f-]{36}$/i.test(requestId) || !["approved","rejected","completed"].includes(resolution)) {
    return NextResponse.json({ error: "参数无效" }, { status: 400 });
  }

  try {
    const result = await resolveAiRefund(
      requestId,
      resolution,
      body.providerRefundId ? String(body.providerRefundId).slice(0,200) : null,
      body.note ? String(body.note).slice(0,500) : null,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("[resolve-ai-refund]", error instanceof Error?error.message:String(error));
    return NextResponse.json({ error: "退款状态处理失败" }, { status: 500 });
  }
}
