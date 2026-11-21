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
    const identity = { linked, accountLabel: linked ? email || account.user.phone : '' };
    if (new URL(req.url).searchParams.get("view") === "identity") {
      return NextResponse.json(identity, { headers: { "Cache-Control": "private, no-store" } });
    }
    const [wallet, virtualOrders, jsapiOrders] = await Promise.all([
      readUnifiedBalanceSnapshot(admin, session.userId),
      admin.from("orders").select("id,amount_rmb,status,created_at,paid_at").eq("user_id", session.userId).is("user_deleted_at", null)
        .eq("provider", "wechat_mini_virtual").like("product_id", "sasi-balance-%")
        .order("created_at", { ascending: false }).limit(10),
      admin.from("orders").select("id,amount_rmb,status,created_at,paid_at").eq("user_id", session.userId).is("user_deleted_at", null)
        .eq("provider", "wechat").eq("channel", "mini-program").like("product_id", "sasi-balance-%")
        .order("created_at", { ascending: false }).limit(10),
    ]);
    if (virtualOrders.error || jsapiOrders.error) throw new Error("MINI_ACCOUNT_UNAVAILABLE");
    const topups = [...(virtualOrders.data || []), ...(jsapiOrders.data || [])]
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 10);
    return NextResponse.json({ ...identity, balanceFen: linked ? wallet.CNY.availableMinor : 0,
      refundableFen: linked ? wallet.CNY.refundableMinor : 0, refundHoldFen: linked ? wallet.CNY.refundHoldMinor : 0,
      topups: linked ? topups : [] }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error('[mini account summary]', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: "账户余额暂未加载，请重试" }, { status: 503 });
  }
}
