import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireMiniSession } from "@/lib/mini/session";
import { readUnifiedBalanceSnapshot } from "@/lib/money/unified-balance";
export const runtime = "nodejs";
export async function GET(req: Request) {
  const session = await requireMiniSession(req);
  if (!session) return NextResponse.json({ error: "登录状态已失效" }, { status: 401 });
  try {
    const admin = createAdminClient();
    const {data: account, error: accountError} = await admin.auth.admin.getUserById(session.userId);
    if (accountError || !account.user) throw new Error('MINI_ACCOUNT_IDENTITY_UNAVAILABLE');
    const email = account.user.email || '';
    const linked = session.accountConnected && Boolean(account.user.phone || (email && !email.endsWith('@mini.lingxifield.invalid')));
    const [wallet, orders] = await Promise.all([
      readUnifiedBalanceSnapshot(admin, session.userId),
      admin.from("orders").select("id,amount_rmb,status,created_at,paid_at").eq("user_id", session.userId)
        .eq("provider", "wechat_mini_virtual").like("product_id", "sasi-balance-%")
        .order("created_at", { ascending: false }).limit(10),
    ]);
    if (orders.error) throw new Error("MINI_ACCOUNT_UNAVAILABLE");
    return NextResponse.json({ linked, accountLabel: linked ? email || account.user.phone : '', balanceFen: linked ? wallet.CNY.availableMinor : 0,
      refundableFen: linked ? wallet.CNY.refundableMinor : 0, refundHoldFen: linked ? wallet.CNY.refundHoldMinor : 0,
      topups: linked ? orders.data || [] : [] }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error('[mini account summary]', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: "账户余额暂未加载，请重试" }, { status: 503 });
  }
}
