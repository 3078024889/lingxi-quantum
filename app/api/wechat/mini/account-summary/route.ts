import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { miniAccountLinked } from "@/lib/mini/account";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  try {
    const linked = await miniAccountLinked(session.userId);
    const admin = createAdminClient();
    const [wallet, orders] = await Promise.all([
      admin.from("sasi_wallets").select("available_points,reserved_points").eq("user_id", session.userId).maybeSingle(),
      admin.from("orders").select("id,amount_rmb,status,created_at,paid_at").eq("user_id", session.userId)
        .eq("provider", "wechat_mini_virtual").like("product_id", "sasi-balance-%")
        .order("created_at", { ascending: false }).limit(10),
    ]);
    if (wallet.error || orders.error) throw new Error("MINI_ACCOUNT_UNAVAILABLE");
    return NextResponse.json({ linked, balanceFen: Number(wallet.data?.available_points || 0),
      topups: orders.data || [] }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "账户余额暂未加载，请重试" }, { status: 503 });
  }
}
