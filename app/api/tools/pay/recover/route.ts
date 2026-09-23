import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { recoverToolQuotePayment } from "@/lib/tools/payment-recovery";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const quoteId = String(body.quoteId ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(quoteId)) {
    return NextResponse.json({ error: "报价ID无效" }, { status: 400 });
  }

  return NextResponse.json(
    await recoverToolQuotePayment({ userId: user.id, quoteId }),
    { headers: { "Cache-Control": "no-store" } },
  );
}
