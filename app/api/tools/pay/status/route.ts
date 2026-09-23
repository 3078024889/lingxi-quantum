import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recoverToolQuotePayment } from "@/lib/tools/payment-recovery";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const quoteId = new URL(req.url).searchParams.get("quoteId");
  if (!quoteId) return NextResponse.json({ error: "缺少quoteId" }, { status: 400 });

  const result = await recoverToolQuotePayment({ userId: user.id, quoteId });
  if (!result.ok && result.error === "QUOTE_NOT_FOUND") {
    return NextResponse.json({ error: "报价不存在" }, { status: 404 });
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
