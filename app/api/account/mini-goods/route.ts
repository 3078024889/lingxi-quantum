import { NextRequest, NextResponse } from "next/server";
import { moneyAdministrator } from "@/lib/money/operator-settings";
import { isSameOriginMutation } from "@/lib/sasi/request-security";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkRateLimit } from "@/lib/rate-limit";
import { MINI_TOOL_GOODS, MINI_TOPUP_GOODS } from "@/lib/mini/tool-goods-catalog";
import { uploadVirtualGood, queryVirtualGoodsUpload } from "@/lib/mini/xpay";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
const goods = [...MINI_TOOL_GOODS, ...MINI_TOPUP_GOODS];
export async function GET() {
  if (!await moneyAdministrator()) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const result = await createAdminClient().from("wechat_mini_payment_events").select("out_trade_no,payload")
    .eq("event_type", "virtual_goods_upload_result").eq("handled", true);
  if (result.error) return NextResponse.json({ error: "道具状态暂不可用" }, { status: 503 });
  return NextResponse.json({ goods, completed: (result.data ?? []).map(row => row.out_trade_no) }, { headers: { "Cache-Control": "private, no-store" } });
}
export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: "INVALID_REQUEST_ORIGIN" }, { status: 403 });
  const user = await moneyAdministrator();
  if (!user) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (!await checkRateLimit(`mini-goods-admin:${user.id}`, 400, 3600)) return NextResponse.json({ error: "请稍后继续" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const item = goods.find(row => row.skuId === body?.skuId);
  if (!item || !["create", "status"].includes(body?.action)) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  const admin = createAdminClient();
  try {
    if (body.action === "create") {
      const already = await admin.from("wechat_mini_payment_events").select("id").eq("event_type", "virtual_goods_upload_result")
        .eq("out_trade_no", item.skuId).eq("transaction_id", "production").eq("handled", true).maybeSingle();
      if (already.error) throw new Error("STATE_READ_FAILED");
      if (already.data) return NextResponse.json({ done: true });
      // Check the global upload task before starting another item.
      const pending = await queryVirtualGoodsUpload();
      if (pending.status === 1) return NextResponse.json({ pending: true }, { status: 409 });
      await uploadVirtualGood(item);
      const saved = await admin.from("wechat_mini_payment_events").upsert({ event_type: "virtual_goods_upload_requested", out_trade_no: item.skuId,
        transaction_id: "production", payload: { ...item, requestedBy: user.id }, handled: true }, { onConflict: "event_type,out_trade_no,transaction_id" });
      if (saved.error) throw new Error("STATE_SAVE_FAILED");
      return NextResponse.json({ pending: true });
    }
    const result = await queryVirtualGoodsUpload();
    const actual = result.upload_item?.find(row => row.id === item.skuId);
    const done = Boolean(actual && [1, 2].includes(actual.upload_status) && actual.price === item.unitPriceFen && actual.name === item.name);
    if (done) {
      const saved = await admin.from("wechat_mini_payment_events").upsert({ event_type: "virtual_goods_upload_result", out_trade_no: item.skuId,
        transaction_id: "production", payload: actual, handled: true }, { onConflict: "event_type,out_trade_no,transaction_id" });
      if (saved.error) throw new Error("STATE_SAVE_FAILED");
    }
    return NextResponse.json({ done, pending: result.status === 1, status: result.status, item: actual });
  } catch (error) {
    const code = error instanceof Error && /^MINI_(XPAY|TOKEN)_\d+$/.test(error.message) ? error.message : "MINI_GOODS_UNAVAILABLE";
    return NextResponse.json({ error: "微信道具配置尚未完成，请稍后重试", code }, { status: 503 });
  }
}
