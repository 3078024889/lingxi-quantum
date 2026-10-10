import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { miniVirtualToolsEnabled } from "@/lib/mini/virtual-goods";
import { MINI_PAYMENT_PAUSED } from "@/lib/mini/payment-availability";
import { toolRuntimeStateLive } from "@/lib/tools/service-readiness";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  if (!miniVirtualToolsEnabled() || process.env.WECHAT_MINI_VPAY_ENV === "sandbox") return NextResponse.json(MINI_PAYMENT_PAUSED, { status: 503 });
  if (Number(req.headers.get("content-length")) > 8192) return NextResponse.json({ error: "请求过大" }, { status: 413 });
  if (!(await checkRateLimit(`mini-balance-ip:${getClientIp(req)}`, 30, 600))) return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  if (!(await checkRateLimit(`mini-balance-user:${session.userId}`, 12, 600))) return NextResponse.json({ error: "请稍后再试" }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  if (!UUID.test(String(body.quoteId ?? ""))) return NextResponse.json({ error: "请返回工具重新确认价格" }, { status: 400 });
  const admin = createAdminClient();
  const { data: quote, error } = await admin.from("tool_payment_quotes")
    .select("id,tool_id,currency").eq("id", body.quoteId).eq("user_id", session.userId).maybeSingle();
  if (error || !quote) return NextResponse.json({ error: "价格信息不存在" }, { status: 404 });
  if (quote.currency !== "CNY") return NextResponse.json({ error: "请返回工具重新确认人民币价格" }, { status: 409 });
  if (!(await toolRuntimeStateLive(quote.tool_id)).ready) return NextResponse.json({ error: "工具暂不可用，不会产生费用" }, { status: 503 });
  // Reuse the website transaction: quote lock, wallet debit and grant commit together.
  const result = await admin.rpc("pay_tool_quote_with_sasi_balance", { p_user_id: session.userId, p_quote_id: quote.id });
  if (result.error) return NextResponse.json({ error: "余额支付结果尚未确认，请查看订单后重试" }, { status: 503 });
  const paid = result.data as { ok?: boolean; paid?: boolean; error?: string } | null;
  if (!paid?.ok) return NextResponse.json({ ...paid, error: paid?.error === "SASI_BALANCE_INSUFFICIENT" ? "人民币可用余额不足，请充值或选择虚拟支付。" : "这次支付未完成，请查看订单或重新确认价格。" }, { status: paid?.error === "SASI_BALANCE_INSUFFICIENT" ? 402 : 409 });
  return NextResponse.json(paid, { headers: { "Cache-Control": "private, no-store" } });
}
